package room

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a room (PUT, full replace).
// PriceOverride is nullable: nil clears the override. An empty status means
// "available".
type UpdateInput struct {
	ID            domain.RoomID
	Number        string
	Floor         int
	RoomTypeID    domain.RoomTypeID
	BuildingID    domain.BuildingID
	PriceOverride *domain.BasePrice
	Status        string
	HasReception  bool
}

// UpdateRoomUseCase implements the "update room" vertical slice:
// load -> mutate through domain behavior -> uniqueness -> persist.
type UpdateRoomUseCase struct {
	repo domain.RoomRepository
}

func NewUpdateRoomUseCase(repo domain.RoomRepository) *UpdateRoomUseCase {
	return &UpdateRoomUseCase{repo: repo}
}

func (uc *UpdateRoomUseCase) Update(ctx context.Context, in UpdateInput) (domain.Room, error) {
	room, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Room{}, err
	}

	// Mutate through domain behavior methods so invariants stay intact.
	if err := room.ChangeNumber(in.Number); err != nil {
		return domain.Room{}, err
	}
	if err := room.ChangeFloor(in.Floor); err != nil {
		return domain.Room{}, err
	}
	if err := room.ReassignRoomType(in.RoomTypeID); err != nil {
		return domain.Room{}, err
	}
	if err := room.ReassignBuilding(in.BuildingID); err != nil {
		return domain.Room{}, err
	}
	if err := room.SetPriceOverride(in.PriceOverride); err != nil {
		return domain.Room{}, err
	}
	room.SetHasReception(in.HasReception)

	// Mirror create: an empty status means "available" instead of being
	// rejected by ChangeStatus (ParseRoomStatus("") is an error).
	status := in.Status
	if status == "" {
		status = string(domain.RoomStatusAvailable)
	}
	if err := room.ChangeStatus(status); err != nil {
		return domain.Room{}, err
	}

	if err := assertUniqueNumber(ctx, uc.repo, room.ID, room.Number, room.BuildingID); err != nil {
		return domain.Room{}, err
	}
	room.UpdatedAt = time.Now().UTC()
	// Update returns the persisted room, so updated_at matches the database
	// clock without a second query.
	return uc.repo.Update(ctx, room)
}
