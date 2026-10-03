package rate

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListRatesUseCase searches the rate catalog (SRP).
type ListRatesUseCase struct {
	repo domain.RateRepository
}

// NewListRatesUseCase builds the use case.
func NewListRatesUseCase(repo domain.RateRepository) *ListRatesUseCase {
	return &ListRatesUseCase{repo: repo}
}

// List returns the rates matching the given filter.
func (uc *ListRatesUseCase) List(ctx context.Context, filter domain.RateFilter) ([]domain.Rate, error) {
	return uc.repo.FindAll(ctx, filter)
}
