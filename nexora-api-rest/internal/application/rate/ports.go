package rate

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates domain identifiers for new rates.
type IDProvider interface {
	NewRateID() domain.RateID
}

// RateCreator is the narrow port for creating rates (ISP).
type RateCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Rate, error)
}

// RateLister is the narrow port for searching the rate catalog.
type RateLister interface {
	List(ctx context.Context, filter domain.RateFilter) ([]domain.Rate, error)
}

// RateGetter is the narrow port for fetching a single rate by ID.
type RateGetter interface {
	GetByID(ctx context.Context, id domain.RateID) (domain.Rate, error)
}

// RateUpdater is the narrow port for updating an existing rate.
type RateUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Rate, error)
}

// RateDeleter is the narrow port for removing a rate.
type RateDeleter interface {
	Delete(ctx context.Context, id domain.RateID) error
}
