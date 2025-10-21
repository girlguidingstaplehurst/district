package rest

import (
	"context"
	"errors"
	"io"
	"strings"
	"time"

	"github.com/arran4/golang-ical"
	"github.com/girlguidingstaplehurst/district/internal/consts"
	"github.com/google/uuid"
	openapi_types "github.com/oapi-codegen/runtime/types"
	"github.com/shopspring/decimal"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

//go:generate go run go.uber.org/mock/mockgen -source server.go -destination mock/server.go

//TODO consider breaking this into a REST adapter and a core struct - is a little muddled right now.

var _ StrictServerInterface = (*Server)(nil)

type Database interface {
	AddEvent(ctx context.Context, event *AddEventJSONRequestBody) error
	AddEvents(ctx context.Context, event AdminAddEventsRequestObject) error
	AddInvoice(ctx context.Context, invoice *SendInvoiceBody) (*Invoice, error)
	GetEvent(ctx context.Context, id string) (Event, error)
	GetInvoiceEvents(ctx context.Context, ids ...string) ([]DBInvoiceEvent, error)
	GetInvoiceByID(ctx context.Context, id string) (Invoice, error)
	GetRates(ctx context.Context) ([]Rate, error)
	ListEvents(ctx context.Context, from, to time.Time) ([]ListEvent, error)
	ListEventsForContact(ctx context.Context, contactID string, from, to time.Time) ([]ListEvent, error)
	AdminListEvents(ctx context.Context, from, to time.Time) ([]Event, error)
	MarkInvoiceSent(ctx context.Context, id string) error
	MarkInvoicePaid(ctx context.Context, id string) error
	SetEventStatus(Ctx context.Context, eventID string, state string) error
	SetRate(ctx context.Context, eventID string, rate string) error
}

type DBInvoiceItem struct {
	ID          uuid.UUID
	EventID     uuid.UUID
	Description string
	Cost        decimal.Decimal
}

type PDFGenerator interface {
	GenerateInvoice(ctx context.Context, invoice *Invoice) (io.Reader, error)
	GeneratePageContent(ctx context.Context, key string) (io.Reader, error)
}

type EmailSender interface {
	Send(ctx context.Context, to string, subject string, body string, attachments ...EmailAttachment) error
	SendWithAttachments(ctx context.Context, to string, subject string, body string, attachments ...EmailAttachment) error
}

type CaptchaVerifier interface {
	Verify(ctx context.Context, token string, ip string) error
}

type ContentManager interface {
	Email(ctx context.Context, key string) (EmailContent, error)
	EmailTemplate(ctx context.Context, key string, vars map[string]any) (EmailContent, error)
}

type EmailContent struct {
	Subject string
	Body    string
}

type EmailAttachment struct {
	Filename string
	Mimetype string
	Content  io.Reader
}

type Server struct {
	db      Database
	pdf     PDFGenerator
	email   EmailSender
	captcha CaptchaVerifier
	content ContentManager
}

func NewServer(db Database, pdf PDFGenerator, email EmailSender, captcha CaptchaVerifier, content ContentManager) *Server {
	return &Server{
		db:      db,
		pdf:     pdf,
		email:   email,
		captcha: captcha,
		content: content,
	}
}

func (s *Server) AddEvent(ctx context.Context, req AddEventRequestObject) (AddEventResponseObject, error) {
	//TODO validate

	ip, ok := UserIPFromContext(ctx)
	if !ok {
		return AddEvent500JSONResponse{ErrorMessage: "no ip found in context"}, nil
	}

	err := s.captcha.Verify(ctx, req.Body.CaptchaToken, ip)
	if err != nil {
		span := trace.SpanFromContext(ctx)
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())

		return AddEvent500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	if !req.Body.PrivacyPolicy {
		return AddEvent422JSONResponse{ErrorMessage: "privacy policy was not ticked"}, nil
	}
	if !req.Body.TermsOfHire {
		return AddEvent422JSONResponse{ErrorMessage: "terms of hire was not ticked"}, nil
	}
	if !req.Body.CleaningAndDamage {
		return AddEvent422JSONResponse{ErrorMessage: "cleaning and damage policy was not ticked"}, nil
	}
	if !req.Body.CarParking {
		return AddEvent422JSONResponse{ErrorMessage: "car parking policy was not ticked"}, nil
	}
	if !req.Body.Adhesives {
		return AddEvent422JSONResponse{ErrorMessage: "adhesives policy was not ticked"}, nil
	}

	if err := s.db.AddEvent(ctx, req.Body); err != nil {
		span := trace.SpanFromContext(ctx)
		span.RecordError(err)
		span.SetStatus(codes.Error, err.Error())

		if errors.Is(err, consts.ErrBookingExists) {
			return AddEvent409JSONResponse{
				ErrorMessage: err.Error(),
			}, nil
		}
		return AddEvent500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AddEvent200Response{}, nil
}

func (s *Server) getAllEvents(ctx context.Context, from, to *openapi_types.Date, contactID *string) ([]ListEvent, error) {
	if (from != nil && to == nil) ||
		(from == nil && to != nil) {
		return nil, errors.New("if restricting by date, both from and to must be specified")
	}

	if from == nil && to == nil {
		// Get start date of this month
		now := time.Now()
		y, m, _ := now.Date()
		loc := now.Location()

		from = &openapi_types.Date{
			Time: time.Date(y, m, 1, 0, 0, 0, 0, loc),
		}
		// Default range is the full 18-month period
		to = &openapi_types.Date{
			Time: from.Time.AddDate(0, 18, -1),
		}
	}

	if contactID != nil {
		return s.db.ListEventsForContact(ctx, *contactID, from.Time, to.Time)
	}

	return s.db.ListEvents(ctx, from.Time, to.Time)
}

func (s *Server) GetApiV1Events(ctx context.Context, request GetApiV1EventsRequestObject) (GetApiV1EventsResponseObject, error) {
	//TODO validate

	events, err := s.getAllEvents(ctx, request.Params.From, request.Params.To, nil)
	if err != nil {
		return GetApiV1Events500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return GetApiV1Events200JSONResponse{
		Events: events,
	}, nil
}

func (s *Server) GetApiV1AdminEvents(ctx context.Context, request GetApiV1AdminEventsRequestObject) (GetApiV1AdminEventsResponseObject, error) {
	if request.Params.From == nil && request.Params.To == nil {
		// Get start date of this month
		now := time.Now()
		y, m, _ := now.Date()
		loc := now.Location()

		request.Params.From = &openapi_types.Date{
			Time: time.Date(y, m, 1, 0, 0, 0, 0, loc),
		}
		// Default range is the full 18-month period
		request.Params.To = &openapi_types.Date{
			Time: request.Params.From.Time.AddDate(0, 18, -1),
		}
	}

	events, err := s.db.AdminListEvents(ctx, request.Params.From.Time, request.Params.To.Time)
	if err != nil {
		return GetApiV1AdminEvents500JSONResponse{ErrorMessage: err.Error()}, nil
	}

	return GetApiV1AdminEvents200JSONResponse{
		Events: events,
	}, nil
}

func (s *Server) GetApiV1AdminEventsEventID(ctx context.Context, request GetApiV1AdminEventsEventIDRequestObject) (GetApiV1AdminEventsEventIDResponseObject, error) {
	event, err := s.db.GetEvent(ctx, request.EventID)
	if err != nil {
		//TODO handle not found
		return GetApiV1AdminEventsEventID500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}
	return GetApiV1AdminEventsEventID200JSONResponse(event), nil
}

func (s *Server) AdminSendInvoice(ctx context.Context, request AdminSendInvoiceRequestObject) (AdminSendInvoiceResponseObject, error) {
	//TODO validation

	invoice, err := s.db.AddInvoice(ctx, request.Body)
	if err != nil {
		//TODO handle not found error here with 404
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	pdf, err := s.pdf.GenerateInvoice(ctx, invoice)
	if err != nil {
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	emailContent, err := s.content.Email(ctx, "klgc-booking-email")
	if err != nil {
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	//TODO consider if we need to attach more files here - may want to be configurable?
	err = s.email.SendWithAttachments(ctx, string(invoice.Contact), emailContent.Subject, emailContent.Body,
		EmailAttachment{Filename: "invoice.pdf", Content: pdf, Mimetype: "application/pdf"})
	if err != nil {
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	err = s.db.MarkInvoiceSent(ctx, invoice.Id)
	if err != nil {
		//TODO is this right, or do we need a special-case?
		return AdminSendInvoice500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminSendInvoice200Response{}, nil
}

type DBInvoiceEvent struct {
	InvoiceEvent
	Email string
}

func (s *Server) AdminGetInvoicesForEvents(ctx context.Context, request AdminGetInvoicesForEventsRequestObject) (AdminGetInvoicesForEventsResponseObject, error) {
	eventIDs := strings.Split(request.Params.Events[0], ",")

	events, err := s.db.GetInvoiceEvents(ctx, eventIDs...)
	if err != nil {
		return AdminGetInvoicesForEvents500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	eventsByEmail := make(AdminGetInvoicesForEvents200JSONResponse)
	for _, event := range events {
		if eventsByEmail[event.Email] == nil {
			eventsByEmail[event.Email] = make([]InvoiceEvent, 0)
		}

		eventsByEmail[event.Email] = append(eventsByEmail[event.Email], event.InvoiceEvent)
	}

	return eventsByEmail, nil
}

func (s *Server) AdminGetInvoiceByID(ctx context.Context, request AdminGetInvoiceByIDRequestObject) (AdminGetInvoiceByIDResponseObject, error) {
	invoice, err := s.db.GetInvoiceByID(ctx, request.InvoiceID)
	if err != nil {
		return AdminGetInvoiceByID500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminGetInvoiceByID200JSONResponse(invoice), nil
}

func (s *Server) AdminMarkInvoicePaid(ctx context.Context, request AdminMarkInvoicePaidRequestObject) (AdminMarkInvoicePaidResponseObject, error) {
	err := s.db.MarkInvoicePaid(ctx, request.InvoiceID)
	if err != nil {
		return AdminMarkInvoicePaid500JSONResponse{ErrorMessage: err.Error()}, nil
	}

	return AdminMarkInvoicePaid200Response{}, nil
}

func (s *Server) AdminGetRates(ctx context.Context, _ AdminGetRatesRequestObject) (AdminGetRatesResponseObject, error) {
	rates, err := s.db.GetRates(ctx)
	if err != nil {
		return AdminGetRates500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminGetRates200JSONResponse(rates), nil
}

func (s *Server) AdminEventSetRate(ctx context.Context, request AdminEventSetRateRequestObject) (AdminEventSetRateResponseObject, error) {
	err := s.db.SetRate(ctx, request.EventID, request.Body.Rate)
	if err != nil {
		return AdminEventSetRate500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminEventSetRate200Response{}, nil
}

const emailDateFormat = "Mon Jan _2 2006"

func (s *Server) AdminEventRequestDocuments(ctx context.Context, request AdminEventRequestDocumentsRequestObject) (AdminEventRequestDocumentsResponseObject, error) {
	//TODO check we're in the right state before sending
	event, err := s.db.GetEvent(ctx, request.EventID)
	if err != nil {
		//TODO not found handling
		return AdminEventRequestDocuments500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	var documents []string
	if request.Body.CoshhSheets {
		documents = append(documents, "COSHH Safety Data Sheets")
	}
	if request.Body.FoodSafety {
		documents = append(documents, "Food Hygiene Certificate")
	}
	if request.Body.DbsCertificate {
		documents = append(documents, "DBS Certificate")
	}
	if request.Body.PublicLiability {
		documents = append(documents, "Public Liability Insurance Certificate")
	}
	if request.Body.RiskAssessment {
		documents = append(documents, "Risk Assessment")
	}

	//TODO avoid the panic
	start, err := time.Parse(time.RFC3339, event.From)
	if err != nil {
		panic(err)
	}

	emailContent, err := s.content.EmailTemplate(ctx, "request-for-additional-documents", map[string]any{
		"event":     event,
		"documents": documents,
		"deadline":  start.Add(-14 * 24 * time.Hour).Format(emailDateFormat),
		"date":      start.Format(emailDateFormat),
	})
	if err != nil {
		return AdminEventRequestDocuments500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	err = s.email.SendWithAttachments(ctx, string(event.Email), emailContent.Subject, emailContent.Body)
	if err != nil {
		return AdminEventRequestDocuments500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	err = s.db.SetEventStatus(ctx, request.EventID, consts.EventStatusAwaitingDocuments)
	if err != nil {
		return AdminEventRequestDocuments500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminEventRequestDocuments200Response{}, nil
}

func (s *Server) AdminEventApprove(ctx context.Context, request AdminEventApproveRequestObject) (AdminEventApproveResponseObject, error) {
	//TODO check we're in the right state before sending
	event, err := s.db.GetEvent(ctx, request.EventID)
	if err != nil {
		//TODO not found handling
		return AdminEventApprove500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	termsOfHire, err := s.pdf.GeneratePageContent(ctx, "terms-of-hire")
	if err != nil {
		return AdminEventApprove500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	cleaningAndDamagePolicy, err := s.pdf.GeneratePageContent(ctx, "cleaning-and-damage-policy")
	if err != nil {
		return AdminEventApprove500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	//TODO avoid the panic
	start, err := time.Parse(time.RFC3339, event.From)
	if err != nil {
		panic(err)
	}

	emailContent, err := s.content.EmailTemplate(ctx, "booking-confirmed", map[string]any{
		"event": event,
		"date":  start.Format(emailDateFormat),
	})
	if err != nil {
		return AdminEventApprove500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	//TODO avoid the panic
	end, err := time.Parse(time.RFC3339, event.To)
	if err != nil {
		panic(err)
	}

	cal := ics.NewCalendar()
	cal.SetProductId("//KLGC//Booking Service//EN")
	cal.SetVersion("2.0")
	cal.SetMethod(ics.MethodPublish)
	calEvent := cal.AddEvent(event.Id)
	calEvent.SetCreatedTime(time.Now())
	calEvent.SetDtStampTime(time.Now())
	calEvent.SetModifiedAt(time.Now())
	calEvent.SetStartAt(start)
	calEvent.SetEndAt(end)
	calEvent.SetSummary(event.Name)
	calEvent.SetDescription("Booking at the Kathie Lamb Guide Centre")
	calEvent.SetLocation("Kathie Lamb Guide Centre, Jubilee Field, Headcorn Road, Staplehurst, Kent, TN12 0DS")
	calEvent.SetOrganizer("bookings@kathielambcentre.org")

	err = s.email.SendWithAttachments(ctx, string(event.Email), emailContent.Subject, emailContent.Body,
		EmailAttachment{Filename: "terms-of-hire.pdf", Content: termsOfHire, Mimetype: "application/pdf"},
		EmailAttachment{Filename: "cleaning-and-damage-policy.pdf", Content: cleaningAndDamagePolicy, Mimetype: "application/pdf"},
		EmailAttachment{Filename: "calendar.ics", Content: strings.NewReader(cal.Serialize()), Mimetype: "text/calendar"},
	)
	if err != nil {
		return AdminEventApprove500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	err = s.db.SetEventStatus(ctx, request.EventID, consts.EventStatusApproved)
	if err != nil {
		//TODO handle not found (probably handled earlier)
		return AdminEventApprove500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminEventApprove200Response{}, nil
}

func (s *Server) AdminEventCancel(ctx context.Context, request AdminEventCancelRequestObject) (AdminEventCancelResponseObject, error) {
	//TODO add more cleanup to cancel - there's a lot more that we can probably do here.

	err := s.db.SetEventStatus(ctx, request.EventID, consts.EventStatusCancelled)
	if err != nil {
		//TODO handle not found (probably handled earlier)
		return AdminEventCancel500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminEventCancel200Response{}, nil
}

func (s *Server) AdminAddEvents(ctx context.Context, request AdminAddEventsRequestObject) (AdminAddEventsResponseObject, error) {
	//TODO validation
	err := s.db.AddEvents(ctx, request)
	if err != nil {
		return AdminAddEvents500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	return AdminAddEvents200Response{}, nil
}

func (s *Server) GetEventsICS(ctx context.Context, request GetEventsICSRequestObject) (GetEventsICSResponseObject, error) {
	events, err := s.getAllEvents(ctx, nil, nil, nil)
	if err != nil {
		return GetEventsICS500JSONResponse{
			ErrorMessage: err.Error(),
		}, nil
	}

	cal := ics.NewCalendar()
	cal.SetProductId("//KLGC//Booking Service//EN")
	cal.SetVersion("2.0")
	cal.SetMethod(ics.MethodPublish)

	for _, event := range events {
		from, err := time.Parse(time.RFC3339, event.From)
		if err != nil {
			return GetEventsICS500JSONResponse{ErrorMessage: err.Error()}, nil
		}

		to, err := time.Parse(time.RFC3339, event.To)
		if err != nil {
			return GetEventsICS500JSONResponse{ErrorMessage: err.Error()}, nil
		}

		calEvent := cal.AddEvent(event.Id)
		calEvent.SetCreatedTime(time.Now())
		calEvent.SetDtStampTime(time.Now())
		calEvent.SetModifiedAt(time.Now())
		calEvent.SetStartAt(from)
		calEvent.SetEndAt(to)
		calEvent.SetSummary(event.Name)
		calEvent.SetDescription("Booking at the Kathie Lamb Guide Centre")
		calEvent.SetLocation("Kathie Lamb Guide Centre, Jubilee Field, Headcorn Road, Staplehurst, Kent, TN12 0DS")
		calEvent.SetOrganizer("bookings@kathielambcentre.org")
	}

	icsCal := cal.Serialize()

	return GetEventsICS200TextcalendarResponse{
		Body:          strings.NewReader(icsCal),
		ContentLength: int64(len(icsCal)),
	}, nil
}
