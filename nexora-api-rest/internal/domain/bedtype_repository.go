package domain

import "context"

// BedTypeRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type BedTypeRepository interface {
	FindAll(ctx context.Context) ([]BedType, error)
	FindByID(ctx context.Context, id BedTypeID) (BedType, error)
	FindByName(ctx context.Context, name string) (BedType, error)
	Save(ctx context.Context, bedType BedType) error
	Update(ctx context.Context, bedType BedType) error
	Delete(ctx context.Context, id BedTypeID) error
}
