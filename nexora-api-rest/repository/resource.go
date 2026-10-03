package repository

import (
	"fmt"
	"sync"
	"sync/atomic"

	"nexora-api-rest/domain"
)

// InMemoryResourceRepo implementa ResourceRepository en memoria.
type InMemoryResourceRepo struct {
	store map[int]*domain.Resource
	mu    sync.RWMutex
	seq   int64
}

// NewInMemoryResourceRepo crea una instancia del repositorio.
func NewInMemoryResourceRepo() *InMemoryResourceRepo {
	return &InMemoryResourceRepo{
		store: make(map[int]*domain.Resource),
	}
}

// Save almacena un recurso. Si ID es 0 asigna uno nuevo y devuelve el ID final.
func (r *InMemoryResourceRepo) Save(res *domain.Resource) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	id := res.ID()
	if id == 0 {
		id = int(atomic.AddInt64(&r.seq, 1))
		newRes, _ := domain.NewResource(id, res.Component(), res.Name(), res.ModuleID())
		r.store[id] = newRes
	} else {
		r.store[id] = res
	}
	return id, nil
}

// FindByID retorna un recurso por ID.
func (r *InMemoryResourceRepo) FindByID(id int) (*domain.Resource, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	res, ok := r.store[id]
	if !ok {
		return nil, fmt.Errorf("recurso con ID %d no encontrado", id)
	}
	return res, nil
}

// FindByModuleID retorna todos los recursos de un módulo.
func (r *InMemoryResourceRepo) FindByModuleID(moduleID int) ([]*domain.Resource, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	var result []*domain.Resource
	for _, res := range r.store {
		if res.ModuleID() == moduleID {
			result = append(result, res)
		}
	}
	return result, nil
}

// FindAll retorna todos los recursos.
func (r *InMemoryResourceRepo) FindAll() ([]*domain.Resource, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	resources := make([]*domain.Resource, 0, len(r.store))
	for _, res := range r.store {
		resources = append(resources, res)
	}
	return resources, nil
}

// Delete elimina un recurso por ID.
func (r *InMemoryResourceRepo) Delete(id int) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.store[id]; !ok {
		return fmt.Errorf("recurso con ID %d no encontrado", id)
	}
	delete(r.store, id)
	return nil
}
