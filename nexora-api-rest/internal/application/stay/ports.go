package stay

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates domain identifiers for new stays.
type IDProvider interface {
	NewStayID() domain.StayID
}

// StayCreator is the narrow port for creating stays (ISP).
type StayCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Stay, error)
}

// StayLister is the narrow port for retrieving all stays.
type StayLister interface {
	List(ctx context.Context) ([]domain.Stay, error)
}

// StayGetter is the narrow port for fetching a single stay by ID.
type StayGetter interface {
	GetByID(ctx context.Context, id domain.StayID) (domain.Stay, error)
}

// StayUpdater is the narrow port for updating an existing stay.
type StayUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Stay, error)
}

// StayDeleter is the narrow port for removing a stay.
type StayDeleter interface {
	Delete(ctx context.Context, id domain.StayID) error
}

// RoomReceptionGetter is the narrow port for querying the most recent stay of
// a room at the reception front.
type RoomReceptionGetter interface {
	GetByRoomID(ctx context.Context, roomID domain.RoomID) (domain.Stay, error)
}

// StayPersonsLister is the narrow port for listing the persons of a stay.
type StayPersonsLister interface {
	ListByStay(ctx context.Context, stayID domain.StayID) ([]domain.Person, error)
}
