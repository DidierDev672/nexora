package bed

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created beds.
type IDProvider interface {
	NewBedID() domain.BedID
}

// BedCreator is the narrow port used by the HTTP layer (ISP).
type BedCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Bed, error)
}

// BedLister returns all existing beds.
type BedLister interface {
	List(ctx context.Context) ([]domain.Bed, error)
}

// BedGetter returns a single bed by id.
type BedGetter interface {
	GetByID(ctx context.Context, id domain.BedID) (domain.Bed, error)
}

// BedUpdater edits an existing bed.
type BedUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Bed, error)
}

// BedDeleter removes a bed by id.
type BedDeleter interface {
	Delete(ctx context.Context, id domain.BedID) error
}
