package reserve

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates domain identifiers for new reservations.
type IDProvider interface {
	NewReserveID() domain.ReserveID
}

// ReserveCreator is the narrow port for creating reservations (ISP).
type ReserveCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Reserve, error)
}

// ReserveLister is the narrow port for retrieving all reservations.
type ReserveLister interface {
	List(ctx context.Context) ([]domain.Reserve, error)
}

// ReserveGetter is the narrow port for fetching a single reservation by ID.
type ReserveGetter interface {
	GetByID(ctx context.Context, id domain.ReserveID) (domain.Reserve, error)
}

// ReserveUpdater is the narrow port for updating an existing reservation.
type ReserveUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Reserve, error)
}

// ReserveDeleter is the narrow port for removing a reservation.
type ReserveDeleter interface {
	Delete(ctx context.Context, id domain.ReserveID) error
}
