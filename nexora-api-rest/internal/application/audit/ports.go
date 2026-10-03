package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// SummaryProvider is the narrow port for the audit dashboard counts (ISP).
type SummaryProvider interface {
	Summary(ctx context.Context) (domain.AuditSummary, error)
}

// RoomsProvider is the narrow port for the auditable room inventory.
type RoomsProvider interface {
	Rooms(ctx context.Context) ([]domain.AuditRoom, error)
}

// RoomsByStatusProvider is the narrow port for the room inventory filtered by
// a physical lifecycle state.
type RoomsByStatusProvider interface {
	RoomsByStatus(ctx context.Context, raw string) ([]domain.AuditRoom, error)
}

// RatesProvider is the narrow port for the audited rate catalog.
type RatesProvider interface {
	Rates(ctx context.Context) ([]domain.Rate, error)
}

// RoomsWithoutTariffProvider is the narrow port for the room coverage gaps.
type RoomsWithoutTariffProvider interface {
	RoomsWithoutTariff(ctx context.Context) ([]domain.AuditRoomGap, error)
}

// InactiveTariffsInUseProvider is the narrow port for pricing consistency
// breaches (active assignments pointing at inactive rates).
type InactiveTariffsInUseProvider interface {
	InactiveTariffsInUse(ctx context.Context) ([]domain.InactiveTariffInUse, error)
}
