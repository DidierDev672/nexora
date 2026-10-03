package roomtariff

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteRoomTariffUseCase removes a room tariff by ID (SRP).
type DeleteRoomTariffUseCase struct {
	repo domain.RoomTariffRepository
}

// NewDeleteRoomTariffUseCase builds the use case.
func NewDeleteRoomTariffUseCase(repo domain.RoomTariffRepository) *DeleteRoomTariffUseCase {
	return &DeleteRoomTariffUseCase{repo: repo}
}

// Delete deletes a room tariff record.
func (uc *DeleteRoomTariffUseCase) Delete(ctx context.Context, id domain.RoomTariffID) error {
	return uc.repo.Delete(ctx, id)
}
