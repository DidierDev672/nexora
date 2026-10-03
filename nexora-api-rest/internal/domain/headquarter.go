package domain

import (
	"errors"
	"time"
)

// HeadquarterStatus represents the lifecycle state of a headquarter.
type HeadquarterStatus string

const (
	HeadquarterStatusActive   HeadquarterStatus = "active"
	HeadquarterStatusInactive HeadquarterStatus = "inactive"
)

// HeadquarterID identifies a headquarter within the system.
type HeadquarterID string

// Sentinel errors represent the invariant violations of the headquarter aggregate.
var (
	ErrHeadquarterNotFound       = errors.New("headquarter not found")
	ErrHeadquarterDuplicated     = errors.New("a headquarter with this name already exists")
	ErrInvalidHeadquarterName    = errors.New("headquarter name must not be empty")
	ErrInvalidHeadquarterAddress = errors.New("headquarter address must not be empty")
	ErrInvalidHeadquarterCity    = errors.New("headquarter city must not be empty")
	ErrInvalidHeadquarterStatus  = errors.New("invalid headquarter status")
)

// Headquarter is the core domain entity. It has no dependencies on other layers.
type Headquarter struct {
	ID        HeadquarterID
	Name      string
	Address   string
	City      string
	Phone     string
	Status    HeadquarterStatus
	CreatedBy string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// Validate enforces the business invariants of a headquarter.
func (h Headquarter) Validate() error {
	switch {
	case h.Name == "":
		return ErrInvalidHeadquarterName
	case h.Address == "":
		return ErrInvalidHeadquarterAddress
	case h.City == "":
		return ErrInvalidHeadquarterCity
	}
	switch h.Status {
	case HeadquarterStatusActive, HeadquarterStatusInactive:
		return nil
	default:
		return ErrInvalidHeadquarterStatus
	}
}

// ParseHeadquarterStatus converts a string representation into a valid status.
func ParseHeadquarterStatus(s string) (HeadquarterStatus, error) {
	status := HeadquarterStatus(s)
	switch status {
	case HeadquarterStatusActive, HeadquarterStatusInactive:
		return status, nil
	default:
		return "", ErrInvalidHeadquarterStatus
	}
}
