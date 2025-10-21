create type booking_event_status as enum ('provisional', 'approved');

create table if not exists booking_events
(
    id          text primary key,
    event_start timestamp            not null,
    event_end   timestamp            not null,
    event_name  text                 not null,
    visible     bool                 not null,
    contact     text                 not null,
    email       text                 not null,
    status      booking_event_status not null
);

create index if not exists booking_events_start on booking_events (event_start);
create index if not exists booking_events_end on booking_events (event_end);