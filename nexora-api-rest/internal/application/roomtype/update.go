package roomtype

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a room type (PUT).
// Only set fields are applied: Name empty, Capacity nil or BasePrice nil
// leave the current value untouched.
type UpdateInput struct {
	ID        domain.RoomTypeID
	Name      string
	Capacity  *int
	BasePrice *float64
}

// UpdateRoomTypeUseCase implements the "update room type" vertical slice:
// load -> mutate through domain behavior -> uniqueness -> persist.
type UpdateRoomTypeUseCase struct {
	repo domain.RoomTypeRepository
}

func NewUpdateRoomTypeUseCase(repo domain.RoomTypeRepository) *UpdateRoomTypeUseCase {
	return &UpdateRoomTypeUseCase{repo: repo}
}

func (uc *UpdateRoomTypeUseCase) Update(ctx context.Context, in UpdateInput) (domain.RoomType, error) {
	roomType, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.RoomType{}, err
	}

	// Mutate through domain behavior methods so invariants stay intact.
	if in.Name != "" {
		if err := roomType.Rename(in.Name); err != nil {
			return domain.RoomType{}, err
		}
	}
	if in.Capacity != nil {
		if err := roomType.ChangeCapacity(*in.Capacity); err != nil {
			return domain.RoomType{}, err
		}
	}
	if in.BasePrice != nil {
		if err := roomType.ChangeBasePrice(*in.BasePrice); err != nil {
			return domain.RoomType{}, err
		}
	}

	if err := assertUniqueName(ctx, uc.repo, roomType.ID, roomType.Name); err != nil {
		return domain.RoomType{}, err
	}
	roomType.UpdatedAt = time.Now().UTC()
	if err := uc.repo.Update(ctx, roomType); err != nil {
		return domain.RoomType{}, err
	}
	// Re-fetch so updated_at matches the database clock.
	return uc.repo.FindByID(ctx, roomType.ID)
}
