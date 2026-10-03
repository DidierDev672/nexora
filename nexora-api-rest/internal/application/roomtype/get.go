package roomtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetRoomTypeUseCase implements the "get room type by id" vertical slice.
type GetRoomTypeUseCase struct {
	repo domain.RoomTypeRepository
}

func NewGetRoomTypeUseCase(repo domain.RoomTypeRepository) *GetRoomTypeUseCase {
	return &GetRoomTypeUseCase{repo: repo}
}

func (uc *GetRoomTypeUseCase) GetByID(ctx context.Context, id domain.RoomTypeID) (domain.RoomType, error) {
	return uc.repo.FindByID(ctx, id)
}
