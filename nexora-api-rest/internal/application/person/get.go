package person

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetPersonUseCase implements the "get person" vertical slice.
type GetPersonUseCase struct {
	repo domain.PersonRepository
}

func NewGetPersonUseCase(repo domain.PersonRepository) *GetPersonUseCase {
	return &GetPersonUseCase{repo: repo}
}

func (uc *GetPersonUseCase) GetByID(ctx context.Context, id domain.PersonID) (domain.Person, error) {
	return uc.repo.FindByID(ctx, id)
}
