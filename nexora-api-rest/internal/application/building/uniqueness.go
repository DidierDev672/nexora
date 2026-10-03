package building

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueName fails if another building already owns the given name
// inside the same headquarter. Shared by every use case that mutates a
// building name or headquarter (DRY, kept out of the use cases so each
// keeps a single responsibility).
func assertUniqueName(ctx context.Context, repo domain.BuildingRepository, id domain.BuildingID, name string, headquartersID domain.HeadquarterID) error {
	existing, err := repo.FindByNameAndHeadquarter(ctx, name, headquartersID)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrBuildingDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrBuildingNotFound):
		return nil
	default:
		return err
	}
}
