package building

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListBuildingsUseCase implements the "list buildings" vertical slice.
type ListBuildingsUseCase struct {
	repo domain.BuildingRepository
}

func NewListBuildingsUseCase(repo domain.BuildingRepository) *ListBuildingsUseCase {
	return &ListBuildingsUseCase{repo: repo}
}

func (uc *ListBuildingsUseCase) List(ctx context.Context) ([]domain.Building, error) {
	return uc.repo.FindAll(ctx)
}
