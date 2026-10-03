package stay

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetRoomReceptionUseCase queries the most recent stay of a room regardless
// of its status, which is what the reception front displays for a room.
type GetRoomReceptionUseCase struct {
	stayRepo domain.StayRepository
}

func NewGetRoomReceptionUseCase(stayRepo domain.StayRepository) *GetRoomReceptionUseCase {
	return &GetRoomReceptionUseCase{stayRepo: stayRepo}
}

// GetByRoomID returns the most recent stay of the room.
func (uc *GetRoomReceptionUseCase) GetByRoomID(ctx context.Context, roomID domain.RoomID) (domain.Stay, error) {
	return uc.stayRepo.FindByRoomID(ctx, roomID)
}
