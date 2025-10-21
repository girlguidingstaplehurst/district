package consts

import (
	"errors"
)

var (
	//ErrBookingExists occurs when an existing booking overlaps the proposed dates
	ErrBookingExists = errors.New("a booking exists for these dates")
)
