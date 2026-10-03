package domain

import "context"

// RoomTariffRepository defines the persistence port for the RoomTariff aggregate (DIP).
type RoomTariffRepository interface {
	FindAll(ctx context.Context) ([]RoomTariff, error)
	FindByID(ctx context.Context, id RoomTariffID) (RoomTariff, error)
	FindByRoom(ctx context.Context, roomID RoomID) ([]RoomTariff, error)
	Save(ctx context.Context, tariff RoomTariff) (RoomTariff, error)
	Update(ctx context.Context, tariff RoomTariff) (RoomTariff, error)
	Delete(ctx context.Context, id RoomTariffID) error
	EnsureTable(ctx context.Context) error
}
