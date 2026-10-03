package person

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListPersonsUseCase implements the "list persons" vertical slice.
type ListPersonsUseCase struct {
	repo domain.PersonRepository
}

func NewListPersonsUseCase(repo domain.PersonRepository) *ListPersonsUseCase {
	return &ListPersonsUseCase{repo: repo}
}

func (uc *ListPersonsUseCase) List(ctx context.Context) ([]domain.Person, error) {
	return uc.repo.FindAll(ctx)
}
