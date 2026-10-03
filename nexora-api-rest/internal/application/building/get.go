package building

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetBuildingUseCase implements the "get building by id" vertical slice.
type GetBuildingUseCase struct {
	repo domain.BuildingRepository
}

func NewGetBuildingUseCase(repo domain.BuildingRepository) *GetBuildingUseCase {
	return &GetBuildingUseCase{repo: repo}
}

func (uc *GetBuildingUseCase) GetByID(ctx context.Context, id domain.BuildingID) (domain.Building, error) {
	return uc.repo.FindByID(ctx, id)
}
