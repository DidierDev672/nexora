package subheadquarter

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueNameInHeadquarter fails if the given headquarter already owns a
// sub headquarter with the given name. Shared by every use case that mutates a
// sub headquarter name (DRY, kept out of the use cases so each keeps a single
// responsibility). Uniqueness is scoped to the owning headquarter: the same
// name is allowed across different headquarters but not within the same one.
func assertUniqueNameInHeadquarter(ctx context.Context, repo domain.SubHeadquarterRepository, id domain.SubHeadquarterID, headquarterID domain.HeadquarterID, name string) error {
	existing, err := repo.FindByHeadquarterAndName(ctx, headquarterID, name)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrSubHeadquarterDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrSubHeadquarterNotFound):
		return nil
	default:
		return err
	}
}
