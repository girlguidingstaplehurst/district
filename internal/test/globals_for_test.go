package test

import (
	"time"
)

const (
	email       = "email.address@kathielambcentre.org"
	contactName = "Contact Name"

	eventDetails = "Event Details"
	eventName    = "Event Name"
)

var (
	from = time.Now().AddDate(0, 1, 0)
	to   = time.Now().AddDate(0, 1, 0).Add(time.Hour)
)
