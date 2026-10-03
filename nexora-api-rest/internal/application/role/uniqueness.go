package role

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueName fails if another role already owns the given name.
// Shared by every use case that mutates a role name (DRY, kept out of
// the use cases so each keeps a single responsibility).
func assertUniqueName(ctx context.Context, repo domain.RoleRepository, id domain.RoleID, name string) error {
	existing, err := repo.FindByName(ctx, name)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrRoleDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrRoleNotFound):
		return nil
	default:
		return err
	}
}
