package user

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueEmail fails if another user already owns the given email.
// Shared by every use case that mutates a user email (DRY, kept out of
// the use cases so each keeps a single responsibility).
func assertUniqueEmail(ctx context.Context, repo domain.UserRepository, id domain.UserID, email string) error {
	existing, err := repo.FindByEmail(ctx, email)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrUserDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrUserNotFound):
		return nil
	default:
		return err
	}
}
