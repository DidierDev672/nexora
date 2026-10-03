package usecase

import (
	"nexora-api-rest/domain"
)

// ModuleService orquesta las operaciones sobre módulos.
// Depende de la interfaz del repositorio, no de una implementación concreta.
type ModuleService struct {
	repo domain.ModuleRepository
}

// NewModuleService inyecta el repositorio.
func NewModuleService(repo domain.ModuleRepository) *ModuleService {
	return &ModuleService{repo: repo}
}

// CreateModuleDTO es el contrato de entrada para crear un módulo.
type CreateModuleDTO struct {
	TypePath      string `json:"type_path"`
	TypeComponent string `json:"type_component"`
}

// UpdateModuleDTO es el contrato de entrada para actualizar un módulo.
type UpdateModuleDTO struct {
	TypePath      string `json:"type_path"`
	TypeComponent string `json:"type_component"`
}

// Create crea un módulo validando reglas de negocio.
func (s *ModuleService) Create(dto CreateModuleDTO) (*domain.Module, error) {
	tp, err := domain.NewTypePath(dto.TypePath)
	if err != nil {
		return nil, err
	}
	tc, err := domain.NewTypeComponent(dto.TypeComponent)
	if err != nil {
		return nil, err
	}
	// El ID se asigna en persistencia. Para in-memory usamos un placeholder.
	// En repositorios reales el ID lo genera la base de datos.
	mod, err := domain.NewModule(0, tp, tc)
	if err != nil {
		return nil, err
	}
	return mod, nil
}

// Save persiste un módulo y devuelve la entidad con su ID final.
func (s *ModuleService) Save(m *domain.Module) (*domain.Module, error) {
	id, err := s.repo.Save(m)
	if err != nil {
		return nil, err
	}
	if id != m.ID() {
		saved, derr := domain.NewModule(id, m.TypePath(), m.TypeComponent())
		if derr != nil {
			return nil, derr
		}
		return saved, nil
	}
	return m, nil
}

// FindByID busca un módulo por su ID.
func (s *ModuleService) FindByID(id int) (*domain.Module, error) {
	return s.repo.FindByID(id)
}

// FindAll retorna todos los módulos.
func (s *ModuleService) FindAll() ([]*domain.Module, error) {
	return s.repo.FindAll()
}

// Delete elimina un módulo por ID.
func (s *ModuleService) Delete(id int) error {
	return s.repo.Delete(id)
}
