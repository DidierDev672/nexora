package domain

import "context"

// HeadquarterRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type HeadquarterRepository interface {
	FindAll(ctx context.Context) ([]Headquarter, error)
	FindByID(ctx context.Context, id HeadquarterID) (Headquarter, error)
	FindByName(ctx context.Context, name string) (Headquarter, error)
	Save(ctx context.Context, headquarter Headquarter) error
	Update(ctx context.Context, headquarter Headquarter) error
	Delete(ctx context.Context, id HeadquarterID) error
}
