package auth

import (
	"context"
	"errors"
	"strings"

	"nexora-api-rest/internal/domain"
)

// ErrInvalidCredentials is the only failure the login slice surfaces as 401.
// Returning it for both "email unknown" and "password wrong" prevents account
// enumeration through distinct error messages.
var ErrInvalidCredentials = errors.New("invalid credentials")

// AuthenticateInput carries the raw login credentials.
type AuthenticateInput struct {
	Email    string
	Password string
}

// AuthenticateUseCase implements the "login" vertical slice:
// find by email -> reject inactive accounts -> verify bcrypt -> sign token.
type AuthenticateUseCase struct {
	repo     domain.UserRepository
	verifier PasswordVerifier
	tokens   TokenGenerator
	dummy    string
}

// NewAuthenticateUseCase wires persistence, password verification and token
// signing. dummyHash is a bcrypt hash of a fixed non-secret password used to
// keep comparison time constant when the email does not exist.
func NewAuthenticateUseCase(repo domain.UserRepository, verifier PasswordVerifier, tokens TokenGenerator, dummyHash string) *AuthenticateUseCase {
	return &AuthenticateUseCase{repo: repo, verifier: verifier, tokens: tokens, dummy: dummyHash}
}

// Authenticate verifies the credentials and returns a signed token on success.
func (uc *AuthenticateUseCase) Authenticate(ctx context.Context, in AuthenticateInput) (string, error) {
	email := strings.ToLower(strings.TrimSpace(in.Email))

	user, err := uc.repo.FindByEmail(ctx, email)
	if errors.Is(err, domain.ErrUserNotFound) {
		// The email does not exist, but spending the same bcrypt cost here
		// keeps response time constant and hides that fact (anti-timing).
		uc.verifier.Compare(in.Password, uc.dummy)
		return "", ErrInvalidCredentials
	}
	if err != nil {
		return "", err
	}

	if user.Status != domain.UserStatusActive {
		// Inactive accounts are rejected with the same generic error, again
		// consuming the same work so the reason stays unobservable.
		uc.verifier.Compare(in.Password, uc.dummy)
		return "", ErrInvalidCredentials
	}

	if err := uc.verifier.Compare(in.Password, user.PasswordHash); err != nil {
		return "", ErrInvalidCredentials
	}

	return uc.tokens.GenerateForUser(user.ID)
}
