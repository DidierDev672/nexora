package stay

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetStayUseCase fetches a single stay by ID (SRP).
type GetStayUseCase struct {
	repo domain.StayRepository
}

// NewGetStayUseCase builds the use case.
func NewGetStayUseCase(repo domain.StayRepository) *GetStayUseCase {
	return &GetStayUseCase{repo: repo}
}

// GetByID finds a stay by its identifier.
func (uc *GetStayUseCase) GetByID(ctx context.Context, id domain.StayID) (domain.Stay, error) {
	return uc.repo.FindByID(ctx, id)
}
