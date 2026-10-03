package palette

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListPalettesUseCase implements the "list palettes" vertical slice.
type ListPalettesUseCase struct {
	repo domain.PaletteRepository
}

func NewListPalettesUseCase(repo domain.PaletteRepository) *ListPalettesUseCase {
	return &ListPalettesUseCase{repo: repo}
}

func (uc *ListPalettesUseCase) List(ctx context.Context) ([]domain.Palette, error) {
	return uc.repo.FindAll(ctx)
}
