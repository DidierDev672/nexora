package role

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a role.
type UpdateInput struct {
	ID          domain.RoleID
	Name        string
	Description string
}

// UpdateRoleUseCase implements the "update role" vertical slice.
type UpdateRoleUseCase struct {
	repo domain.RoleRepository
}

func NewUpdateRoleUseCase(repo domain.RoleRepository) *UpdateRoleUseCase {
	return &UpdateRoleUseCase{repo: repo}
}

func (uc *UpdateRoleUseCase) Update(ctx context.Context, in UpdateInput) (domain.Role, error) {
	role, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Role{}, err
	}
	role.Name = in.Name
	role.Description = in.Description

	if err := role.Validate(); err != nil {
		return domain.Role{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, role.ID, role.Name); err != nil {
		return domain.Role{}, err
	}
	if err := uc.repo.Update(ctx, role); err != nil {
		return domain.Role{}, err
	}
	return role, nil
}
