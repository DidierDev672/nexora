package auth

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// PasswordVerifier is the security port used by login (DIP): the application
// knows a stored hash must be compared, but the algorithm lives in the
// infrastructure layer.
type PasswordVerifier interface {
	Compare(password, hash string) error
}

// TokenGenerator issues signed access tokens for authenticated users.
type TokenGenerator interface {
	GenerateForUser(id domain.UserID) (string, error)
}

// Authenticator is the narrow port used by the HTTP layer (ISP).
type Authenticator interface {
	Authenticate(ctx context.Context, in AuthenticateInput) (string, error)
}
