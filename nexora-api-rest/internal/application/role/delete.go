package role

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeleteRoleUseCase implements the "delete role" vertical slice.
type DeleteRoleUseCase struct {
	repo domain.RoleRepository
}

func NewDeleteRoleUseCase(repo domain.RoleRepository) *DeleteRoleUseCase {
	return &DeleteRoleUseCase{repo: repo}
}

func (uc *DeleteRoleUseCase) Delete(ctx context.Context, id domain.RoleID) error {
	return uc.repo.Delete(ctx, id)
}
