package domain

import (
	"encoding/json"
	"errors"
	"strings"
)

// Erros de dominio para Resource
var (
	ErrResourceIDRequired   = errors.New("el ID del recurso es requerido")
	ErrComponentRequired    = errors.New("component es requerido")
	ErrResourceNameRequired = errors.New("name es requerido")
	ErrModuleIDRequired     = errors.New("module ID es requerido")
)

// Component representa el tipo de componente. Value Object.
type Component string

// NewComponent valida y crea un Component.
func NewComponent(raw string) (Component, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", ErrComponentRequired
	}
	return Component(trimmed), nil
}

func (c Component) String() string {
	return string(c)
}

// ResourceName representa el nombre del recurso. Value Object.
type ResourceName string

// NewResourceName valida y crea un ResourceName.
func NewResourceName(raw string) (ResourceName, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", ErrResourceNameRequired
	}
	return ResourceName(trimmed), nil
}

func (rn ResourceName) String() string {
	return string(rn)
}

// Resource es la entidad principal del dominio.
type Resource struct {
	id        int
	component Component
	name      ResourceName
	moduleID  int
}

// NewResource crea un Resource validando invariantes.
// id 0 se usa como placeholder: la persistencia asigna el ID final.
func NewResource(id int, component Component, name ResourceName, moduleID int) (*Resource, error) {
	if id < 0 {
		return nil, ErrResourceIDRequired
	}
	if moduleID <= 0 {
		return nil, ErrModuleIDRequired
	}
	return &Resource{
		id:        id,
		component: component,
		name:      name,
		moduleID:  moduleID,
	}, nil
}

// ID retorna el identificador del recurso.
func (r *Resource) ID() int {
	return r.id
}

// Component retorna el tipo de componente.
func (r *Resource) Component() Component {
	return r.component
}

// Name retorna el nombre del recurso.
func (r *Resource) Name() ResourceName {
	return r.name
}

// ModuleID retorna el ID del módulo al que pertenece.
func (r *Resource) ModuleID() int {
	return r.moduleID
}

// Rename cambia el nombre del recurso.
func (r *Resource) Rename(newName ResourceName) {
	r.name = newName
}

// ChangeComponent cambia el tipo de componente.
func (r *Resource) ChangeComponent(newComp Component) {
	r.component = newComp
}

// ReassignModule mueve el recurso a otro módulo.
func (r *Resource) ReassignModule(newModuleID int) error {
	if newModuleID <= 0 {
		return ErrModuleIDRequired
	}
	r.moduleID = newModuleID
	return nil
}

// resourceJSON es la representación JSON del recurso.
type resourceJSON struct {
	ID        int    `json:"id"`
	Component string `json:"component"`
	Name      string `json:"name"`
	ModuleID  int    `json:"module_id"`
}

// MarshalJSON expone el recurso como JSON.
func (r *Resource) MarshalJSON() ([]byte, error) {
	return json.Marshal(resourceJSON{
		ID:        r.id,
		Component: r.component.String(),
		Name:      r.name.String(),
		ModuleID:  r.moduleID,
	})
}

// ResourceRepository define las operaciones de persistencia.
type ResourceRepository interface {
	// Save persiste un recurso y devuelve su ID final (asignado si era 0).
	Save(res *Resource) (int, error)
	FindByID(id int) (*Resource, error)
	FindByModuleID(moduleID int) ([]*Resource, error)
	FindAll() ([]*Resource, error)
	Delete(id int) error
}
