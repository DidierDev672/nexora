package serviceassignment_test

import (
	"context"
	"sync"
	"testing"
	"time"

	"nexora-api-rest/internal/serviceassignment"
)

type memoryRepo struct {
	mu    sync.RWMutex
	items map[serviceassignment.ID]serviceassignment.ServiceAssignment
}

func newMemoryRepo() *memoryRepo {
	return &memoryRepo{items: make(map[serviceassignment.ID]serviceassignment.ServiceAssignment)}
}

func (m *memoryRepo) EnsureTable(_ context.Context) error {
	return nil
}

func (m *memoryRepo) Create(_ context.Context, a serviceassignment.ServiceAssignment) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[a.ID] = a
	return nil
}

func (m *memoryRepo) GetByID(_ context.Context, id serviceassignment.ID) (serviceassignment.ServiceAssignment, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	item, ok := m.items[id]
	if !ok {
		return serviceassignment.ServiceAssignment{}, serviceassignment.ErrNotFound
	}
	return item, nil
}

func (m *memoryRepo) List(_ context.Context) ([]serviceassignment.ServiceAssignment, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	list := make([]serviceassignment.ServiceAssignment, 0, len(m.items))
	for _, v := range m.items {
		list = append(list, v)
	}
	return list, nil
}

func (m *memoryRepo) Update(_ context.Context, a serviceassignment.ServiceAssignment) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.items[a.ID] = a
	return nil
}

func (m *memoryRepo) Delete(_ context.Context, id serviceassignment.ID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.items, id)
	return nil
}

type fixedIDGen struct{ id serviceassignment.ID }

func (g fixedIDGen) NewID() serviceassignment.ID { return g.id }

type fixedClock struct{ t time.Time }

func (c fixedClock) Now() time.Time { return c.t }

func TestUseCase_Lifecycle(t *testing.T) {
	repo := newMemoryRepo()
	fixedTime := time.Date(2026, 10, 11, 12, 0, 0, 0, time.UTC)
	uc := serviceassignment.NewUseCase(repo, fixedIDGen{id: "fixed-123"}, fixedClock{t: fixedTime})

	ctx := context.Background()

	// 1. Create
	created, err := uc.Create(ctx, serviceassignment.CreateInput{
		ServiceRequestID: "sr-1",
		StayID:           "stay-1",
		PersonID:         "per-1",
		IsActive:         true,
	})
	if err != nil {
		t.Fatalf("failed to create: %v", err)
	}
	if created.ID != "fixed-123" {
		t.Errorf("expected ID fixed-123, got %s", created.ID)
	}

	// 2. GetByID
	got, err := uc.GetByID(ctx, "fixed-123")
	if err != nil {
		t.Fatalf("failed to get: %v", err)
	}
	if got.ServiceRequestID != "sr-1" {
		t.Errorf("expected sr-1, got %s", got.ServiceRequestID)
	}

	// 3. List
	list, err := uc.List(ctx)
	if err != nil {
		t.Fatalf("failed to list: %v", err)
	}
	if len(list) != 1 {
		t.Errorf("expected 1 item, got %d", len(list))
	}

	// 4. Update
	updated, err := uc.Update(ctx, serviceassignment.UpdateInput{
		ID:               "fixed-123",
		ServiceRequestID: "sr-updated",
		StayID:           "stay-1",
		PersonID:         "per-1",
		IsActive:         false,
	})
	if err != nil {
		t.Fatalf("failed to update: %v", err)
	}
	if updated.ServiceRequestID != "sr-updated" || updated.IsActive {
		t.Errorf("update failed")
	}

	// 5. Delete
	if err := uc.Delete(ctx, "fixed-123"); err != nil {
		t.Fatalf("failed to delete: %v", err)
	}

	// 6. Verify Delete
	_, err = uc.GetByID(ctx, "fixed-123")
	if err != serviceassignment.ErrNotFound {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
