package usecase

import (
	"nexora-api-rest/domain"
)

// ResourceService orquesta las operaciones sobre recursos.
type ResourceService struct {
	repo domain.ResourceRepository
}

// NewResourceService inyecta el repositorio.
func NewResourceService(repo domain.ResourceRepository) *ResourceService {
	return &ResourceService{repo: repo}
}

// CreateResourceDTO contrato de entrada para crear un recurso.
type CreateResourceDTO struct {
	Component string `json:"component"`
	Name      string `json:"name"`
	ModuleID  int    `json:"module_id"`
}

// UpdateResourceDTO contrato de entrada para actualizar un recurso.
type UpdateResourceDTO struct {
	Component string `json:"component"`
	Name      string `json:"name"`
	ModuleID  int    `json:"module_id"`
}

// Create crea un recurso validando reglas de negocio.
func (s *ResourceService) Create(dto CreateResourceDTO) (*domain.Resource, error) {
	comp, err := domain.NewComponent(dto.Component)
	if err != nil {
		return nil, err
	}
	name, err := domain.NewResourceName(dto.Name)
	if err != nil {
		return nil, err
	}
	if dto.ModuleID <= 0 {
		return nil, domain.ErrModuleIDRequired
	}
	return domain.NewResource(0, comp, name, dto.ModuleID)
}

// Save persiste un recurso y devuelve la entidad con su ID final.
func (s *ResourceService) Save(res *domain.Resource) (*domain.Resource, error) {
	id, err := s.repo.Save(res)
	if err != nil {
		return nil, err
	}
	if id != res.ID() {
		saved, derr := domain.NewResource(id, res.Component(), res.Name(), res.ModuleID())
		if derr != nil {
			return nil, derr
		}
		return saved, nil
	}
	return res, nil
}

// FindByID busca un recurso por ID.
func (s *ResourceService) FindByID(id int) (*domain.Resource, error) {
	return s.repo.FindByID(id)
}

// FindByModuleID retorna todos los recursos de un módulo.
func (s *ResourceService) FindByModuleID(moduleID int) ([]*domain.Resource, error) {
	return s.repo.FindByModuleID(moduleID)
}

// FindAll retorna todos los recursos.
func (s *ResourceService) FindAll() ([]*domain.Resource, error) {
	return s.repo.FindAll()
}

// Delete elimina un recurso por ID.
func (s *ResourceService) Delete(id int) error {
	return s.repo.Delete(id)
}
