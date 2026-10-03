package person

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeletePersonUseCase implements the "delete person" vertical slice.
type DeletePersonUseCase struct {
	repo domain.PersonRepository
}

func NewDeletePersonUseCase(repo domain.PersonRepository) *DeletePersonUseCase {
	return &DeletePersonUseCase{repo: repo}
}

func (uc *DeletePersonUseCase) Delete(ctx context.Context, id domain.PersonID) error {
	return uc.repo.Delete(ctx, id)
}
