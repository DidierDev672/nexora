package domain

import "context"

// RoomTypeRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type RoomTypeRepository interface {
	FindAll(ctx context.Context) ([]RoomType, error)
	FindByID(ctx context.Context, id RoomTypeID) (RoomType, error)
	FindByName(ctx context.Context, name string) (RoomType, error)
	Save(ctx context.Context, roomType RoomType) error
	Update(ctx context.Context, roomType RoomType) error
	Delete(ctx context.Context, id RoomTypeID) error
}
