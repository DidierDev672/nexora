package room

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteRoomUseCase implements the "delete room" vertical slice.
type DeleteRoomUseCase struct {
	repo domain.RoomRepository
}

func NewDeleteRoomUseCase(repo domain.RoomRepository) *DeleteRoomUseCase {
	return &DeleteRoomUseCase{repo: repo}
}

func (uc *DeleteRoomUseCase) Delete(ctx context.Context, id domain.RoomID) error {
	return uc.repo.Delete(ctx, id)
}
