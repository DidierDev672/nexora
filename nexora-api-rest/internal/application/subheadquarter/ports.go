package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created sub headquarters.
type IDProvider interface {
	NewSubHeadquarterID() domain.SubHeadquarterID
}

// SubHeadquarterCreator is the narrow port used by the HTTP layer (ISP).
type SubHeadquarterCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.SubHeadquarter, error)
}

// SubHeadquarterLister returns all existing sub headquarters.
type SubHeadquarterLister interface {
	List(ctx context.Context) ([]domain.SubHeadquarter, error)
}

// SubHeadquarterByHeadquarterLister returns the sub headquarters of a headquarter.
type SubHeadquarterByHeadquarterLister interface {
	ListByHeadquarter(ctx context.Context, headquarterID domain.HeadquarterID) ([]domain.SubHeadquarter, error)
}

// SubHeadquarterGetter returns a single sub headquarter by id.
type SubHeadquarterGetter interface {
	GetByID(ctx context.Context, id domain.SubHeadquarterID) (domain.SubHeadquarter, error)
}

// SubHeadquarterUpdater edits an existing sub headquarter.
type SubHeadquarterUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.SubHeadquarter, error)
}

// SubHeadquarterDeleter removes a sub headquarter by id.
type SubHeadquarterDeleter interface {
	Delete(ctx context.Context, id domain.SubHeadquarterID) error
}
