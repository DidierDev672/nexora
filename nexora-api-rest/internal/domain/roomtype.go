package domain

import (
	"errors"
	"strings"
	"time"
)

// RoomTypeID identifies a room type within the system.
type RoomTypeID string

// Capacity represents how many people a room type can host. Value object.
type Capacity int

// NewCapacity validates and builds a Capacity (a room must seat someone).
func NewCapacity(value int) (Capacity, error) {
	if value <= 0 {
		return 0, ErrInvalidRoomTypeCapacity
	}
	return Capacity(value), nil
}

// BasePrice is the monetary value of the room type per night. Value object.
// Full units, not cents, matching the NUMERIC(12,2) storage in Postgres.
type BasePrice float64

// NewBasePrice validates and builds a BasePrice (a price cannot be negative).
func NewBasePrice(value float64) (BasePrice, error) {
	if value < 0 {
		return 0, ErrInvalidRoomTypeBasePrice
	}
	return BasePrice(value), nil
}

// Sentinel errors represent the invariant violations of the room type aggregate.
var (
	ErrRoomTypeNotFound         = errors.New("room type not found")
	ErrRoomTypeDuplicated       = errors.New("a room type with this name already exists")
	ErrInvalidRoomTypeName      = errors.New("room type name must not be empty")
	ErrInvalidRoomTypeCapacity  = errors.New("room type capacity must be greater than zero")
	ErrInvalidRoomTypeBasePrice = errors.New("room type base price cannot be negative")
)

// RoomType is the core domain entity. It has no dependencies on other layers.
type RoomType struct {
	ID        RoomTypeID
	Name      string
	Capacity  Capacity
	BasePrice BasePrice
	CreatedBy string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NewRoomType is the sanctioned constructor: it enforces the business
// invariants before an entity can exist, so invalid states are rejected
// at creation time rather than silently persisted.
func NewRoomType(id RoomTypeID, name string, capacity Capacity, basePrice BasePrice, createdBy string, createdAt time.Time) (RoomType, error) {
	rt := RoomType{
		ID:        id,
		Name:      name,
		Capacity:  capacity,
		BasePrice: basePrice,
		CreatedBy: createdBy,
		CreatedAt: createdAt,
		UpdatedAt: createdAt,
	}
	if err := rt.Validate(); err != nil {
		return RoomType{}, err
	}
	return rt, nil
}

// Validate enforces the business invariants of the room type.
func (rt RoomType) Validate() error {
	switch {
	case strings.TrimSpace(rt.Name) == "":
		return ErrInvalidRoomTypeName
	case rt.Capacity <= 0:
		return ErrInvalidRoomTypeCapacity
	case rt.BasePrice < 0:
		return ErrInvalidRoomTypeBasePrice
	}
	return nil
}

// Rename changes the name, keeping the non-empty invariant.
func (rt *RoomType) Rename(name string) error {
	if strings.TrimSpace(name) == "" {
		return ErrInvalidRoomTypeName
	}
	rt.Name = strings.TrimSpace(name)
	return nil
}

// ChangeCapacity replaces the capacity through the value object invariant.
func (rt *RoomType) ChangeCapacity(value int) error {
	capacity, err := NewCapacity(value)
	if err != nil {
		return err
	}
	rt.Capacity = capacity
	return nil
}

// ChangeBasePrice replaces the price through the value object invariant.
func (rt *RoomType) ChangeBasePrice(value float64) error {
	basePrice, err := NewBasePrice(value)
	if err != nil {
		return err
	}
	rt.BasePrice = basePrice
	return nil
}
