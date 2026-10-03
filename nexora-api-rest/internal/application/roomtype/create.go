package roomtype

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a room type.
type CreateInput struct {
	Name      string
	Capacity  int
	BasePrice float64
	CreatedBy string
}

// CreateRoomTypeUseCase implements the "create room type" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateRoomTypeUseCase struct {
	repo       domain.RoomTypeRepository
	idProvider IDProvider
}

func NewCreateRoomTypeUseCase(repo domain.RoomTypeRepository, idProvider IDProvider) *CreateRoomTypeUseCase {
	return &CreateRoomTypeUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateRoomTypeUseCase) Create(ctx context.Context, in CreateInput) (domain.RoomType, error) {
	capacity, err := domain.NewCapacity(in.Capacity)
	if err != nil {
		return domain.RoomType{}, err
	}
	basePrice, err := domain.NewBasePrice(in.BasePrice)
	if err != nil {
		return domain.RoomType{}, err
	}
	roomType, err := domain.NewRoomType(
		uc.idProvider.NewRoomTypeID(),
		in.Name,
		capacity,
		basePrice,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.RoomType{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, roomType.ID, roomType.Name); err != nil {
		return domain.RoomType{}, err
	}
	if err := uc.repo.Save(ctx, roomType); err != nil {
		return domain.RoomType{}, err
	}
	// Re-fetch so created_at/updated_at match the database clock.
	return uc.repo.FindByID(ctx, roomType.ID)
}
