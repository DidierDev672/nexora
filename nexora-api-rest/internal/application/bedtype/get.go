package bedtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetBedTypeUseCase implements the "get bed type by id" vertical slice.
type GetBedTypeUseCase struct {
	repo domain.BedTypeRepository
}

func NewGetBedTypeUseCase(repo domain.BedTypeRepository) *GetBedTypeUseCase {
	return &GetBedTypeUseCase{repo: repo}
}

func (uc *GetBedTypeUseCase) GetByID(ctx context.Context, id domain.BedTypeID) (domain.BedType, error) {
	return uc.repo.FindByID(ctx, id)
}
