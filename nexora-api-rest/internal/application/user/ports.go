package user

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created users.
type IDProvider interface {
	NewUserID() domain.UserID
}

// PasswordHasher is the security port (DIP): the application knows a password
// must be hashed, but the algorithm lives in the infrastructure layer.
type PasswordHasher interface {
	Hash(password string) (string, error)
}

// UserCreator is the narrow port used by the HTTP layer (ISP).
type UserCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.User, error)
}

// UserLister returns all existing users.
type UserLister interface {
	List(ctx context.Context) ([]domain.User, error)
}

// UserGetter returns a single user by id.
type UserGetter interface {
	GetByID(ctx context.Context, id domain.UserID) (domain.User, error)
}

// UserUpdater edits an existing user.
type UserUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.User, error)
}

// UserDeleter removes a user by id.
type UserDeleter interface {
	Delete(ctx context.Context, id domain.UserID) error
}
