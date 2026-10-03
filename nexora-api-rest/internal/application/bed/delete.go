package bed

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteBedUseCase implements the "delete bed" vertical slice.
type DeleteBedUseCase struct {
	repo domain.BedRepository
}

func NewDeleteBedUseCase(repo domain.BedRepository) *DeleteBedUseCase {
	return &DeleteBedUseCase{repo: repo}
}

func (uc *DeleteBedUseCase) Delete(ctx context.Context, id domain.BedID) error {
	return uc.repo.Delete(ctx, id)
}
