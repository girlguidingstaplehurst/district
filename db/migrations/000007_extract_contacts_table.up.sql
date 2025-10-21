create table if not exists booking_contacts
(
    email text primary key,
    name  text not null
--     TODO add in email verification process so we can be sure we're sending to the right person
);

-- extract booking contacts from events
insert into booking_contacts (email, name)
select distinct(email), contact
from booking_events;

-- add FK relationship
alter table booking_events add foreign key (email) references booking_contacts;

-- remove contact (name) field from events (as this now belongs to contacts)
alter table booking_events drop contact;

