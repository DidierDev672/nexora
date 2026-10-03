package building

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteBuildingUseCase implements the "delete building" vertical slice.
type DeleteBuildingUseCase struct {
	repo domain.BuildingRepository
}

func NewDeleteBuildingUseCase(repo domain.BuildingRepository) *DeleteBuildingUseCase {
	return &DeleteBuildingUseCase{repo: repo}
}

func (uc *DeleteBuildingUseCase) Delete(ctx context.Context, id domain.BuildingID) error {
	return uc.repo.Delete(ctx, id)
}
