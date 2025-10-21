alter table booking_events
    add assignee text,
    add keyholder_in text,
    add keyholder_out text;

create index if not exists booking_events_assignee on booking_events (assignee);
create index if not exists booking_events_keyholder_in on booking_events (keyholder_in);
create index if not exists booking_events_keyholder_out on booking_events (keyholder_out);

alter type booking_event_status add value 'awaiting documents';
alter type booking_event_status add value 'cancelled';