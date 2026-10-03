package palette

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetPaletteUseCase implements the "get palette by id" vertical slice.
type GetPaletteUseCase struct {
	repo domain.PaletteRepository
}

func NewGetPaletteUseCase(repo domain.PaletteRepository) *GetPaletteUseCase {
	return &GetPaletteUseCase{repo: repo}
}

func (uc *GetPaletteUseCase) GetByID(ctx context.Context, id domain.PaletteID) (domain.Palette, error) {
	return uc.repo.FindByID(ctx, id)
}
