package role

import (
	roleapp "nexora-api-rest/internal/application/role"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator roleapp.RoleCreator
	Lister  roleapp.RoleLister
	Getter  roleapp.RoleGetter
	Updater roleapp.RoleUpdater
	Deleter roleapp.RoleDeleter
}

// roleResponse is the HTTP projection of the domain entity.
type roleResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func newRoleResponse(role domain.Role) roleResponse {
	return roleResponse{
		ID:          string(role.ID),
		Name:        role.Name,
		Description: role.Description,
	}
}
