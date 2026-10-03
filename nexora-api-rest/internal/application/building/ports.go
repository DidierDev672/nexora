package building

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider abstracts the generation of building identifiers so the
// application layer never couples to a specific id implementation.
type IDProvider interface {
	NewBuildingID() domain.BuildingID
}

// Narrow ports (ISP): each consumer depends only on the operation it uses.
type BuildingCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Building, error)
}

type BuildingLister interface {
	List(ctx context.Context) ([]domain.Building, error)
}

type BuildingGetter interface {
	GetByID(ctx context.Context, id domain.BuildingID) (domain.Building, error)
}

type BuildingUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Building, error)
}

type BuildingDeleter interface {
	Delete(ctx context.Context, id domain.BuildingID) error
}
