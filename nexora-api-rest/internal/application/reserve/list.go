package reserve

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListReservesUseCase handles querying all reservations.
type ListReservesUseCase struct {
	repo domain.ReserveRepository
}

// NewListReservesUseCase constructs the list use case.
func NewListReservesUseCase(repo domain.ReserveRepository) *ListReservesUseCase {
	return &ListReservesUseCase{repo: repo}
}

// List fetches all reservations from the repository.
func (uc *ListReservesUseCase) List(ctx context.Context) ([]domain.Reserve, error) {
	return uc.repo.FindAll(ctx)
}
