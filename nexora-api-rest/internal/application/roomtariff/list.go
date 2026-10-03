package roomtariff

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListRoomTariffsUseCase lists all room tariffs (SRP).
type ListRoomTariffsUseCase struct {
	repo domain.RoomTariffRepository
}

// NewListRoomTariffsUseCase builds the use case.
func NewListRoomTariffsUseCase(repo domain.RoomTariffRepository) *ListRoomTariffsUseCase {
	return &ListRoomTariffsUseCase{repo: repo}
}

// List returns all recorded room tariffs.
func (uc *ListRoomTariffsUseCase) List(ctx context.Context) ([]domain.RoomTariff, error) {
	return uc.repo.FindAll(ctx)
}
