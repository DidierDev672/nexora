package palette

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeletePaletteUseCase implements the "delete palette" vertical slice.
type DeletePaletteUseCase struct {
	repo domain.PaletteRepository
}

func NewDeletePaletteUseCase(repo domain.PaletteRepository) *DeletePaletteUseCase {
	return &DeletePaletteUseCase{repo: repo}
}

func (uc *DeletePaletteUseCase) Delete(ctx context.Context, id domain.PaletteID) error {
	return uc.repo.Delete(ctx, id)
}
