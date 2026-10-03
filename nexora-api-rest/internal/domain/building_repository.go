package domain

import "context"

// BuildingRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type BuildingRepository interface {
	FindAll(ctx context.Context) ([]Building, error)
	FindByID(ctx context.Context, id BuildingID) (Building, error)
	// FindByNameAndHeadquarter locates a building by its name inside a
	// headquarter; building names only have to be unique per headquarter.
	FindByNameAndHeadquarter(ctx context.Context, name string, headquartersID HeadquarterID) (Building, error)
	Save(ctx context.Context, building Building) error
	Update(ctx context.Context, building Building) error
	Delete(ctx context.Context, id BuildingID) error
}
