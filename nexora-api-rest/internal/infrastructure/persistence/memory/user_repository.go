package memory

import (
	"context"
	"sync"

	"nexora-api-rest/internal/domain"
)

// UserRepository is an in-memory, concurrency-safe implementation of
// domain.UserRepository (the persistence adapter of the DIP).
type UserRepository struct {
	mu    sync.RWMutex
	users map[domain.UserID]domain.User
}

func NewUserRepository() *UserRepository {
	return &UserRepository{users: make(map[domain.UserID]domain.User)}
}

var _ domain.UserRepository = (*UserRepository)(nil)

func (r *UserRepository) FindAll(_ context.Context) ([]domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	out := make([]domain.User, 0, len(r.users))
	for _, user := range r.users {
		out = append(out, user)
	}
	return out, nil
}

func (r *UserRepository) FindByID(_ context.Context, id domain.UserID) (domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	user, ok := r.users[id]
	if !ok {
		return domain.User{}, domain.ErrUserNotFound
	}
	return user, nil
}

func (r *UserRepository) FindByEmail(_ context.Context, email string) (domain.User, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	for _, user := range r.users {
		if user.Email == email {
			return user, nil
		}
	}
	return domain.User{}, domain.ErrUserNotFound
}

func (r *UserRepository) Save(_ context.Context, user domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.users[user.ID] = user
	return nil
}

func (r *UserRepository) Update(_ context.Context, user domain.User) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.users[user.ID]; !ok {
		return domain.ErrUserNotFound
	}
	r.users[user.ID] = user
	return nil
}

func (r *UserRepository) Delete(_ context.Context, id domain.UserID) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if _, ok := r.users[id]; !ok {
		return domain.ErrUserNotFound
	}
	delete(r.users, id)
	return nil
}
