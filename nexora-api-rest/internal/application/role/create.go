package role

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a role.
type CreateInput struct {
	Name        string
	Description string
}

// CreateRoleUseCase implements the "create role" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateRoleUseCase struct {
	repo       domain.RoleRepository
	idProvider IDProvider
}

func NewCreateRoleUseCase(repo domain.RoleRepository, idProvider IDProvider) *CreateRoleUseCase {
	return &CreateRoleUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateRoleUseCase) Create(ctx context.Context, in CreateInput) (domain.Role, error) {
	role := domain.Role{
		ID:          uc.idProvider.NewRoleID(),
		Name:        in.Name,
		Description: in.Description,
	}
	if err := role.Validate(); err != nil {
		return domain.Role{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, role.ID, role.Name); err != nil {
		return domain.Role{}, err
	}
	if err := uc.repo.Save(ctx, role); err != nil {
		return domain.Role{}, err
	}
	return role, nil
}
