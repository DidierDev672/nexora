package domain

import "context"

// RoomRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type RoomRepository interface {
	FindAll(ctx context.Context) ([]Room, error)
	FindByID(ctx context.Context, id RoomID) (Room, error)
	// FindByNumberAndBuilding locates a room by its number inside a building;
	// room numbers only have to be unique per building.
	FindByNumberAndBuilding(ctx context.Context, number string, buildingID BuildingID) (Room, error)
	// Save and Update return the persisted room so callers get the database
	// timestamps without a second round trip.
	Save(ctx context.Context, room Room) (Room, error)
	Update(ctx context.Context, room Room) (Room, error)
	Delete(ctx context.Context, id RoomID) error
}
