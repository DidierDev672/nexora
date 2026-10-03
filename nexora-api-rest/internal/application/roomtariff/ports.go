package roomtariff

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates domain identifiers for new room tariffs.
type IDProvider interface {
	NewRoomTariffID() domain.RoomTariffID
}

// RoomTariffCreator is the narrow port for creating room tariffs (ISP).
type RoomTariffCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.RoomTariff, error)
}

// RoomTariffLister is the narrow port for retrieving all room tariffs.
type RoomTariffLister interface {
	List(ctx context.Context) ([]domain.RoomTariff, error)
}

// RoomTariffGetter is the narrow port for fetching a single room tariff by ID.
type RoomTariffGetter interface {
	GetByID(ctx context.Context, id domain.RoomTariffID) (domain.RoomTariff, error)
}

// RoomTariffByRoomLister is the narrow port for fetching the tariffs applied
// to a specific room (ISP).
type RoomTariffByRoomLister interface {
	ListByRoom(ctx context.Context, roomID domain.RoomID) ([]domain.RoomTariff, error)
}

// RoomTariffUpdater is the narrow port for updating an existing room tariff.
type RoomTariffUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.RoomTariff, error)
}

// RoomTariffDeleter is the narrow port for removing a room tariff.
type RoomTariffDeleter interface {
	Delete(ctx context.Context, id domain.RoomTariffID) error
}
