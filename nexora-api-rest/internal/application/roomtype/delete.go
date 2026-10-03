package roomtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteRoomTypeUseCase implements the "delete room type" vertical slice.
type DeleteRoomTypeUseCase struct {
	repo domain.RoomTypeRepository
}

func NewDeleteRoomTypeUseCase(repo domain.RoomTypeRepository) *DeleteRoomTypeUseCase {
	return &DeleteRoomTypeUseCase{repo: repo}
}

func (uc *DeleteRoomTypeUseCase) Delete(ctx context.Context, id domain.RoomTypeID) error {
	return uc.repo.Delete(ctx, id)
}
