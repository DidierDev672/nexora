package domain

import "context"

// BedRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type BedRepository interface {
	FindAll(ctx context.Context) ([]Bed, error)
	FindByID(ctx context.Context, id BedID) (Bed, error)
	// FindByEtiquetteAndRoom locates a bed by its etiquette inside a room;
	// bed etiquettes only have to be unique per room.
	FindByEtiquetteAndRoom(ctx context.Context, etiquette string, roomID RoomID) (Bed, error)
	Save(ctx context.Context, bed Bed) error
	Update(ctx context.Context, bed Bed) error
	Delete(ctx context.Context, id BedID) error
}
