package domain

import "context"

// RateFilter holds the optional criteria used to narrow the rate catalog.
// A nil field means the criterion is not applied.
type RateFilter struct {
	HeadquarterID    *HeadquarterID
	SubHeadquarterID *SubHeadquarterID
	RoomTypeID       *RoomTypeID
	Modality         *RateModality
	Status           *RateStatus
}

// IsEmpty reports whether the filter would match the whole catalog.
func (f RateFilter) IsEmpty() bool {
	return f.HeadquarterID == nil &&
		f.SubHeadquarterID == nil &&
		f.RoomTypeID == nil &&
		f.Modality == nil &&
		f.Status == nil
}

// RateRepository defines the persistence port for the Rate aggregate (DIP).
type RateRepository interface {
	FindAll(ctx context.Context, filter RateFilter) ([]Rate, error)
	FindByID(ctx context.Context, id RateID) (Rate, error)
	Save(ctx context.Context, rate Rate) (Rate, error)
	Update(ctx context.Context, rate Rate) (Rate, error)
	Delete(ctx context.Context, id RateID) error
	EnsureTable(ctx context.Context) error
}
