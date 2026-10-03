package bedtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created bed types.
type IDProvider interface {
	NewBedTypeID() domain.BedTypeID
}

// BedTypeCreator is the narrow port used by the HTTP layer (ISP).
type BedTypeCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.BedType, error)
}

// BedTypeLister returns all existing bed types.
type BedTypeLister interface {
	List(ctx context.Context) ([]domain.BedType, error)
}

// BedTypeGetter returns a single bed type by id.
type BedTypeGetter interface {
	GetByID(ctx context.Context, id domain.BedTypeID) (domain.BedType, error)
}

// BedTypeUpdater edits an existing bed type.
type BedTypeUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.BedType, error)
}

// BedTypeDeleter removes a bed type by id.
type BedTypeDeleter interface {
	Delete(ctx context.Context, id domain.BedTypeID) error
}
