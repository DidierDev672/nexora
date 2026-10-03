package rate

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetRateUseCase fetches a single rate by ID (SRP).
type GetRateUseCase struct {
	repo domain.RateRepository
}

// NewGetRateUseCase builds the use case.
func NewGetRateUseCase(repo domain.RateRepository) *GetRateUseCase {
	return &GetRateUseCase{repo: repo}
}

// GetByID finds a rate by its identifier.
func (uc *GetRateUseCase) GetByID(ctx context.Context, id domain.RateID) (domain.Rate, error) {
	return uc.repo.FindByID(ctx, id)
}
