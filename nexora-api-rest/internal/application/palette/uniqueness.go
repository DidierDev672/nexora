package palette

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// buildColors converts raw hex/name pairs into domain value objects,
// enforcing each color's invariant through its own constructor.
func buildColors(in []ColorInput) ([]domain.Color, error) {
	colors := make([]domain.Color, 0, len(in))
	for _, c := range in {
		color, err := domain.NewColor(c.Hex, c.Name)
		if err != nil {
			return nil, err
		}
		colors = append(colors, color)
	}
	return colors, nil
}

// assertUniqueName fails if another palette already owns the given name.
// Shared by every use case that mutates a palette name (DRY, kept out of
// the use cases so each keeps a single responsibility).
func assertUniqueName(ctx context.Context, repo domain.PaletteRepository, id domain.PaletteID, name string) error {
	existing, err := repo.FindByName(ctx, name)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrPaletteDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrPaletteNotFound):
		return nil
	default:
		return err
	}
}
