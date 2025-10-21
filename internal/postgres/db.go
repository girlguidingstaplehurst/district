package postgres

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"strings"
	"time"

	"github.com/girlguidingstaplehurst/district/internal/consts"
	"github.com/girlguidingstaplehurst/district/internal/rest"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/thanhpk/randstr"
)

var _ rest.Database = (*Database)(nil)

const (
	dbDateTimeFormat = `YYYY-MM-DD"T"HH24:MI:ss"Z"`
)

type Database struct {
	pool *pgxpool.Pool
}

func NewDatabase(pool *pgxpool.Pool) *Database {
	return &Database{pool: pool}
}

func (db *Database) AddEvent(ctx context.Context, event *rest.AddEventJSONRequestBody) error {
	if err := db.ensureContactExists(ctx, string(event.Contact.EmailAddress), event.Contact.Name); err != nil {
		return err
	}

	return pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, "lock table booking_events in share row exclusive mode")
		if err != nil {
			return errors.Join(err, errors.New("failed to lock table"))
		}

		err = db.checkForNearbyBookings(ctx, tx, event.Event.From, event.Event.To)
		if err != nil {
			return err
		}

		err = db.insertEvent(ctx, tx, event, consts.EventStatusProvisional, consts.RateDefault)
		if err != nil {
			return err
		}

		return nil
	})
}

func (db *Database) ensureContactExists(ctx context.Context, email, name string) error {
	// We only insert if the contact (identified by email) doesn't already exist - we don't update the name if the
	// record already exists.
	_, err := db.pool.Exec(ctx, `INSERT INTO booking_contacts (email, name) 
				SELECT $1, $2 WHERE NOT EXISTS(SELECT 1 FROM booking_contacts WHERE email=$1)`, email, name)
	if err != nil {
		return errors.Join(err, errors.New("failed to ensure contact exists"))
	}

	return nil
}

func (db *Database) insertEvent(ctx context.Context, tx pgx.Tx, event *rest.AddEventJSONRequestBody, status, rate string) error {
	_, err := tx.Exec(ctx, `insert into booking_events
			(id, event_start, event_end, event_name, visible, email, status, rate_id, details) 
			values($1, $2, $3, $4, $5, $6, $7, $8, $9)`, uuid.New(), event.Event.From, event.Event.To, event.Event.Name, event.Event.PubliclyVisible, event.Contact.EmailAddress, status, rate, event.Event.Details)
	if err != nil {
		return errors.Join(err, errors.New("failed to insert new booking"))
	}
	return nil
}

func (db *Database) checkForNearbyBookings(ctx context.Context, tx pgx.Tx, from, to string) error {
	rows, err := tx.Query(ctx, `select count(*) from booking_events 
			where (event_start - interval '30 minutes' <= $1 and event_end + interval '30 minutes' >= $1)
			or (event_start - interval '30 minutes' <= $2 and event_end + interval '30 minutes'>= $2)
			or (event_start - interval '30 minutes'>= $1 and event_end + interval '30 minutes' <= $2)`, from, to)
	if err != nil {
		return errors.Join(err, errors.New("failed to count existing overlapping bookings"))
	}

	count, err := pgx.CollectOneRow(rows, pgx.RowTo[int])
	if err != nil {
		return errors.Join(err, errors.New("failed to extract count of rows"))
	}

	if count > 0 {
		return consts.ErrBookingExists
	}
	return nil
}

func (db *Database) AddInvoice(ctx context.Context, invoice *rest.SendInvoiceBody) (*rest.Invoice, error) {
	inv := &rest.Invoice{
		Id:        uuid.New().String(),
		Reference: randstr.String(6, consts.ReferenceLetters),
		Contact:   invoice.Contact,
	}

	err := pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, `insert into booking_invoices (id, reference, contact) values($1, $2, $3)`, inv.Id, inv.Reference, inv.Contact)
		if err != nil {
			return errors.Join(err, errors.New("failed to insert new invoice"))
		}

		for _, item := range invoice.Items {
			id := uuid.New().String()
			i := rest.InvoiceItem{
				Id:          &id,
				Description: item.Description,
				Cost:        item.Cost,
				EventID:     item.EventID,
			}

			_, err := tx.Exec(ctx, `insert into booking_invoice_items 
    				(id, invoice_id, event_id, description, cost) 
					values($1, $2, $3, $4, $5)`, i.Id, inv.Id, i.EventID, i.Description, i.Cost)
			if err != nil {
				return errors.Join(err, errors.New("failed to insert invoice item"))
			}

			inv.Items = append(inv.Items, i)
		}

		return nil
	})

	return inv, err
}

