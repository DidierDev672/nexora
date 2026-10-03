package headquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListHeadquartersUseCase implements the "list headquarters" vertical slice.
type ListHeadquartersUseCase struct {
	repo domain.HeadquarterRepository
}

func NewListHeadquartersUseCase(repo domain.HeadquarterRepository) *ListHeadquartersUseCase {
	return &ListHeadquartersUseCase{repo: repo}
}

func (uc *ListHeadquartersUseCase) List(ctx context.Context) ([]domain.Headquarter, error) {
	return uc.repo.FindAll(ctx)
}
