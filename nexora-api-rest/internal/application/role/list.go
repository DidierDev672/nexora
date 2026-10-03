package role

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListRolesUseCase implements the "list roles" vertical slice.
type ListRolesUseCase struct {
	repo domain.RoleRepository
}

func NewListRolesUseCase(repo domain.RoleRepository) *ListRolesUseCase {
	return &ListRolesUseCase{repo: repo}
}

func (uc *ListRolesUseCase) List(ctx context.Context) ([]domain.Role, error) {
	return uc.repo.FindAll(ctx)
}
