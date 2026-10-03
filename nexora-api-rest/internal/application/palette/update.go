package palette

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a palette.
type UpdateInput struct {
	ID        domain.PaletteID
	Name      string
	Colors    []ColorInput
	IsDefined bool
}

// UpdatePaletteUseCase implements the "update palette" vertical slice.
type UpdatePaletteUseCase struct {
	repo domain.PaletteRepository
}

func NewUpdatePaletteUseCase(repo domain.PaletteRepository) *UpdatePaletteUseCase {
	return &UpdatePaletteUseCase{repo: repo}
}

func (uc *UpdatePaletteUseCase) Update(ctx context.Context, in UpdateInput) (domain.Palette, error) {
	palette, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Palette{}, err
	}
	colors, err := buildColors(in.Colors)
	if err != nil {
		return domain.Palette{}, err
	}
	// Mutate through domain behavior methods so invariants stay intact.
	if err := palette.Rename(in.Name); err != nil {
		return domain.Palette{}, err
	}
	if err := palette.ReplaceColors(colors); err != nil {
		return domain.Palette{}, err
	}
	if in.IsDefined {
		palette.MarkDefined()
	} else {
		palette.MarkUndefined()
	}
	if err := assertUniqueName(ctx, uc.repo, palette.ID, palette.Name); err != nil {
		return domain.Palette{}, err
	}
	if err := uc.repo.Update(ctx, palette); err != nil {
		return domain.Palette{}, err
	}
	return palette, nil
}
