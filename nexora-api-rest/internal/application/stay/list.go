package stay

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListStaysUseCase lists all stays (SRP).
type ListStaysUseCase struct {
	repo domain.StayRepository
}

// NewListStaysUseCase builds the use case.
func NewListStaysUseCase(repo domain.StayRepository) *ListStaysUseCase {
	return &ListStaysUseCase{repo: repo}
}

// List returns all recorded stays.
func (uc *ListStaysUseCase) List(ctx context.Context) ([]domain.Stay, error) {
	return uc.repo.FindAll(ctx)
}
