package headquarter

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueName fails if another headquarter already owns the given name.
// Shared by every use case that mutates a headquarter name (DRY, kept out of
// the use cases so each keeps a single responsibility).
func assertUniqueName(ctx context.Context, repo domain.HeadquarterRepository, id domain.HeadquarterID, name string) error {
	existing, err := repo.FindByName(ctx, name)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrHeadquarterDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrHeadquarterNotFound):
		return nil
	default:
		return err
	}
}
