package domain

import (
	"errors"
	"strings"
	"time"
)

// BedTypeID identifies a bed type within the system.
type BedTypeID string

// CapacityPeople represents how many people a bed type can host. Value object.
type CapacityPeople int

// NewCapacityPeople validates and builds a CapacityPeople (a bed must host
// at least one person).
func NewCapacityPeople(value int) (CapacityPeople, error) {
	if value <= 0 {
		return 0, ErrInvalidBedTypeCapacity
	}
	return CapacityPeople(value), nil
}

// Sentinel errors represent the invariant violations of the bed type aggregate.
var (
	ErrBedTypeNotFound        = errors.New("bed type not found")
	ErrBedTypeDuplicated      = errors.New("a bed type with this name already exists")
	ErrInvalidBedTypeName     = errors.New("bed type name must not be empty")
	ErrInvalidBedTypeCapacity = errors.New("bed type capacity must be greater than zero")
)

// BedType is the core domain entity. Description is a free-text annotation
// with no mandatory format; an empty value is allowed.
type BedType struct {
	ID             BedTypeID
	Name           string
	CapacityPeople CapacityPeople
	Description    string
	CreatedBy      string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// NewBedType is the sanctioned constructor: it enforces the business
// invariants before an entity can exist, so invalid states are rejected
// at creation time rather than silently persisted.
func NewBedType(id BedTypeID, name string, capacityPeople CapacityPeople, description string, createdBy string, createdAt time.Time) (BedType, error) {
	bt := BedType{
		ID:             id,
		Name:           strings.TrimSpace(name),
		CapacityPeople: capacityPeople,
		Description:    strings.TrimSpace(description),
		CreatedBy:      createdBy,
		CreatedAt:      createdAt,
		UpdatedAt:      createdAt,
	}
	if err := bt.Validate(); err != nil {
		return BedType{}, err
	}
	return bt, nil
}

// Validate enforces the business invariants of the bed type.
func (bt BedType) Validate() error {
	switch {
	case strings.TrimSpace(bt.Name) == "":
		return ErrInvalidBedTypeName
	case bt.CapacityPeople <= 0:
		return ErrInvalidBedTypeCapacity
	}
	return nil
}

// Rename changes the name, keeping the non-empty invariant.
func (bt *BedType) Rename(name string) error {
	if strings.TrimSpace(name) == "" {
		return ErrInvalidBedTypeName
	}
	bt.Name = strings.TrimSpace(name)
	return nil
}

// ChangeCapacity replaces the capacity through the value object invariant.
func (bt *BedType) ChangeCapacity(value int) error {
	capacity, err := NewCapacityPeople(value)
	if err != nil {
		return err
	}
	bt.CapacityPeople = capacity
	return nil
}

// SetDescription replaces the free-text annotation.
func (bt *BedType) SetDescription(description string) {
	bt.Description = strings.TrimSpace(description)
}
