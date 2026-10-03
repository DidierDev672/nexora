package domain

import "context"

// PaletteRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type PaletteRepository interface {
	FindAll(ctx context.Context) ([]Palette, error)
	FindByID(ctx context.Context, id PaletteID) (Palette, error)
	FindByName(ctx context.Context, name string) (Palette, error)
	Save(ctx context.Context, palette Palette) error
	Update(ctx context.Context, palette Palette) error
	Delete(ctx context.Context, id PaletteID) error
}
