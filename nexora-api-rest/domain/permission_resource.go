package domain

import (
	"encoding/json"
	"errors"
)

// Erros de dominio para PermissionResource
var (
	ErrPermissionResourceIDRequired = errors.New("el ID es requerido")
)

// Permission representa si un recurso tiene permiso. Value Object.
type Permission bool

// NewPermission crea un Permission.
func NewPermission(value bool) Permission {
	return Permission(value)
}

// IsAllowed retorna true si el permiso está habilitado.
func (p Permission) IsAllowed() bool {
	return bool(p)
}

// Toggle invierte el valor del permiso.
func (p *Permission) Toggle() {
	*p = !*p
}

// Grant habilita el permiso.
func (p *Permission) Grant() {
	*p = true
}

// Revoke deshabilita el permiso.
func (p *Permission) Revoke() {
	*p = false
}

// PermissionResource es la entidad que asocia un recurso con su permiso.
type PermissionResource struct {
	id         int
	resourceID int
	permission Permission
}

// NewPermissionResource crea validando invariantes.
// id 0 se usa como placeholder: la persistencia asigna el ID final.
func NewPermissionResource(id int, resourceID int, permission Permission) (*PermissionResource, error) {
	if id < 0 {
		return nil, ErrPermissionResourceIDRequired
	}
	if resourceID <= 0 {
		return nil, ErrResourceIDRequired
	}
	return &PermissionResource{
		id:         id,
		resourceID: resourceID,
		permission: permission,
	}, nil
}

// ID retorna el identificador.
func (pr *PermissionResource) ID() int {
	return pr.id
}

// ResourceID retorna el ID del recurso asociado.
func (pr *PermissionResource) ResourceID() int {
	return pr.resourceID
}

// Permission retorna el permiso actual.
func (pr *PermissionResource) Permission() Permission {
	return pr.permission
}

// Grant habilita el permiso para el recurso.
func (pr *PermissionResource) Grant() {
	pr.permission.Grant()
}

// Revoke deshabilita el permiso para el recurso.
func (pr *PermissionResource) Revoke() {
	pr.permission.Revoke()
}

// Toggle invierte el permiso actual.
func (pr *PermissionResource) Toggle() {
	pr.permission.Toggle()
}

// IsAllowed retorna true si el permiso está habilitado.
func (pr *PermissionResource) IsAllowed() bool {
	return pr.permission.IsAllowed()
}

// permissionResourceJSON es la representación JSON del permiso-recurso.
type permissionResourceJSON struct {
	ID         int  `json:"id"`
	ResourceID int  `json:"resource_id"`
	Permission bool `json:"permission"`
}

// MarshalJSON expone el permiso-recurso como JSON.
func (pr *PermissionResource) MarshalJSON() ([]byte, error) {
	return json.Marshal(permissionResourceJSON{
		ID:         pr.id,
		ResourceID: pr.resourceID,
		Permission: pr.permission.IsAllowed(),
	})
}

// PermissionResourceRepository define las operaciones de persistencia.
type PermissionResourceRepository interface {
	// Save persiste un permiso-recurso y devuelve su ID final (asignado si era 0).
	Save(pr *PermissionResource) (int, error)
	FindByID(id int) (*PermissionResource, error)
	FindByResourceID(resourceID int) (*PermissionResource, error)
	FindAll() ([]*PermissionResource, error)
	Delete(id int) error
}
