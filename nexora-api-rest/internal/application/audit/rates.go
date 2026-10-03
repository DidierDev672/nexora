package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// RatesUseCase lists the audited rate catalog (SRP).
type RatesUseCase struct {
	repo domain.AuditRepository
}

// NewRatesUseCase builds the use case.
func NewRatesUseCase(repo domain.AuditRepository) *RatesUseCase {
	return &RatesUseCase{repo: repo}
}

// Rates returns the full rate catalog for pricing control.
func (uc *RatesUseCase) Rates(ctx context.Context) ([]domain.Rate, error) {
	return uc.repo.Rates(ctx)
}