func (db *Database) ListEvents(ctx context.Context, from, to time.Time) ([]rest.ListEvent, error) {
	rows, err := db.pool.Query(ctx, `select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status 
		from booking_events
		where (event_start >= $1 and event_start <= $2)
		or event_end >= $1 and event_end <= $2
		order by event_start, event_end, event_name`, from, to, dbDateTimeFormat)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.ListEvent, error) {
		var (
			event   rest.ListEvent
			visible bool
		)

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &visible, &event.Status); err != nil {
			return event, err
		}

		if !visible {
			event.Name = "Private Event"
		}

		return event, nil
	})
}

func (db *Database) ListEventsForContact(ctx context.Context, contactID string, from, to time.Time) ([]rest.ListEvent, error) {
	rows, err := db.pool.Query(ctx, `select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status 
		from booking_events
		where (
		    (event_start >= $1 and event_start <= $2) or (event_end >= $1 and event_end <= $2)
		)
		and email = $4
		order by event_start, event_end, event_name`, from, to, dbDateTimeFormat, contactID)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.ListEvent, error) {
		var (
			event   rest.ListEvent
			visible bool
		)

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &visible, &event.Status); err != nil {
			return event, err
		}

		if !visible {
			event.Name = "Private Event"
		}

		return event, nil
	})
}

func (db *Database) AdminListEvents(ctx context.Context, from, to time.Time) ([]rest.Event, error) {
	rows, err := db.pool.Query(ctx, `select id, to_char(event_start, $3), to_char(event_end, $3), event_name, visible, status, contact.name, contact.email, 
       		assignee, keyholder_in, keyholder_out
		from booking_events e
		JOIN booking_contacts contact ON e.email = contact.email 
		where (event_start >= $1 and event_start <= $2)
		or event_end >= $1 and event_end <= $2
		order by event_start, event_end, event_name`, from, to, dbDateTimeFormat)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Event, error) {
		var event rest.Event

		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status, &event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut); err != nil {
			return event, err
		}

		return event, nil
	})
}

func (db *Database) GetEvent(ctx context.Context, id string) (rest.Event, error) {
	row := db.pool.QueryRow(ctx, `select id, to_char(event_start, $2), to_char(event_end, $2), event_name, visible, status, contact.name, contact.email, 
       		assignee, keyholder_in, keyholder_out, rate_id, details
		from booking_events e
		JOIN booking_contacts contact ON e.email = contact.email
		where id = $1`, id, dbDateTimeFormat)

	var event rest.Event
	if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Visible, &event.Status, &event.Contact, &event.Email, &event.Assignee, &event.KeyholderIn, &event.KeyholderOut, &event.RateID, &event.Details); err != nil {
		return event, err
	}

	rows, err := db.pool.Query(ctx, `select distinct(bi.id), bi.reference, bi.status, bi.sent, bi.paid	
		from booking_invoices bi
		right join public.booking_invoice_items bii on bi.id = bii.invoice_id
		where bii.event_id = $1`, id)
	if err != nil {
		return event, err
	}

	invoiceRefs, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.InvoiceRef, error) {
		var ir rest.InvoiceRef
		if err := row.Scan(&ir.Id, &ir.Reference, &ir.Status, &ir.Sent, &ir.Paid); err != nil {
			return ir, err
		}

		return ir, nil
	})

	event.Invoices = &invoiceRefs

	return event, nil
}

func (db *Database) MarkInvoiceSent(ctx context.Context, id string) error {
	_, err := db.pool.Exec(ctx, "update booking_invoices set sent = $1 where id = $2", time.Now(), id)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) GetInvoiceEvents(ctx context.Context, ids ...string) ([]rest.DBInvoiceEvent, error) {
	var idPlaceholders []string
	var ne []any
	for i, id := range ids {
		idPlaceholders = append(idPlaceholders, fmt.Sprintf("$%d", i+1))
		ne = append(ne, id)
	}

	join := strings.Join(idPlaceholders, ",")

	rows, err := db.pool.Query(ctx, `select be.id, 
			to_char(be.event_start, '`+dbDateTimeFormat+`'), 
			to_char(be.event_end, '`+dbDateTimeFormat+`'), 
			be.event_name, be.status, be.email, 
       		br.hourly_rate::numeric::decimal, br.discount_table
		from booking_events be
		join booking_rates br on be.rate_id = br.id
		where be.id in (`+join+`)
		order by be.email, be.event_name, be.event_start`, ne...)
	if err != nil {
		return nil, err
	}

	slog.Info("dumping rows", "rows", rows)

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.DBInvoiceEvent, error) {
		slog.Info("dumping row", "row", row)
		var event rest.DBInvoiceEvent
		if err := row.Scan(&event.Id, &event.From, &event.To, &event.Name, &event.Status, &event.Email, &event.Rate, &event.DiscountTable); err != nil {
			return event, err
		}

		return event, nil
	})
}

