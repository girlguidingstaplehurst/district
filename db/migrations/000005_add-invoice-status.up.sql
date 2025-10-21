create type booking_invoice_status as enum ('raised', 'paid', 'cancelled', 'refunded');

alter table booking_invoices
    add status booking_invoice_status not null default ('raised');