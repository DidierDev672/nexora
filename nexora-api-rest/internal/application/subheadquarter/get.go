package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetSubHeadquarterUseCase implements the "get sub headquarter by id" vertical slice.
type GetSubHeadquarterUseCase struct {
	repo domain.SubHeadquarterRepository
}

func NewGetSubHeadquarterUseCase(repo domain.SubHeadquarterRepository) *GetSubHeadquarterUseCase {
	return &GetSubHeadquarterUseCase{repo: repo}
}

func (uc *GetSubHeadquarterUseCase) GetByID(ctx context.Context, id domain.SubHeadquarterID) (domain.SubHeadquarter, error) {
	return uc.repo.FindByID(ctx, id)
}
