package bed

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueEtiquette fails if another bed already owns the given etiquette
// inside the same room. Shared by every use case that mutates a bed etiquette
// or room (DRY, kept out of the use cases so each keeps a single
// responsibility).
func assertUniqueEtiquette(ctx context.Context, repo domain.BedRepository, id domain.BedID, etiquette string, roomID domain.RoomID) error {
	existing, err := repo.FindByEtiquetteAndRoom(ctx, etiquette, roomID)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrBedDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrBedNotFound):
		return nil
	default:
		return err
	}
}
