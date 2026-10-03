package domain

import "context"

// ReserveRepository defines the persistence port for the reservation aggregate (DIP).
type ReserveRepository interface {
	FindAll(ctx context.Context) ([]Reserve, error)
	FindByID(ctx context.Context, id ReserveID) (Reserve, error)
	Save(ctx context.Context, reserve Reserve) (Reserve, error)
	Update(ctx context.Context, reserve Reserve) (Reserve, error)
	Delete(ctx context.Context, id ReserveID) error
	EnsureTable(ctx context.Context) error
}
