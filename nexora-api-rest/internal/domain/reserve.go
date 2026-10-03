package domain

import (
	"errors"
	"strings"
	"time"
)

// ReserveID identifies a reservation within the system.
type ReserveID string

// ReserveState represents the lifecycle status of a reservation.
type ReserveState string

const (
	ReserveStatePending    ReserveState = "pending"
	ReserveStateConfirmed  ReserveState = "confirmed"
	ReserveStateInProgress ReserveState = "in progress"
	ReserveStateCompleted  ReserveState = "completed"
	ReserveStateCanceled   ReserveState = "canceled"
	ReserveStateNoShow     ReserveState = "no show"
)

// ValidReserveStates enumerates the allowed lifecycle states of a reservation.
var ValidReserveStates = []ReserveState{
	ReserveStatePending,
	ReserveStateConfirmed,
	ReserveStateInProgress,
	ReserveStateCompleted,
	ReserveStateCanceled,
	ReserveStateNoShow,
}

var validReserveStateSet = func() map[ReserveState]struct{} {
	set := make(map[ReserveState]struct{}, len(ValidReserveStates))
	for _, s := range ValidReserveStates {
		set[s] = struct{}{}
	}
	return set
}()

// Sentinel errors representing domain invariant violations for reservations.
var (
	ErrReserveNotFound         = errors.New("reserve not found")
	ErrInvalidReserveID        = errors.New("reserve id must not be empty")
	ErrInvalidReserveRoomID    = errors.New("room_id is required")
	ErrInvalidReservePersonID  = errors.New("person_id is required")
	ErrInvalidReservationDates = errors.New("check_out_date must be after check_in_date")
	ErrInvalidGuestsNumber     = errors.New("number_of_guests must be greater than zero")
	ErrInvalidReserveState     = errors.New("state must be one of: pending, confirmed, in progress, completed, canceled, no show")
	ErrInvalidTotalPrice       = errors.New("total_price cannot be negative")
)

// Reserve is the core domain entity representing a booking reservation.
type Reserve struct {
	ID             ReserveID
	RoomID         RoomID
	PersonID       PersonID
	CheckInDate    time.Time
	CheckOutDate   time.Time
	NumberOfGuests int
	State          ReserveState
	TotalPrice     float64
	CreatedBy      string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// NewReserve is the sanctioned domain constructor enforcing business invariants.
func NewReserve(
	id ReserveID,
	roomID RoomID,
	personID PersonID,
	checkInDate, checkOutDate time.Time,
	numberOfGuests int,
	state ReserveState,
	totalPrice float64,
	createdBy string,
	createdAt time.Time,
) (Reserve, error) {
	reserve := Reserve{
		ID:             id,
		RoomID:         roomID,
		PersonID:       personID,
		CheckInDate:    checkInDate,
		CheckOutDate:   checkOutDate,
		NumberOfGuests: numberOfGuests,
		State:          state,
		TotalPrice:     totalPrice,
		CreatedBy:      strings.TrimSpace(createdBy),
		CreatedAt:      createdAt,
		UpdatedAt:      createdAt,
	}

	if err := reserve.Validate(); err != nil {
		return Reserve{}, err
	}

	return reserve, nil
}

// Validate verifies that the reservation complies with all domain invariants.
func (r Reserve) Validate() error {
	switch {
	case strings.TrimSpace(string(r.ID)) == "":
		return ErrInvalidReserveID
	case strings.TrimSpace(string(r.RoomID)) == "":
		return ErrInvalidReserveRoomID
	case strings.TrimSpace(string(r.PersonID)) == "":
		return ErrInvalidReservePersonID
	case r.CheckInDate.IsZero() || r.CheckOutDate.IsZero() || !r.CheckOutDate.After(r.CheckInDate):
		return ErrInvalidReservationDates
	case r.NumberOfGuests <= 0:
		return ErrInvalidGuestsNumber
	case !IsValidReserveState(r.State):
		return ErrInvalidReserveState
	case r.TotalPrice < 0:
		return ErrInvalidTotalPrice
	}
	return nil
}

// ParseReserveState converts a raw string to a valid ReserveState.
func ParseReserveState(s string) (ReserveState, error) {
	state := ReserveState(strings.ToLower(strings.TrimSpace(s)))
	if !IsValidReserveState(state) {
		return "", ErrInvalidReserveState
	}
	return state, nil
}

// IsValidReserveState checks whether a state belongs to the closed enum.
func IsValidReserveState(state ReserveState) bool {
	_, ok := validReserveStateSet[state]
	return ok
}

// ChangeDates updates check-in and check-out dates if valid.
func (r *ReserveState) String() string {
	return string(*r)
}

// UpdateDetails updates the mutable business attributes of the reservation.
func (r *Reserve) UpdateDetails(
	roomID RoomID,
	personID PersonID,
	checkInDate, checkOutDate time.Time,
	numberOfGuests int,
	state ReserveState,
	totalPrice float64,
) error {
	updated := *r
	updated.RoomID = roomID
	updated.PersonID = personID
	updated.CheckInDate = checkInDate
	updated.CheckOutDate = checkOutDate
	updated.NumberOfGuests = numberOfGuests
	updated.State = state
	updated.TotalPrice = totalPrice

	if err := updated.Validate(); err != nil {
		return err
	}

	*r = updated
	return nil
}
