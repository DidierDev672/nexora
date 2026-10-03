package domain

import "errors"

// RoleID identifies a role within the system.
type RoleID string

// Sentinel errors represents the invariant violations of the role aggregate.
var (
	ErrRoleNotFound   = errors.New("role not found")
	ErrRoleDuplicated = errors.New("a role with this name already exists")
	ErrInvalidRole    = errors.New("role name must not be empty")
)

// Role is the core domain entity. It has no dependencies on other layers.
type Role struct {
	ID          RoleID
	Name        string
	Description string
}

// Validate enforces the business invariants of a role.
func (r Role) Validate() error {
	if r.Name == "" {
		return ErrInvalidRole
	}
	return nil
}
