package user

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetUserUseCase implements the "get user by id" vertical slice.
type GetUserUseCase struct {
	repo domain.UserRepository
}

func NewGetUserUseCase(repo domain.UserRepository) *GetUserUseCase {
	return &GetUserUseCase{repo: repo}
}

func (uc *GetUserUseCase) GetByID(ctx context.Context, id domain.UserID) (domain.User, error) {
	return uc.repo.FindByID(ctx, id)
}
