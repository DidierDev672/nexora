package room

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetRoomUseCase implements the "get room by id" vertical slice.
type GetRoomUseCase struct {
	repo domain.RoomRepository
}

func NewGetRoomUseCase(repo domain.RoomRepository) *GetRoomUseCase {
	return &GetRoomUseCase{repo: repo}
}

func (uc *GetRoomUseCase) GetByID(ctx context.Context, id domain.RoomID) (domain.Room, error) {
	return uc.repo.FindByID(ctx, id)
}
