package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// RoomsUseCase lists the auditable room inventory (SRP).
type RoomsUseCase struct {
	repo domain.AuditRepository
}

// NewRoomsUseCase builds the use case.
func NewRoomsUseCase(repo domain.AuditRepository) *RoomsUseCase {
	return &RoomsUseCase{repo: repo}
}

// Rooms returns every room with its prevailing default tariff, if any.
func (uc *RoomsUseCase) Rooms(ctx context.Context) ([]domain.AuditRoom, error) {
	return uc.repo.Rooms(ctx)
}
