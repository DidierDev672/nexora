package domain

import (
	"errors"
	"strings"
	"time"
)

// BuildingID identifies a building within the system.
type BuildingID string

// BuildingStatus represents the lifecycle state of a building.
type BuildingStatus string

const (
	BuildingStatusAvailable   BuildingStatus = "available"
	BuildingStatusBusy        BuildingStatus = "busy"
	BuildingStatusMaintenance BuildingStatus = "maintenance"
	BuildingStatusCleaning    BuildingStatus = "cleaning"
	BuildingStatusInactive    BuildingStatus = "inactive"
	BuildingStatusOccupied    BuildingStatus = "occupied"
)

// ValidBuildingStatuses enumerates the allowed states of a building.
var ValidBuildingStatuses = []BuildingStatus{
	BuildingStatusAvailable,
	BuildingStatusBusy,
	BuildingStatusMaintenance,
	BuildingStatusCleaning,
	BuildingStatusInactive,
	BuildingStatusOccupied,
}

// Sentinel errors represent the invariant violations of the building aggregate.
var (
	ErrBuildingNotFound           = errors.New("building not found")
	ErrBuildingDuplicated         = errors.New("a building with this name already exists in the headquarter")
	ErrInvalidBuildingName        = errors.New("building name must not be empty")
	ErrInvalidBuildingFloorNumber = errors.New("building floor number cannot be less than 1")
	ErrInvalidHeadquarterID       = errors.New("headquarter is required")
	ErrInvalidBuildingStatus      = errors.New("status must be one of: available, busy, maintenance, cleaning, inactive, occupied")
)

// cloneSubHeadquarterID deep-copies the nullable headquarter reference so
// buildings never share mutable identifiers with their callers.
func cloneSubHeadquarterID(id *SubHeadquarterID) *SubHeadquarterID {
	if id == nil {
		return nil
	}
	copied := *id
	return &copied
}

// Building is the core domain entity. It has no dependencies on other layers.
// SubHeadquartersID is nil when the building does not belong to a sub-headquarter.
type Building struct {
	ID                BuildingID
	Name              string
	FloorNumber       int
	HeadquartersID    HeadquarterID
	SubHeadquartersID *SubHeadquarterID
	Status            BuildingStatus
	CreatedBy         string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// NewBuilding is the sanctioned constructor: it enforces the business
// invariants before an entity can exist, so invalid states are rejected at
// creation time rather than silently persisted.
func NewBuilding(id BuildingID, name string, floorNumber int, headquartersID HeadquarterID, subHeadquartersID *SubHeadquarterID, status BuildingStatus, createdBy string, createdAt time.Time) (Building, error) {
	building := Building{
		ID:                id,
		Name:              strings.TrimSpace(name),
		FloorNumber:       floorNumber,
		HeadquartersID:    headquartersID,
		SubHeadquartersID: cloneSubHeadquarterID(subHeadquartersID),
		Status:            status,
		CreatedBy:         createdBy,
		CreatedAt:         createdAt,
		UpdatedAt:         createdAt,
	}
	if err := building.Validate(); err != nil {
		return Building{}, err
	}
	return building, nil
}

// ParseBuildingStatus converts a string representation into a valid status.
func ParseBuildingStatus(s string) (BuildingStatus, error) {
	status := BuildingStatus(strings.ToLower(strings.TrimSpace(s)))
	for _, valid := range ValidBuildingStatuses {
		if status == valid {
			return status, nil
		}
	}
	return "", ErrInvalidBuildingStatus
}

// Validate enforces the business invariants of a building.
func (b Building) Validate() error {
	switch {
	case strings.TrimSpace(b.Name) == "":
		return ErrInvalidBuildingName
	case b.FloorNumber < 1:
		return ErrInvalidBuildingFloorNumber
	case strings.TrimSpace(string(b.HeadquartersID)) == "":
		return ErrInvalidHeadquarterID
	}
	for _, valid := range ValidBuildingStatuses {
		if b.Status == valid {
			return nil
		}
	}
	return ErrInvalidBuildingStatus
}

// Rename updates the building name, keeping the non-empty invariant.
func (b *Building) Rename(name string) error {
	if strings.TrimSpace(name) == "" {
		return ErrInvalidBuildingName
	}
	b.Name = strings.TrimSpace(name)
	return nil
}

// ChangeFloorNumber sets the number of floors of the building.
func (b *Building) ChangeFloorNumber(floorNumber int) error {
	if floorNumber < 1 {
		return ErrInvalidBuildingFloorNumber
	}
	b.FloorNumber = floorNumber
	return nil
}

// ReassignHeadquarter moves the building to another headquarter.
func (b *Building) ReassignHeadquarter(headquartersID HeadquarterID) error {
	if strings.TrimSpace(string(headquartersID)) == "" {
		return ErrInvalidHeadquarterID
	}
	b.HeadquartersID = headquartersID
	return nil
}

// AssignSubHeadquarter links the building to a sub-headquarter, if any.
func (b *Building) AssignSubHeadquarter(subHeadquartersID *SubHeadquarterID) {
	b.SubHeadquartersID = cloneSubHeadquarterID(subHeadquartersID)
}

// ClearSubHeadquarter detaches the building from any sub-headquarter.
func (b *Building) ClearSubHeadquarter() {
	b.SubHeadquartersID = nil
}

// ChangeStatus applies a validated building status transition.
func (b *Building) ChangeStatus(raw string) error {
	status, err := ParseBuildingStatus(raw)
	if err != nil {
		return err
	}
	b.Status = status
	return nil
}
