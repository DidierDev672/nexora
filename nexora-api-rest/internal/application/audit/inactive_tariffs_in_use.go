package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// InactiveTariffsInUseUseCase lists the pricing consistency breaches (SRP).
type InactiveTariffsInUseUseCase struct {
	repo domain.AuditRepository
}

// NewInactiveTariffsInUseUseCase builds the use case.
func NewInactiveTariffsInUseUseCase(repo domain.AuditRepository) *InactiveTariffsInUseUseCase {
	return &InactiveTariffsInUseUseCase{repo: repo}
}

// InactiveTariffsInUse returns the active room-rate assignments that point at
// an inactive rate from the catalog.
func (uc *InactiveTariffsInUseUseCase) InactiveTariffsInUse(ctx context.Context) ([]domain.InactiveTariffInUse, error) {
	return uc.repo.InactiveTariffsInUse(ctx)
}
