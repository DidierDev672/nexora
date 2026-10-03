package bedtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteBedTypeUseCase implements the "delete bed type" vertical slice.
type DeleteBedTypeUseCase struct {
	repo domain.BedTypeRepository
}

func NewDeleteBedTypeUseCase(repo domain.BedTypeRepository) *DeleteBedTypeUseCase {
	return &DeleteBedTypeUseCase{repo: repo}
}

func (uc *DeleteBedTypeUseCase) Delete(ctx context.Context, id domain.BedTypeID) error {
	return uc.repo.Delete(ctx, id)
}
