package room

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueNumber fails if another room already owns the given number
// inside the same building. Shared by every use case that mutates a room
// number or building (DRY, kept out of the use cases so each keeps a single
// responsibility).
func assertUniqueNumber(ctx context.Context, repo domain.RoomRepository, id domain.RoomID, number string, buildingID domain.BuildingID) error {
	existing, err := repo.FindByNumberAndBuilding(ctx, number, buildingID)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrRoomDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrRoomNotFound):
		return nil
	default:
		return err
	}
}
