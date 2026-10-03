package headquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created headquarters.
type IDProvider interface {
	NewHeadquarterID() domain.HeadquarterID
}

// HeadquarterCreator is the narrow port used by the HTTP layer (ISP).
type HeadquarterCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Headquarter, error)
}

// HeadquarterLister returns all existing headquarters.
type HeadquarterLister interface {
	List(ctx context.Context) ([]domain.Headquarter, error)
}

// HeadquarterGetter returns a single headquarter by id.
type HeadquarterGetter interface {
	GetByID(ctx context.Context, id domain.HeadquarterID) (domain.Headquarter, error)
}

// HeadquarterUpdater edits an existing headquarter.
type HeadquarterUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Headquarter, error)
}

// HeadquarterDeleter removes a headquarter by id.
type HeadquarterDeleter interface {
	Delete(ctx context.Context, id domain.HeadquarterID) error
}
