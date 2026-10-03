package role

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created roles.
type IDProvider interface {
	NewRoleID() domain.RoleID
}

// RoleCreator is the narrow port used by the HTTP layer (ISP).
type RoleCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Role, error)
}

// RoleLister returns all existing roles.
type RoleLister interface {
	List(ctx context.Context) ([]domain.Role, error)
}

// RoleGetter returns a single role by id.
type RoleGetter interface {
	GetByID(ctx context.Context, id domain.RoleID) (domain.Role, error)
}

// RoleUpdater edits an existing role.
type RoleUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Role, error)
}

// RoleDeleter removes a role by id.
type RoleDeleter interface {
	Delete(ctx context.Context, id domain.RoleID) error
}
