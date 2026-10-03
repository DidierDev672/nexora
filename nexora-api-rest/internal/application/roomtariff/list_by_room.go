package roomtariff

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListRoomTariffsByRoomUseCase lists the tariffs applied to a single room
// (SRP) so a client can tell, given a room, which rates are attached to it.
type ListRoomTariffsByRoomUseCase struct {
	repo domain.RoomTariffRepository
}

// NewListRoomTariffsByRoomUseCase builds the use case.
func NewListRoomTariffsByRoomUseCase(repo domain.RoomTariffRepository) *ListRoomTariffsByRoomUseCase {
	return &ListRoomTariffsByRoomUseCase{repo: repo}
}

// ListByRoom returns every room tariff matching the room, default first.
func (uc *ListRoomTariffsByRoomUseCase) ListByRoom(ctx context.Context, roomID domain.RoomID) ([]domain.RoomTariff, error) {
	return uc.repo.FindByRoom(ctx, roomID)
}
