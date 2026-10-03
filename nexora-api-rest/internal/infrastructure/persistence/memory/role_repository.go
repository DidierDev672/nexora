package memory

import (
	"context"
	"sync"

	"nexora-api-rest/internal/domain"
)

// RoleRepository is an in-memory, concurrency-safe implementation of
// domain.RoleRepository (the persistence adapter of the DIP).
type RoleRepository struct {
	mu    sync.RWMutex
	roles map[domain.RoleID]domain.Role
}

func NewRoleRepository() *RoleRepository {
	return &RoleRepository{roles: make(map[domain.RoleID]domain.Role)}
}

var _ domain.RoleRepository = (*RoleRepository)(nil)

func (r *RoleRepository) FindAll(_ context.Context) ([]domain.Role, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	out := make([]domain.Role, 0, len(r.roles))
	for _, role := range r.roles {
		out = append(out, role)
	}
	return out, nil
}

func (r *RoleRepository) FindByID(_ context.Context, id domain.RoleID) (domain.Role, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	role, ok := r.roles[id]
	if !ok {
		return domain.Role{}, domain.ErrRoleNotFound
	}
	return role, nil
}

func (r *RoleRepository) FindByName(_ context.Context, name string) (domain.Role, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, role := range r.roles {
		if role.Name == name {
			return role, nil
		}
	}
	return domain.Role{}, domain.ErrRoleNotFound
}

func (r *RoleRepository) Save(_ context.Context, role domain.Role) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.roles[role.ID] = role
	return nil
}

func (r *RoleRepository) Update(_ context.Context, role domain.Role) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.roles[role.ID]; !ok {
		return domain.ErrRoleNotFound
	}
	r.roles[role.ID] = role
	return nil
}

func (r *RoleRepository) Delete(_ context.Context, id domain.RoleID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.roles[id]; !ok {
		return domain.ErrRoleNotFound
	}
	delete(r.roles, id)
	return nil
}
