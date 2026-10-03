package domain

import "context"

// AuditEntityCount is the aggregate count of an entity that only has an
// active/inactive lifecycle (headquarters, sub headquarters, rates).
type AuditEntityCount struct {
	Total    int
	Active   int
	Inactive int
}

// AuditRoomCount is the aggregate count of rooms broken down by their physical
// lifecycle state, which is what a hotel auditor compares with the field.
type AuditRoomCount struct {
	Total       int
	Available   int
	Busy        int
	Maintenance int
	Cleaning    int
	Inactive    int
}

// AuditBuildingCount is the aggregate count of buildings per their lifecycle
// state (a building speaks the same vocabulary as a room).
type AuditBuildingCount struct {
	Total       int
	Available   int
	Busy        int
	Maintenance int
	Cleaning    int
	Inactive    int
	Occupied    int
}

// AuditBedTypeCount is the aggregate count of bed types. The entity has no
// lifecycle status (a bed type is taxonomy, not a resource), so only its total
// is audited.
type AuditBedTypeCount struct {
	Total int
}

// AuditRoomTariffCount is the aggregate count of room-rate assignments,
// including how many are flagged as the prevailing default of their room.
type AuditRoomTariffCount struct {
	Total    int
	Active   int
	Inactive int
	Defaults int
}

// AuditSummary groups the totals each auditable entity contributes to the
// dashboard, so an auditor can spot coverage and consistency gaps at a glance.
type AuditSummary struct {
	Buildings       AuditBuildingCount
	Rooms           AuditRoomCount
	BedTypes        AuditBedTypeCount
	Headquarters    AuditEntityCount
	SubHeadquarters AuditEntityCount
	Rates           AuditEntityCount
	RoomTariffs     AuditRoomTariffCount
}

// AuditRoom is the read model of a room enriched with its prevailing default
// tariff (room tariff default + rate price), the digital evidence an auditor
// contrasts with the physical inspection.
type AuditRoom struct {
	ID              RoomID
	Number          string
	Floor           int
	RoomTypeID      RoomTypeID
	BuildingID      BuildingID
	HeadquartersID  HeadquarterID
	Status          RoomStatus
	DefaultTariffID *RoomTariffID
	RateID          *RateID
	Price           *BasePrice
}

// AuditRoomGap is a room that fails a coverage rule: it has no active room
// tariff assigned, so it cannot be priced when sold.
type AuditRoomGap struct {
	ID             RoomID
	Number         string
	Floor          int
	RoomTypeID     RoomTypeID
	BuildingID     BuildingID
	HeadquartersID HeadquarterID
	Status         RoomStatus
}

// InactiveTariffInUse is an active room-rate assignment that points at an
// inactive rate: the catalog says the rate is retired but a room still applies
// it, a pricing consistency breach for the auditor.
type InactiveTariffInUse struct {
	ID        RoomTariffID
	RoomID    RoomID
	RateID    RateID
	RateName  string
	RatePrice BasePrice
	IsDefault bool
}

// AuditRepository is the read-only persistence port of the audit slice (DIP).
// It never mutates the inventory: it aggregates evidence from the operational
// tables so an auditor can compare the digital state with the physical one.
type AuditRepository interface {
	Summary(ctx context.Context) (AuditSummary, error)
	Rooms(ctx context.Context) ([]AuditRoom, error)
	RoomsByStatus(ctx context.Context, status RoomStatus) ([]AuditRoom, error)
	Rates(ctx context.Context) ([]Rate, error)
	RoomsWithoutTariff(ctx context.Context) ([]AuditRoomGap, error)
	InactiveTariffsInUse(ctx context.Context) ([]InactiveTariffInUse, error)
}
