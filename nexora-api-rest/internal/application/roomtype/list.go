package roomtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListRoomTypesUseCase implements the "list room types" vertical slice.
type ListRoomTypesUseCase struct {
	repo domain.RoomTypeRepository
}

func NewListRoomTypesUseCase(repo domain.RoomTypeRepository) *ListRoomTypesUseCase {
	return &ListRoomTypesUseCase{repo: repo}
}

func (uc *ListRoomTypesUseCase) List(ctx context.Context) ([]domain.RoomType, error) {
	return uc.repo.FindAll(ctx)
}
