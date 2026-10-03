package repository

import (
	"fmt"
	"sync"
	"sync/atomic"

	"nexora-api-rest/domain"
)

// InMemoryPermissionResourceRepo implementa PermissionResourceRepository en memoria.
type InMemoryPermissionResourceRepo struct {
	store map[int]*domain.PermissionResource
	mu    sync.RWMutex
	seq   int64
}

// NewInMemoryPermissionResourceRepo crea una instancia del repositorio.
func NewInMemoryPermissionResourceRepo() *InMemoryPermissionResourceRepo {
	return &InMemoryPermissionResourceRepo{
		store: make(map[int]*domain.PermissionResource),
	}
}

// Save almacena una entidad. Si ID es 0 asigna uno nuevo y devuelve el ID final.
func (r *InMemoryPermissionResourceRepo) Save(pr *domain.PermissionResource) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	id := pr.ID()
	if id == 0 {
		id = int(atomic.AddInt64(&r.seq, 1))
		newPr, _ := domain.NewPermissionResource(id, pr.ResourceID(), pr.Permission())
		r.store[id] = newPr
	} else {
		r.store[id] = pr
	}
	return id, nil
}

// FindByID retorna por ID.
func (r *InMemoryPermissionResourceRepo) FindByID(id int) (*domain.PermissionResource, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	pr, ok := r.store[id]
	if !ok {
		return nil, fmt.Errorf("permiso-recurso con ID %d no encontrado", id)
	}
	return pr, nil
}

// FindByResourceID retorna el permiso de un recurso específico.
func (r *InMemoryPermissionResourceRepo) FindByResourceID(resourceID int) (*domain.PermissionResource, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, pr := range r.store {
		if pr.ResourceID() == resourceID {
			return pr, nil
		}
	}
	return nil, fmt.Errorf("permiso para recurso %d no encontrado", resourceID)
}

// FindAll retorna todos.
func (r *InMemoryPermissionResourceRepo) FindAll() ([]*domain.PermissionResource, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	result := make([]*domain.PermissionResource, 0, len(r.store))
	for _, pr := range r.store {
		result = append(result, pr)
	}
	return result, nil
}

// Delete elimina por ID.
func (r *InMemoryPermissionResourceRepo) Delete(id int) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.store[id]; !ok {
		return fmt.Errorf("permiso-recurso con ID %d no encontrado", id)
	}
	delete(r.store, id)
	return nil
}
