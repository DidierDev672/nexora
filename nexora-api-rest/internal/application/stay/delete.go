package stay

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteStayUseCase removes a stay by ID (SRP).
type DeleteStayUseCase struct {
	repo domain.StayRepository
}

// NewDeleteStayUseCase builds the use case.
func NewDeleteStayUseCase(repo domain.StayRepository) *DeleteStayUseCase {
	return &DeleteStayUseCase{repo: repo}
}

// Delete deletes a stay record.
func (uc *DeleteStayUseCase) Delete(ctx context.Context, id domain.StayID) error {
	return uc.repo.Delete(ctx, id)
}
