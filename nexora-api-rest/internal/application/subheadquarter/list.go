package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListSubHeadquartersUseCase implements the "list sub headquarters" vertical slice.
type ListSubHeadquartersUseCase struct {
	repo domain.SubHeadquarterRepository
}

func NewListSubHeadquartersUseCase(repo domain.SubHeadquarterRepository) *ListSubHeadquartersUseCase {
	return &ListSubHeadquartersUseCase{repo: repo}
}

func (uc *ListSubHeadquartersUseCase) List(ctx context.Context) ([]domain.SubHeadquarter, error) {
	return uc.repo.FindAll(ctx)
}
