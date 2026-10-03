package domain

import (
	"errors"
	"strings"
	"time"
)

// StayID identifies a stay / check-in record.
type StayID string

// PaymentMethod specifies the allowed payment methods for a stay.
type PaymentMethod string

const (
	PaymentMethodCash         PaymentMethod = "cash"
	PaymentMethodCard         PaymentMethod = "card"
	PaymentMethodBankTransfer PaymentMethod = "bank transfer"
)

// ValidPaymentMethods lists the allowed payment methods.
var ValidPaymentMethods = []PaymentMethod{
	PaymentMethodCash,
	PaymentMethodCard,
	PaymentMethodBankTransfer,
}

var validPaymentMethodSet = func() map[PaymentMethod]struct{} {
	set := make(map[PaymentMethod]struct{}, len(ValidPaymentMethods))
	for _, m := range ValidPaymentMethods {
		set[m] = struct{}{}
	}
	return set
}()

// ParsePaymentMethod validates and parses a raw payment method string.
func ParsePaymentMethod(raw string) (PaymentMethod, error) {
	normalized := PaymentMethod(strings.ToLower(strings.TrimSpace(raw)))
	if _, ok := validPaymentMethodSet[normalized]; !ok {
		return "", ErrInvalidPaymentMethod
	}
	return normalized, nil
}

// StayStatus represents the lifecycle state of a stay.
type StayStatus string

const (
	StayStatusProgress  StayStatus = "progress"
	StayStatusCompleted StayStatus = "completed"
	StayStatusCanceled  StayStatus = "canceled"
)

// ValidStayStatuses lists all valid lifecycle states for a stay.
var ValidStayStatuses = []StayStatus{
	StayStatusProgress,
	StayStatusCompleted,
	StayStatusCanceled,
}

var validStayStatusSet = func() map[StayStatus]struct{} {
	set := make(map[StayStatus]struct{}, len(ValidStayStatuses))
	for _, s := range ValidStayStatuses {
		set[s] = struct{}{}
	}
	return set
}()

// ParseStayStatus validates and parses a raw stay status string.
func ParseStayStatus(raw string) (StayStatus, error) {
	normalized := StayStatus(strings.ToLower(strings.TrimSpace(raw)))
	if _, ok := validStayStatusSet[normalized]; !ok {
		return "", ErrInvalidStayStatus
	}
	return normalized, nil
}

// Sentinel errors representing domain invariant violations for stays.
var (
	ErrStayNotFound             = errors.New("stay not found")
	ErrInvalidStayID            = errors.New("stay id must not be empty")
	ErrInvalidStayRoomID        = errors.New("room_id is required")
	ErrInvalidStayReservationID = errors.New("reservation_id is required")
	ErrInvalidStayPersonID      = errors.New("person_ids is required and each id must not be empty")
	ErrInvalidStayDates         = errors.New("check_out_date must be after check_in_date")
	ErrInvalidPaymentMethod     = errors.New("payment_method must be one of: cash, card, bank transfer")
	ErrInvalidSecurityDeposit   = errors.New("security_deposit cannot be negative")
	ErrInvalidStayStatus        = errors.New("status must be one of: progress, completed, canceled")
)

// Stay is the core domain entity representing a guest stay / check-in. A stay
// can host several guests at once (e.g. a family booking a room together), so
// PersonIDs is a set of PersonID, persisted via the stays_persons pivot table.
type Stay struct {
	ID              StayID
	RoomID          RoomID
	ReservationID   ReserveID
	PersonIDs       []PersonID
	CheckInDate     time.Time
	CheckOutDate    time.Time
	PaymentMethod   PaymentMethod
	SecurityDeposit float64
	Remarks         string
	Status          StayStatus
	CreatedBy       string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// NewStay validates and constructs a new Stay entity enforcing business invariants.
func NewStay(
	id StayID,
	roomID RoomID,
	reservationID ReserveID,
	personIDs []PersonID,
	checkInDate, checkOutDate time.Time,
	paymentMethod PaymentMethod,
	securityDeposit float64,
	remarks string,
	status StayStatus,
	createdBy string,
	createdAt time.Time,
) (Stay, error) {
	stay := Stay{
		ID:              id,
		RoomID:          roomID,
		ReservationID:   reservationID,
		PersonIDs:       personIDs,
		CheckInDate:     checkInDate,
		CheckOutDate:    checkOutDate,
		PaymentMethod:   paymentMethod,
		SecurityDeposit: securityDeposit,
		Remarks:         strings.TrimSpace(remarks),
		Status:          status,
		CreatedBy:       strings.TrimSpace(createdBy),
		CreatedAt:       createdAt,
		UpdatedAt:       createdAt,
	}

	if err := stay.Validate(); err != nil {
		return Stay{}, err
	}

	return stay, nil
}

// Validate verifies domain invariants for Stay.
func (s *Stay) Validate() error {
	if strings.TrimSpace(string(s.ID)) == "" {
		return ErrInvalidStayID
	}
	if strings.TrimSpace(string(s.RoomID)) == "" {
		return ErrInvalidStayRoomID
	}
	if len(s.PersonIDs) == 0 {
		return ErrInvalidStayPersonID
	}
	for _, pid := range s.PersonIDs {
		if strings.TrimSpace(string(pid)) == "" {
			return ErrInvalidStayPersonID
		}
	}
	if s.CheckInDate.IsZero() || s.CheckOutDate.IsZero() || !s.CheckOutDate.After(s.CheckInDate) {
		return ErrInvalidStayDates
	}
	if _, ok := validPaymentMethodSet[s.PaymentMethod]; !ok {
		return ErrInvalidPaymentMethod
	}
	if s.SecurityDeposit < 0 {
		return ErrInvalidSecurityDeposit
	}
	if _, ok := validStayStatusSet[s.Status]; !ok {
		return ErrInvalidStayStatus
	}
	return nil
}

// Complete marks the stay as completed at a specific time.
func (s *Stay) Complete(at time.Time) error {
	if s.Status == StayStatusCanceled {
		return errors.New("cannot complete a canceled stay")
	}
	s.Status = StayStatusCompleted
	s.UpdatedAt = at
	return nil
}

// Cancel transitions the stay to canceled status with remarks.
func (s *Stay) Cancel(reason string, at time.Time) error {
	if s.Status == StayStatusCompleted {
		return errors.New("cannot cancel an already completed stay")
	}
	s.Status = StayStatusCanceled
	if strings.TrimSpace(reason) != "" {
		if s.Remarks != "" {
			s.Remarks += " | Cancellation reason: " + strings.TrimSpace(reason)
		} else {
			s.Remarks = "Cancellation reason: " + strings.TrimSpace(reason)
		}
	}
	s.UpdatedAt = at
	return nil
}
