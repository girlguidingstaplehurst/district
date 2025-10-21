insert into booking_rates
    (id, description, hourly_rate, discount_table)
VALUES ('default', 'External Hirer Hourly Rate', 25, '{
  "5": {
    "type": "flat",
    "value": 25
  }
}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('regular-external', 'Regular External Hirer Hourly Rate', 20, '{
  "5": {
    "type": "flat",
    "value": 20
  }
}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('girlguiding', 'Girlguiding Hirer Hourly Rate', 20, '{
  "5": {
    "type": "flat",
    "value": 20
  }
}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('girlguiding-residential', 'Girlguiding Residential Hirer Hourly Rate', 5, '{}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('girlguiding-staplehurst-district', 'Girlguiding Staplehurst District Hirer Hourly Rate', 5, '{}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('district-unit-meeting', 'Staplehurst District Unit Meeting Rate', 10, '{}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('district-unit-meeting-rainbows', 'Staplehurst District Unit Meeting Rate (Rainbows)', 10.8, '{}');

insert into booking_rates
(id, description, hourly_rate, discount_table)
VALUES ('district-unit-meeting-trefoil', 'Staplehurst District Unit Meeting Rate (Trefoil)', 10, '{}');