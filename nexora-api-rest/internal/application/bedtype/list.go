package bedtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListBedTypesUseCase implements the "list bed types" vertical slice.
type ListBedTypesUseCase struct {
	repo domain.BedTypeRepository
}

func NewListBedTypesUseCase(repo domain.BedTypeRepository) *ListBedTypesUseCase {
	return &ListBedTypesUseCase{repo: repo}
}

func (uc *ListBedTypesUseCase) List(ctx context.Context) ([]domain.BedType, error) {
	return uc.repo.FindAll(ctx)
}
