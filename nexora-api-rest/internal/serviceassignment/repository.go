package serviceassignment

import "context"

// Repository define el contrato abstracto de persistencia del slice (DIP).
type Repository interface {
	EnsureTable(ctx context.Context) error
	Create(ctx context.Context, a ServiceAssignment) error
	GetByID(ctx context.Context, id ID) (ServiceAssignment, error)
	List(ctx context.Context) ([]ServiceAssignment, error)
	Update(ctx context.Context, a ServiceAssignment) error
	Delete(ctx context.Context, id ID) error
}
