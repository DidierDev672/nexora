package headquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteHeadquarterUseCase implements the "delete headquarter" vertical slice.
type DeleteHeadquarterUseCase struct {
	repo domain.HeadquarterRepository
}

func NewDeleteHeadquarterUseCase(repo domain.HeadquarterRepository) *DeleteHeadquarterUseCase {
	return &DeleteHeadquarterUseCase{repo: repo}
}

func (uc *DeleteHeadquarterUseCase) Delete(ctx context.Context, id domain.HeadquarterID) error {
	return uc.repo.Delete(ctx, id)
}
