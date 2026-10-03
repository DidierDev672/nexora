package domain

import (
	"errors"
	"strings"
	"time"
)

// BedID identifies a bed within the system.
type BedID string

// BedStatus represents the lifecycle state of a bed.
type BedStatus string

const (
	BedStatusActive      BedStatus = "active"
	BedStatusMaintenance BedStatus = "maintenance"
	BedStatusWithdrawal  BedStatus = "withdrawal"
)

// ValidBedStatuses enumerates the allowed states of a bed.
var ValidBedStatuses = []BedStatus{
	BedStatusActive,
	BedStatusMaintenance,
	BedStatusWithdrawal,
}

// validBedStatusSet mirrors ValidBedStatuses as a set for O(1) membership
// checks in hot paths (ParseBedStatus/Validate).
var validBedStatusSet = func() map[BedStatus]struct{} {
	set := make(map[BedStatus]struct{}, len(ValidBedStatuses))
	for _, status := range ValidBedStatuses {
		set[status] = struct{}{}
	}
	return set
}()

// Sentinel errors represent the invariant violations of the bed aggregate.
var (
	ErrBedNotFound         = errors.New("bed not found")
	ErrBedDuplicated       = errors.New("a bed with this etiquette already exists in the room")
	ErrInvalidBedEtiquette = errors.New("bed etiquette must not be empty")
	ErrInvalidBedRoomID    = errors.New("room is required")
	ErrInvalidBedTypeID    = errors.New("bed type is required")
	ErrInvalidBedStatus    = errors.New("status must be one of: active, maintenance, withdrawal")
)

// Bed is the core domain entity. Each bed lives inside a room and is labelled
// with its etiquette (A, B, Ventana...), unique within the room. A bed can
// host several bed types at once (e.g. a sofa-bed that is both
// "individual" and "eventual"), so TypesBedID is a set of BedTypeID.
type Bed struct {
	ID         BedID
	RoomID     RoomID
	TypesBedID []BedTypeID
	Etiquette  string
	Status     BedStatus
	CreatedBy  string
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

// NewBed is the sanctioned constructor: it enforces the business invariants
// before an entity can exist, so invalid states are rejected at creation time
// rather than silently persisted.
func NewBed(id BedID, roomID RoomID, typesBedID []BedTypeID, etiquette string, status BedStatus, createdBy string, createdAt time.Time) (Bed, error) {
	bed := Bed{
		ID:         id,
		RoomID:     roomID,
		TypesBedID: typesBedID,
		Etiquette:  strings.TrimSpace(etiquette),
		Status:     status,
		CreatedBy:  createdBy,
		CreatedAt:  createdAt,
		UpdatedAt:  createdAt,
	}
	if err := bed.Validate(); err != nil {
		return Bed{}, err
	}
	return bed, nil
}

// ParseBedStatus converts a string representation into a valid status.
func ParseBedStatus(s string) (BedStatus, error) {
	status := BedStatus(strings.ToLower(strings.TrimSpace(s)))
	if !IsValidBedStatus(status) {
		return "", ErrInvalidBedStatus
	}
	return status, nil
}

// IsValidBedStatus reports whether the status is one of the allowed values.
func IsValidBedStatus(status BedStatus) bool {
	_, ok := validBedStatusSet[status]
	return ok
}

// Validate enforces the business invariants of a bed.
func (b Bed) Validate() error {
	switch {
	case strings.TrimSpace(string(b.RoomID)) == "":
		return ErrInvalidBedRoomID
	case len(b.TypesBedID) == 0:
		return ErrInvalidBedTypeID
	case b.Etiquette == "":
		return ErrInvalidBedEtiquette
	}
	if !IsValidBedStatus(b.Status) {
		return ErrInvalidBedStatus
	}
	return nil
}

// ChangeEtiquette renames the bed label, keeping the non-empty invariant.
func (b *Bed) ChangeEtiquette(etiquette string) error {
	if strings.TrimSpace(etiquette) == "" {
		return ErrInvalidBedEtiquette
	}
	b.Etiquette = strings.TrimSpace(etiquette)
	return nil
}

// ReassignRoom moves the bed to another room.
func (b *Bed) ReassignRoom(roomID RoomID) error {
	if strings.TrimSpace(string(roomID)) == "" {
		return ErrInvalidBedRoomID
	}
	b.RoomID = roomID
	return nil
}

// ReassignBedType replaces the whole set of bed types hosted by the bed.
// The new set must contain at least one valid, non-empty type.
func (b *Bed) ReassignBedType(typesBedID []BedTypeID) error {
	if len(typesBedID) == 0 {
		return ErrInvalidBedTypeID
	}
	for _, id := range typesBedID {
		if strings.TrimSpace(string(id)) == "" {
			return ErrInvalidBedTypeID
		}
	}
	b.TypesBedID = typesBedID
	return nil
}

// ChangeStatus applies a validated bed status transition.
func (b *Bed) ChangeStatus(raw string) error {
	status, err := ParseBedStatus(raw)
	if err != nil {
		return err
	}
	b.Status = status
	return nil
}
