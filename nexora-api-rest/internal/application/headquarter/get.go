package headquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetHeadquarterUseCase implements the "get headquarter by id" vertical slice.
type GetHeadquarterUseCase struct {
	repo domain.HeadquarterRepository
}

func NewGetHeadquarterUseCase(repo domain.HeadquarterRepository) *GetHeadquarterUseCase {
	return &GetHeadquarterUseCase{repo: repo}
}

func (uc *GetHeadquarterUseCase) GetByID(ctx context.Context, id domain.HeadquarterID) (domain.Headquarter, error) {
	return uc.repo.FindByID(ctx, id)
}
