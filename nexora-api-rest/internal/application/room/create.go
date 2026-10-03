package room

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a room. Status defaults to
// available when empty; a nil PriceOverride is normalized to zero so the
// price override column is never left NULL at creation time.
type CreateInput struct {
	Number        string
	Floor         int
	RoomTypeID    domain.RoomTypeID
	BuildingID    domain.BuildingID
	PriceOverride *domain.BasePrice
	Status        string
	HasReception  bool
	CreatedBy     string
}

// CreateRoomUseCase implements the "create room" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateRoomUseCase struct {
	repo       domain.RoomRepository
	idProvider IDProvider
}

func NewCreateRoomUseCase(repo domain.RoomRepository, idProvider IDProvider) *CreateRoomUseCase {
	return &CreateRoomUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateRoomUseCase) Create(ctx context.Context, in CreateInput) (domain.Room, error) {
	// Default to available first: ParseRoomStatus("") returns an error, so a
	// missing status must never reach the parser.
	status := domain.RoomStatusAvailable
	if in.Status != "" {
		parsed, err := domain.ParseRoomStatus(in.Status)
		if err != nil {
			return domain.Room{}, err
		}
		status = parsed
	}

	// A null/omitted price_override becomes an explicit zero override instead
	// of a NULL column, keeping the "no empty price" invariant at creation.
	priceOverride := in.PriceOverride
	if priceOverride == nil {
		zero := domain.BasePrice(0)
		priceOverride = &zero
	}

	room, err := domain.NewRoom(
		uc.idProvider.NewRoomID(),
		in.Number,
		in.Floor,
		in.RoomTypeID,
		in.BuildingID,
		priceOverride,
		status,
		in.HasReception,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Room{}, err
	}
	if err := assertUniqueNumber(ctx, uc.repo, room.ID, room.Number, room.BuildingID); err != nil {
		return domain.Room{}, err
	}
	// Save returns the persisted room, so the database clock is respected
	// without a second query.
	return uc.repo.Save(ctx, room)
}
