package bed

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetBedUseCase implements the "get bed by id" vertical slice.
type GetBedUseCase struct {
	repo domain.BedRepository
}

func NewGetBedUseCase(repo domain.BedRepository) *GetBedUseCase {
	return &GetBedUseCase{repo: repo}
}

func (uc *GetBedUseCase) GetByID(ctx context.Context, id domain.BedID) (domain.Bed, error) {
	return uc.repo.FindByID(ctx, id)
}
