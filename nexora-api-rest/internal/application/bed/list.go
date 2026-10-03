package bed

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListBedsUseCase implements the "list beds" vertical slice.
type ListBedsUseCase struct {
	repo domain.BedRepository
}

func NewListBedsUseCase(repo domain.BedRepository) *ListBedsUseCase {
	return &ListBedsUseCase{repo: repo}
}

func (uc *ListBedsUseCase) List(ctx context.Context) ([]domain.Bed, error) {
	return uc.repo.FindAll(ctx)
}
