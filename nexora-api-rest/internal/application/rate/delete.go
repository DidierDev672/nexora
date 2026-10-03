package rate

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteRateUseCase removes a rate by ID (SRP).
type DeleteRateUseCase struct {
	repo domain.RateRepository
}

// NewDeleteRateUseCase builds the use case.
func NewDeleteRateUseCase(repo domain.RateRepository) *DeleteRateUseCase {
	return &DeleteRateUseCase{repo: repo}
}

// Delete deletes a rate record.
func (uc *DeleteRateUseCase) Delete(ctx context.Context, id domain.RateID) error {
	return uc.repo.Delete(ctx, id)
}
