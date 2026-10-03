package roomtariff

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetRoomTariffUseCase fetches a single room tariff by ID (SRP).
type GetRoomTariffUseCase struct {
	repo domain.RoomTariffRepository
}

// NewGetRoomTariffUseCase builds the use case.
func NewGetRoomTariffUseCase(repo domain.RoomTariffRepository) *GetRoomTariffUseCase {
	return &GetRoomTariffUseCase{repo: repo}
}

// GetByID finds a room tariff by its identifier.
func (uc *GetRoomTariffUseCase) GetByID(ctx context.Context, id domain.RoomTariffID) (domain.RoomTariff, error) {
	return uc.repo.FindByID(ctx, id)
}
