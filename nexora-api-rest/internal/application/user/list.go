package user

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListUsersUseCase implements the "list users" vertical slice.
type ListUsersUseCase struct {
	repo domain.UserRepository
}

func NewListUsersUseCase(repo domain.UserRepository) *ListUsersUseCase {
	return &ListUsersUseCase{repo: repo}
}

func (uc *ListUsersUseCase) List(ctx context.Context) ([]domain.User, error) {
	return uc.repo.FindAll(ctx)
}
