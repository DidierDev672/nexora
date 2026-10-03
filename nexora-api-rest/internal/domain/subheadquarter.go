package domain

import (
	"errors"
	"time"
)

// SubHeadquarterStatus represents the lifecycle state of a sub headquarter.
type SubHeadquarterStatus string

const (
	SubHeadquarterStatusActive   SubHeadquarterStatus = "active"
	SubHeadquarterStatusInactive SubHeadquarterStatus = "inactive"
)

// SubHeadquarterID identifies a sub headquarter within the system.
type SubHeadquarterID string

// Sentinel errors represent the invariant violations of the sub headquarter aggregate.
var (
	ErrSubHeadquarterNotFound             = errors.New("sub headquarter not found")
	ErrSubHeadquarterDuplicated           = errors.New("a sub headquarter with this name already exists for this headquarter")
	ErrInvalidSubHeadquarterHeadquarterID = errors.New("headquarter id must not be empty")
	ErrInvalidSubHeadquarterName          = errors.New("sub headquarter name must not be empty")
	ErrInvalidSubHeadquarterAddress       = errors.New("sub headquarter address must not be empty")
	ErrInvalidSubHeadquarterStatus        = errors.New("invalid sub headquarter status")
)

// SubHeadquarter is the core domain entity. It has no dependencies on other layers.
type SubHeadquarter struct {
	ID            SubHeadquarterID
	HeadquarterID HeadquarterID
	Name          string
	Address       string
	Phone         string
	Status        SubHeadquarterStatus
	CreatedBy     string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// Validate enforces the business invariants of a sub headquarter.
func (s SubHeadquarter) Validate() error {
	switch {
	case s.HeadquarterID == "":
		return ErrInvalidSubHeadquarterHeadquarterID
	case s.Name == "":
		return ErrInvalidSubHeadquarterName
	case s.Address == "":
		return ErrInvalidSubHeadquarterAddress
	}
	switch s.Status {
	case SubHeadquarterStatusActive, SubHeadquarterStatusInactive:
		return nil
	default:
		return ErrInvalidSubHeadquarterStatus
	}
}

// ParseSubHeadquarterStatus converts a string representation into a valid status.
func ParseSubHeadquarterStatus(val string) (SubHeadquarterStatus, error) {
	status := SubHeadquarterStatus(val)
	switch status {
	case SubHeadquarterStatusActive, SubHeadquarterStatusInactive:
		return status, nil
	default:
		return "", ErrInvalidSubHeadquarterStatus
	}
}
