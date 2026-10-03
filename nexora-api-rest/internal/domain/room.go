package domain

import (
	"errors"
	"strings"
	"time"
)

// RoomID identifies a room within the system.
type RoomID string

// RoomStatus represents the lifecycle state of a room.
type RoomStatus string

const (
	RoomStatusAvailable   RoomStatus = "available"
	RoomStatusBusy        RoomStatus = "busy"
	RoomStatusMaintenance RoomStatus = "maintenance"
	RoomStatusCleaning    RoomStatus = "cleaning"
	RoomStatusInactive    RoomStatus = "inactive"
)

// ValidRoomStatuses enumerates the allowed states of a room.
var ValidRoomStatuses = []RoomStatus{
	RoomStatusAvailable,
	RoomStatusBusy,
	RoomStatusMaintenance,
	RoomStatusCleaning,
	RoomStatusInactive,
}

// validRoomStatusSet mirrors ValidRoomStatuses as a set for O(1) membership
// checks instead of linear scans in hot paths (ParseRoomStatus/Validate).
var validRoomStatusSet = func() map[RoomStatus]struct{} {
	set := make(map[RoomStatus]struct{}, len(ValidRoomStatuses))
	for _, status := range ValidRoomStatuses {
		set[status] = struct{}{}
	}
	return set
}()

// Sentinel errors represent the invariant violations of the room aggregate.
var (
	ErrRoomNotFound         = errors.New("room not found")
	ErrRoomDuplicated       = errors.New("a room with this number already exists in the building")
	ErrInvalidRoomNumber    = errors.New("room number must not be empty")
	ErrInvalidRoomFloor     = errors.New("room floor cannot be negative")
	ErrInvalidRoomTypeID    = errors.New("room type is required")
	ErrInvalidBuildingID    = errors.New("building is required")
	ErrInvalidRoomStatus    = errors.New("status must be one of: available, busy, maintenance, cleaning, inactive")
	ErrInvalidPriceOverride = errors.New("price override cannot be negative")
)

// Room is the core domain entity. Each room belongs to exactly one building;
// PriceOverride is nil when the room uses the base price of its room type.
// HasReception reports whether the room counts with a reception point.
type Room struct {
	ID            RoomID
	Number        string
	Floor         int
	RoomTypeID    RoomTypeID
	BuildingID    BuildingID
	PriceOverride *BasePrice
	Status        RoomStatus
	HasReception  bool
	CreatedBy     string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// cloneBasePrice deep-copies the nullable value object so domain entities
// never share mutable price pointers with their callers.
func cloneBasePrice(price *BasePrice) *BasePrice {
	if price == nil {
		return nil
	}
	copied := *price
	return &copied
}

// NewRoom is the sanctioned constructor: it enforces the business invariants
// before an entity can exist, so invalid states are rejected at creation time
// rather than silently persisted.
func NewRoom(id RoomID, number string, floor int, roomTypeID RoomTypeID, buildingID BuildingID, priceOverride *BasePrice, status RoomStatus, hasReception bool, createdBy string, createdAt time.Time) (Room, error) {
	room := Room{
		ID:            id,
		Number:        strings.TrimSpace(number),
		Floor:         floor,
		RoomTypeID:    roomTypeID,
		BuildingID:    buildingID,
		PriceOverride: cloneBasePrice(priceOverride),
		Status:        status,
		HasReception:  hasReception,
		CreatedBy:     createdBy,
		CreatedAt:     createdAt,
		UpdatedAt:     createdAt,
	}
	if err := room.Validate(); err != nil {
		return Room{}, err
	}
	return room, nil
}

// ParseRoomStatus converts a string representation into a valid status.
func ParseRoomStatus(s string) (RoomStatus, error) {
	status := RoomStatus(strings.ToLower(strings.TrimSpace(s)))
	if !IsValidRoomStatus(status) {
		return "", ErrInvalidRoomStatus
	}
	return status, nil
}

// IsValidRoomStatus reports whether the status is one of the allowed values.
func IsValidRoomStatus(status RoomStatus) bool {
	_, ok := validRoomStatusSet[status]
	return ok
}

// Validate enforces the business invariants of a room.
func (r Room) Validate() error {
	switch {
	case r.Number == "":
		return ErrInvalidRoomNumber
	case r.Floor < 0:
		return ErrInvalidRoomFloor
	case strings.TrimSpace(string(r.RoomTypeID)) == "":
		return ErrInvalidRoomTypeID
	case strings.TrimSpace(string(r.BuildingID)) == "":
		return ErrInvalidBuildingID
	case r.PriceOverride != nil && *r.PriceOverride < 0:
		return ErrInvalidPriceOverride
	}
	if !IsValidRoomStatus(r.Status) {
		return ErrInvalidRoomStatus
	}
	return nil
}

// ChangeNumber renumbers the room, keeping the non-empty invariant.
func (r *Room) ChangeNumber(number string) error {
	if strings.TrimSpace(number) == "" {
		return ErrInvalidRoomNumber
	}
	r.Number = strings.TrimSpace(number)
	return nil
}

// ChangeFloor moves the room to another floor (0 = ground floor).
func (r *Room) ChangeFloor(floor int) error {
	if floor < 0 {
		return ErrInvalidRoomFloor
	}
	r.Floor = floor
	return nil
}

// ReassignRoomType links the room to another room type.
func (r *Room) ReassignRoomType(roomTypeID RoomTypeID) error {
	if strings.TrimSpace(string(roomTypeID)) == "" {
		return ErrInvalidRoomTypeID
	}
	r.RoomTypeID = roomTypeID
	return nil
}

// ReassignBuilding moves the room to another building.
func (r *Room) ReassignBuilding(buildingID BuildingID) error {
	if strings.TrimSpace(string(buildingID)) == "" {
		return ErrInvalidBuildingID
	}
	r.BuildingID = buildingID
	return nil
}

// SetPriceOverride overrides the room type base price. Returns an error when
// the value is negative; nil price removes the override.
func (r *Room) SetPriceOverride(price *BasePrice) error {
	if price != nil && *price < 0 {
		return ErrInvalidPriceOverride
	}
	r.PriceOverride = cloneBasePrice(price)
	return nil
}

// ChangeStatus applies a validated room status transition.
func (r *Room) ChangeStatus(raw string) error {
	status, err := ParseRoomStatus(raw)
	if err != nil {
		return err
	}
	r.Status = status
	return nil
}

// SetHasReception toggles whether the room counts with a reception point.
func (r *Room) SetHasReception(hasReception bool) {
	r.HasReception = hasReception
}
