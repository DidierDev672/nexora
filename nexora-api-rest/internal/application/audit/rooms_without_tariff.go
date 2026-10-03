package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// RoomsWithoutTariffUseCase lists the room coverage gaps (SRP).
type RoomsWithoutTariffUseCase struct {
	repo domain.AuditRepository
}

// NewRoomsWithoutTariffUseCase builds the use case.
func NewRoomsWithoutTariffUseCase(repo domain.AuditRepository) *RoomsWithoutTariffUseCase {
	return &RoomsWithoutTariffUseCase{repo: repo}
}

// RoomsWithoutTariff returns every room with no active room tariff assigned,
// i.e. rooms that cannot be priced when sold.
func (uc *RoomsWithoutTariffUseCase) RoomsWithoutTariff(ctx context.Context) ([]domain.AuditRoomGap, error) {
	return uc.repo.RoomsWithoutTariff(ctx)
}
