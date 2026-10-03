package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListSubHeadquartersByHeadquarterUseCase implements the
// "list sub headquarters by headquarter" vertical slice.
type ListSubHeadquartersByHeadquarterUseCase struct {
	repo domain.SubHeadquarterRepository
}

func NewListSubHeadquartersByHeadquarterUseCase(repo domain.SubHeadquarterRepository) *ListSubHeadquartersByHeadquarterUseCase {
	return &ListSubHeadquartersByHeadquarterUseCase{repo: repo}
}

func (uc *ListSubHeadquartersByHeadquarterUseCase) ListByHeadquarter(ctx context.Context, headquarterID domain.HeadquarterID) ([]domain.SubHeadquarter, error) {
	return uc.repo.FindByHeadquarter(ctx, headquarterID)
}
