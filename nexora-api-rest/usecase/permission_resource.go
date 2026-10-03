package usecase

import (
	"nexora-api-rest/domain"
)

// PermissionResourceService orquesta las operaciones de permisos de recursos.
type PermissionResourceService struct {
	repo domain.PermissionResourceRepository
}

// NewPermissionResourceService inyecta el repositorio.
func NewPermissionResourceService(repo domain.PermissionResourceRepository) *PermissionResourceService {
	return &PermissionResourceService{repo: repo}
}

// CreatePermissionResourceDTO contrato de entrada.
type CreatePermissionResourceDTO struct {
	ResourceID int  `json:"resource_id"`
	Permission bool `json:"permission"`
}

// UpdatePermissionResourceDTO contrato de entrada para actualizar.
type UpdatePermissionResourceDTO struct {
	Permission *bool `json:"permission"`
}

// Create crea un PermissionResource validando reglas de negocio.
func (s *PermissionResourceService) Create(dto CreatePermissionResourceDTO) (*domain.PermissionResource, error) {
	if dto.ResourceID <= 0 {
		return nil, domain.ErrResourceIDRequired
	}
	perm := domain.NewPermission(dto.Permission)
	return domain.NewPermissionResource(0, dto.ResourceID, perm)
}

// Save persiste un permiso-recurso y devuelve la entidad con su ID final.
func (s *PermissionResourceService) Save(pr *domain.PermissionResource) (*domain.PermissionResource, error) {
	id, err := s.repo.Save(pr)
	if err != nil {
		return nil, err
	}
	if id != pr.ID() {
		saved, derr := domain.NewPermissionResource(id, pr.ResourceID(), pr.Permission())
		if derr != nil {
			return nil, derr
		}
		return saved, nil
	}
	return pr, nil
}

// FindByID busca por ID.
func (s *PermissionResourceService) FindByID(id int) (*domain.PermissionResource, error) {
	return s.repo.FindByID(id)
}

// FindByResourceID busca por resource ID.
func (s *PermissionResourceService) FindByResourceID(resourceID int) (*domain.PermissionResource, error) {
	return s.repo.FindByResourceID(resourceID)
}

// FindAll retorna todos.
func (s *PermissionResourceService) FindAll() ([]*domain.PermissionResource, error) {
	return s.repo.FindAll()
}

// Delete elimina por ID.
func (s *PermissionResourceService) Delete(id int) error {
	return s.repo.Delete(id)
}
