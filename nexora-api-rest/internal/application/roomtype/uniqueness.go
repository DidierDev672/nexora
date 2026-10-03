package roomtype

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueName fails if another room type already owns the given name.
// Shared by every use case that mutates a room type name (DRY, kept out of
// the use cases so each keeps a single responsibility).
func assertUniqueName(ctx context.Context, repo domain.RoomTypeRepository, id domain.RoomTypeID, name string) error {
	existing, err := repo.FindByName(ctx, name)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrRoomTypeDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrRoomTypeNotFound):
		return nil
	default:
		return err
	}
}
