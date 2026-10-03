package palette

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// ColorInput carries the raw color data coming from the HTTP layer.
type ColorInput struct {
	Hex  string
	Name string
}

// CreateInput carries the data required to create a palette.
type CreateInput struct {
	Name      string
	Colors    []ColorInput
	IsDefined bool
}

// CreatePaletteUseCase implements the "create palette" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreatePaletteUseCase struct {
	repo       domain.PaletteRepository
	idProvider IDProvider
}

func NewCreatePaletteUseCase(repo domain.PaletteRepository, idProvider IDProvider) *CreatePaletteUseCase {
	return &CreatePaletteUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreatePaletteUseCase) Create(ctx context.Context, in CreateInput) (domain.Palette, error) {
	colors, err := buildColors(in.Colors)
	if err != nil {
		return domain.Palette{}, err
	}
	palette, err := domain.NewPalette(
		uc.idProvider.NewPaletteID(),
		in.Name,
		colors,
		in.IsDefined,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Palette{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, palette.ID, palette.Name); err != nil {
		return domain.Palette{}, err
	}
	if err := uc.repo.Save(ctx, palette); err != nil {
		return domain.Palette{}, err
	}
	return palette, nil
}
