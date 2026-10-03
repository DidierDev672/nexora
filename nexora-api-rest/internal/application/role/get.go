package role

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetRoleUseCase implements the "get role by id" vertical slice.
type GetRoleUseCase struct {
	repo domain.RoleRepository
}

func NewGetRoleUseCase(repo domain.RoleRepository) *GetRoleUseCase {
	return &GetRoleUseCase{repo: repo}
}

func (uc *GetRoleUseCase) GetByID(ctx context.Context, id domain.RoleID) (domain.Role, error) {
	return uc.repo.FindByID(ctx, id)
}
