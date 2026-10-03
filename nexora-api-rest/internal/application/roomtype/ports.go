package roomtype

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created room types.
type IDProvider interface {
	NewRoomTypeID() domain.RoomTypeID
}

// RoomTypeCreator is the narrow port used by the HTTP layer (ISP).
type RoomTypeCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.RoomType, error)
}

// RoomTypeLister returns all existing room types.
type RoomTypeLister interface {
	List(ctx context.Context) ([]domain.RoomType, error)
}

// RoomTypeGetter returns a single room type by id.
type RoomTypeGetter interface {
	GetByID(ctx context.Context, id domain.RoomTypeID) (domain.RoomType, error)
}

// RoomTypeUpdater edits an existing room type.
type RoomTypeUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.RoomType, error)
}

// RoomTypeDeleter removes a room type by id.
type RoomTypeDeleter interface {
	Delete(ctx context.Context, id domain.RoomTypeID) error
}
