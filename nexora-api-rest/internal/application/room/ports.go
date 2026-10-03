package room

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created rooms.
type IDProvider interface {
	NewRoomID() domain.RoomID
}

// RoomCreator is the narrow port used by the HTTP layer (ISP).
type RoomCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Room, error)
}

// RoomLister returns all existing rooms.
type RoomLister interface {
	List(ctx context.Context) ([]domain.Room, error)
}

// RoomGetter returns a single room by id.
type RoomGetter interface {
	GetByID(ctx context.Context, id domain.RoomID) (domain.Room, error)
}

// RoomUpdater edits an existing room.
type RoomUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Room, error)
}

// RoomDeleter removes a room by id.
type RoomDeleter interface {
	Delete(ctx context.Context, id domain.RoomID) error
}
