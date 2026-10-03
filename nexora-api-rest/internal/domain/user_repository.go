package domain

import "context"

// UserRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type UserRepository interface {
	FindAll(ctx context.Context) ([]User, error)
	FindByID(ctx context.Context, id UserID) (User, error)
	FindByEmail(ctx context.Context, email string) (User, error)
	Save(ctx context.Context, user User) error
	Update(ctx context.Context, user User) error
	Delete(ctx context.Context, id UserID) error
}
