package repository

import (
	"fmt"
	"sync"
	"sync/atomic"

	"nexora-api-rest/domain"
)

// InMemoryModuleRepo implementa ModuleRepository en memoria.
// Útil para desarrollo y pruebas.
type InMemoryModuleRepo struct {
	store map[int]*domain.Module
	mu    sync.RWMutex
	seq   int64
}

// NewInMemoryModuleRepo crea una instancia del repositorio.
func NewInMemoryModuleRepo() *InMemoryModuleRepo {
	return &InMemoryModuleRepo{
		store: make(map[int]*domain.Module),
	}
}

// Save almacena un módulo. Si ID es 0 asigna uno nuevo y devuelve el ID final.
func (r *InMemoryModuleRepo) Save(m *domain.Module) (int, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	id := m.ID()
	if id == 0 {
		id = int(atomic.AddInt64(&r.seq, 1))
		newMod, _ := domain.NewModule(id, m.TypePath(), m.TypeComponent())
		r.store[id] = newMod
	} else {
		r.store[id] = m
	}
	return id, nil
}

// FindByID retorna un módulo por ID.
func (r *InMemoryModuleRepo) FindByID(id int) (*domain.Module, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	m, ok := r.store[id]
	if !ok {
		return nil, fmt.Errorf("módulo con ID %d no encontrado", id)
	}
	return m, nil
}

// FindAll retorna todos los módulos.
func (r *InMemoryModuleRepo) FindAll() ([]*domain.Module, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	modules := make([]*domain.Module, 0, len(r.store))
	for _, m := range r.store {
		modules = append(modules, m)
	}
	return modules, nil
}

// Delete elimina un módulo por ID.
func (r *InMemoryModuleRepo) Delete(id int) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.store[id]; !ok {
		return fmt.Errorf("módulo con ID %d no encontrado", id)
	}
	delete(r.store, id)
	return nil
}
