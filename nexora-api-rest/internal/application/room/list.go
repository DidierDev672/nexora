package room

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListRoomsUseCase implements the "list rooms" vertical slice.
type ListRoomsUseCase struct {
	repo domain.RoomRepository
}

func NewListRoomsUseCase(repo domain.RoomRepository) *ListRoomsUseCase {
	return &ListRoomsUseCase{repo: repo}
}

func (uc *ListRoomsUseCase) List(ctx context.Context) ([]domain.Room, error) {
	return uc.repo.FindAll(ctx)
}
