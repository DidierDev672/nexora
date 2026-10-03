package palette

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created palettes.
type IDProvider interface {
	NewPaletteID() domain.PaletteID
}

// PaletteCreator is the narrow port used by the HTTP layer (ISP).
type PaletteCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Palette, error)
}

// PaletteLister returns all existing palettes.
type PaletteLister interface {
	List(ctx context.Context) ([]domain.Palette, error)
}

// PaletteGetter returns a single palette by id.
type PaletteGetter interface {
	GetByID(ctx context.Context, id domain.PaletteID) (domain.Palette, error)
}

// PaletteUpdater edits an existing palette.
type PaletteUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Palette, error)
}

// PaletteDeleter removes a palette by id.
type PaletteDeleter interface {
	Delete(ctx context.Context, id domain.PaletteID) error
}
