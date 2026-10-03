package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteSubHeadquarterUseCase implements the "delete sub headquarter" vertical slice.
type DeleteSubHeadquarterUseCase struct {
	repo domain.SubHeadquarterRepository
}

func NewDeleteSubHeadquarterUseCase(repo domain.SubHeadquarterRepository) *DeleteSubHeadquarterUseCase {
	return &DeleteSubHeadquarterUseCase{repo: repo}
}

func (uc *DeleteSubHeadquarterUseCase) Delete(ctx context.Context, id domain.SubHeadquarterID) error {
	return uc.repo.Delete(ctx, id)
}
