package domain

import (
	"errors"
	"strings"
	"time"
)

// RoomTariffID identifies a room-rate assignment within the system.
type RoomTariffID string

// RoomTariffStatus represents the operational state of a room-rate assignment.
type RoomTariffStatus string

const (
	RoomTariffStatusActive   RoomTariffStatus = "active"
	RoomTariffStatusInactive RoomTariffStatus = "inactive"
)

// ValidRoomTariffStatuses lists every accepted room tariff status.
var ValidRoomTariffStatuses = []RoomTariffStatus{
	RoomTariffStatusActive,
	RoomTariffStatusInactive,
}

var validRoomTariffStatusSet = func() map[RoomTariffStatus]struct{} {
	set := make(map[RoomTariffStatus]struct{}, len(ValidRoomTariffStatuses))
	for _, s := range ValidRoomTariffStatuses {
		set[s] = struct{}{}
	}
	return set
}()

// ParseRoomTariffStatus normalizes and validates a raw status string.
func ParseRoomTariffStatus(raw string) (RoomTariffStatus, error) {
	normalized := RoomTariffStatus(strings.ToLower(strings.TrimSpace(raw)))
	if _, ok := validRoomTariffStatusSet[normalized]; !ok {
		return "", ErrInvalidRoomTariffStatus
	}
	return normalized, nil
}

// Sentinel errors represent the invariant violations of the room tariff aggregate.
var (
	ErrRoomTariffNotFound      = errors.New("room tariff not found")
	ErrRoomTariffDuplicated    = errors.New("a room tariff with these parameters already exists")
	ErrInvalidRoomTariffID     = errors.New("room tariff id must not be empty")
	ErrInvalidRoomTariffRoomID = errors.New("room_id is required")
	ErrInvalidRoomTariffRateID = errors.New("rate_id is required")
	ErrInvalidRoomTariffStatus = errors.New("status must be active or inactive")
)

// RoomTariff links a room to a rate. A room has a single default tariff that is
// applied automatically when no other tariff matches the pricing context.
type RoomTariff struct {
	ID        RoomTariffID
	RoomID    RoomID
	RateID    RateID
	IsDefault bool
	Status    RoomTariffStatus
	CreatedBy string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NewRoomTariff is the sanctioned constructor: it enforces the business
// invariants before the entity can exist.
func NewRoomTariff(
	id RoomTariffID,
	roomID RoomID,
	rateID RateID,
	isDefault bool,
	status RoomTariffStatus,
	createdBy string,
	createdAt time.Time,
) (RoomTariff, error) {
	tariff := RoomTariff{
		ID:        id,
		RoomID:    roomID,
		RateID:    rateID,
		IsDefault: isDefault,
		Status:    status,
		CreatedBy: strings.TrimSpace(createdBy),
		CreatedAt: createdAt,
		UpdatedAt: createdAt,
	}

	if err := tariff.Validate(); err != nil {
		return RoomTariff{}, err
	}
	return tariff, nil
}

// Validate enforces the business invariants of the room tariff.
func (t RoomTariff) Validate() error {
	switch {
	case strings.TrimSpace(string(t.ID)) == "":
		return ErrInvalidRoomTariffID
	case strings.TrimSpace(string(t.RoomID)) == "":
		return ErrInvalidRoomTariffRoomID
	case strings.TrimSpace(string(t.RateID)) == "":
		return ErrInvalidRoomTariffRateID
	}

	if _, ok := validRoomTariffStatusSet[t.Status]; !ok {
		return ErrInvalidRoomTariffStatus
	}
	return nil
}
