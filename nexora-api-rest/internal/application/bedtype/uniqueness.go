package bedtype

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueName fails if another bed type already owns the given name.
// Shared by every use case that mutates a bed type name (DRY, kept out of
// the use cases so each keeps a single responsibility).
func assertUniqueName(ctx context.Context, repo domain.BedTypeRepository, id domain.BedTypeID, name string) error {
	existing, err := repo.FindByName(ctx, name)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrBedTypeDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrBedTypeNotFound):
		return nil
	default:
		return err
	}
}
