package domain

import "context"

// StayRepository defines the persistence port for the Stay aggregate (DIP).
type StayRepository interface {
	FindAll(ctx context.Context) ([]Stay, error)
	FindByID(ctx context.Context, id StayID) (Stay, error)
	// FindByRoomID returns the most recent stay of a room; ErrStayNotFound
	// when the room has no stays.
	FindByRoomID(ctx context.Context, roomID RoomID) (Stay, error)
	// FindPersonsByStayID returns the guests (persons) linked to a stay
	// through the stays_persons pivot, following the joining order.
	FindPersonsByStayID(ctx context.Context, stayID StayID) ([]Person, error)
	Save(ctx context.Context, stay Stay) (Stay, error)
	Update(ctx context.Context, stay Stay) (Stay, error)
	Delete(ctx context.Context, id StayID) error
	EnsureTable(ctx context.Context) error
}
