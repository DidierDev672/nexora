package reserve

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetReserveUseCase handles querying a single reservation by ID.
type GetReserveUseCase struct {
	repo domain.ReserveRepository
}

// NewGetReserveUseCase constructs the get use case.
func NewGetReserveUseCase(repo domain.ReserveRepository) *GetReserveUseCase {
	return &GetReserveUseCase{repo: repo}
}

// GetByID fetches a reservation by its unique identifier.
func (uc *GetReserveUseCase) GetByID(ctx context.Context, id domain.ReserveID) (domain.Reserve, error) {
	return uc.repo.FindByID(ctx, id)
}