func (db *Database) GetInvoiceByID(ctx context.Context, id string) (rest.Invoice, error) {
	row := db.pool.QueryRow(ctx, `select id, reference, contact, to_char(sent, $2), to_char(paid, $2), status
		from booking_invoices
		where id = $1`, id, dbDateTimeFormat)

	var invoice rest.Invoice
	if err := row.Scan(&invoice.Id, &invoice.Reference, &invoice.Contact, &invoice.Sent, &invoice.Paid, &invoice.Status); err != nil {
		return invoice, err
	}

	rows, err := db.pool.Query(ctx, `select id, event_id, description, cost::numeric::decimal
		from booking_invoice_items
		where invoice_id = $1`, id)
	if err != nil {
		return invoice, err
	}

	items, err := pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.InvoiceItem, error) {
		var item rest.InvoiceItem
		if err := row.Scan(&item.Id, &item.EventID, &item.Description, &item.Cost); err != nil {
			return item, err
		}

		return item, nil
	})

	invoice.Items = items

	return invoice, nil
}

func (db *Database) MarkInvoicePaid(ctx context.Context, id string) error {
	_, err := db.pool.Exec(ctx, "update booking_invoices set paid = $1, status = 'paid' where id = $2", time.Now(), id)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) GetRates(ctx context.Context) ([]rest.Rate, error) {
	rows, err := db.pool.Query(ctx, `select id, description, hourly_rate::numeric::decimal, discount_table
		from booking_rates
		order by id`)
	if err != nil {
		return nil, err
	}

	return pgx.CollectRows(rows, func(row pgx.CollectableRow) (rest.Rate, error) {
		var rate rest.Rate
		if err := row.Scan(&rate.Id, &rate.Description, &rate.HourlyRate, &rate.DiscountTable); err != nil {
			return rate, err
		}

		return rate, nil
	})
}

func (db *Database) SetRate(ctx context.Context, eventID string, rate string) error {
	_, err := db.pool.Exec(ctx, "update booking_events set rate_id = $1 where id = $2", rate, eventID)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) SetEventStatus(ctx context.Context, eventID string, status string) error {
	_, err := db.pool.Exec(ctx, "update booking_events set status = $1 where id = $2", status, eventID)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) AddEvents(ctx context.Context, event rest.AdminAddEventsRequestObject) error {
	return pgx.BeginFunc(ctx, db.pool, func(tx pgx.Tx) error {
		_, err := tx.Exec(ctx, "lock table booking_events in share row exclusive mode")
		if err != nil {
			return errors.Join(err, errors.New("failed to lock table"))
		}

		for _, instance := range event.Body.Event.Instances {
			evt := &rest.NewEvent{
				Contact: struct {
					EmailAddress openapi_types.Email `json:"email_address"`
					Name         string              `json:"name"`
				}{
					EmailAddress: event.Body.Contact.EmailAddress,
					Name:         event.Body.Contact.Name,
				},
				Event: struct {
					Details         string `json:"details"`
					From            string `json:"from"`
					Name            string `json:"name"`
					PubliclyVisible bool   `json:"publicly_visible"`
					To              string `json:"to"`
				}{
					Name:            event.Body.Event.Name,
					Details:         event.Body.Event.Details,
					From:            instance.From,
					To:              instance.To,
					PubliclyVisible: event.Body.Event.PubliclyVisible,
				},
			}

			err = db.ensureContactExists(ctx, string(event.Body.Contact.EmailAddress), event.Body.Contact.Name)
			if err != nil {
				rberr := tx.Rollback(ctx)
				if rberr != nil {
					err = errors.Join(err, rberr)
				}

				return err
			}

			err = db.checkForNearbyBookings(ctx, tx, instance.From, instance.To)
			if err != nil {
				return err
			}

			err = db.insertEvent(ctx, tx, evt, event.Body.Event.Status, event.Body.Event.Rate)
			if err != nil {
				return err
			}
		}

		return nil
	})
}
