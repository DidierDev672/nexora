package domain

import "context"

// RoleRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type RoleRepository interface {
	FindAll(ctx context.Context) ([]Role, error)
	FindByID(ctx context.Context, id RoleID) (Role, error)
	FindByName(ctx context.Context, name string) (Role, error)
	Save(ctx context.Context, role Role) error
	Update(ctx context.Context, role Role) error
	Delete(ctx context.Context, id RoleID) error
}
