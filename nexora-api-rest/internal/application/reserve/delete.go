package reserve

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteReserveUseCase handles removing a reservation.
type DeleteReserveUseCase struct {
	repo domain.ReserveRepository
}

// NewDeleteReserveUseCase constructs the delete use case.
func NewDeleteReserveUseCase(repo domain.ReserveRepository) *DeleteReserveUseCase {
	return &DeleteReserveUseCase{repo: repo}
}

// Delete removes the reservation with the given ID.
func (uc *DeleteReserveUseCase) Delete(ctx context.Context, id domain.ReserveID) error {
	return uc.repo.Delete(ctx, id)
}
