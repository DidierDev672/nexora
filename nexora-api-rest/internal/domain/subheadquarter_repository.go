package domain

import "context"

// SubHeadquarterRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type SubHeadquarterRepository interface {
	FindAll(ctx context.Context) ([]SubHeadquarter, error)
	FindByID(ctx context.Context, id SubHeadquarterID) (SubHeadquarter, error)
	FindByHeadquarter(ctx context.Context, headquarterID HeadquarterID) ([]SubHeadquarter, error)
	FindByHeadquarterAndName(ctx context.Context, headquarterID HeadquarterID, name string) (SubHeadquarter, error)
	Save(ctx context.Context, subHeadquarter SubHeadquarter) error
	Update(ctx context.Context, subHeadquarter SubHeadquarter) error
	Delete(ctx context.Context, id SubHeadquarterID) error
}
