package user

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteUserUseCase implements the "delete user" vertical slice.
type DeleteUserUseCase struct {
	repo domain.UserRepository
}

func NewDeleteUserUseCase(repo domain.UserRepository) *DeleteUserUseCase {
	return &DeleteUserUseCase{repo: repo}
}

func (uc *DeleteUserUseCase) Delete(ctx context.Context, id domain.UserID) error {
	return uc.repo.Delete(ctx, id)
}
