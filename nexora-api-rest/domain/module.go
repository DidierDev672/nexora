package domain

import (
	"encoding/json"
	"errors"
	"strings"
)

// Erros de dominio
var (
	ErrIDRequired           = errors.New("el ID es requerido")
	ErrTypePathRequired     = errors.New("type_path es requerido")
	ErrTypeComponentRequire = errors.New("type_component es requerido")
)

// TypePath representa la ruta del modulo. Value Object.
type TypePath string

// Validate valida que el TypePath no esté vacío.
func NewTypePath(raw string) (TypePath, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", ErrTypePathRequired
	}
	return TypePath(trimmed), nil
}

// String devuelve la representación del TypePath.
func (tp TypePath) String() string {
	return string(tp)
}

// TypeComponent representa el tipo de componente. Value Object.
type TypeComponent string

// NewTypeComponent valida y crea un TypeComponent.
func NewTypeComponent(raw string) (TypeComponent, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", ErrTypeComponentRequire
	}
	return TypeComponent(trimmed), nil
}

// String devuelve la representación del TypeComponent.
func (tc TypeComponent) String() string {
	return string(tc)
}

// Module es la entidad principal del dominio.
type Module struct {
	id            int
	typePath      TypePath
	typeComponent TypeComponent
}

// NewModule crea un Module validando invariantes.
// id 0 se usa como placeholder: la persistencia asigna el ID final.
func NewModule(id int, typePath TypePath, typeComponent TypeComponent) (*Module, error) {
	if id < 0 {
		return nil, ErrIDRequired
	}
	return &Module{
		id:            id,
		typePath:      typePath,
		typeComponent: typeComponent,
	}, nil
}

// ID retorna el identificador del módulo.
func (m *Module) ID() int {
	return m.id
}

// TypePath retorna la ruta del módulo.
func (m *Module) TypePath() TypePath {
	return m.typePath
}

// TypeComponent retorna el tipo de componente.
func (m *Module) TypeComponent() TypeComponent {
	return m.typeComponent
}

// RenameTypePath cambia la ruta del módulo. Regla de negocio.
func (m *Module) RenameTypePath(newPath TypePath) {
	m.typePath = newPath
}

// ChangeTypeComponent cambia el tipo de componente. Regla de negocio.
func (m *Module) ChangeTypeComponent(newComp TypeComponent) {
	m.typeComponent = newComp
}

// moduleJSON es la representación JSON del módulo.
type moduleJSON struct {
	ID            int    `json:"id"`
	TypePath      string `json:"type_path"`
	TypeComponent string `json:"type_component"`
}

// MarshalJSON expone el módulo como JSON.
func (m *Module) MarshalJSON() ([]byte, error) {
	return json.Marshal(moduleJSON{
		ID:            m.id,
		TypePath:      m.typePath.String(),
		TypeComponent: m.typeComponent.String(),
	})
}

// ModuleRepository define las operaciones de persistencia del módulo.
// Sin acoplamiento a infraestructura específica.
type ModuleRepository interface {
	// Save persiste un módulo y devuelve su ID final (asignado si era 0).
	Save(m *Module) (int, error)
	FindByID(id int) (*Module, error)
	FindAll() ([]*Module, error)
	Delete(id int) error
}
