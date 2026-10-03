package menucategory_test

import (
	"context"
	"testing"
	"time"

	"nexora-api-rest/internal/menucategory"
)

type mockRepo struct {
	items       map[menucategory.ID]menucategory.MenuCategory
	ensureCount int
	createErr   error
	getErr      error
}

func newMockRepo() *mockRepo {
	return &mockRepo{
		items: make(map[menucategory.ID]menucategory.MenuCategory),
	}
}

func (m *mockRepo) EnsureTable(ctx context.Context) error {
	m.ensureCount++
	return nil
}

func (m *mockRepo) Create(ctx context.Context, category menucategory.MenuCategory) error {
	if m.createErr != nil {
		return m.createErr
	}
	m.items[category.ID] = category
	return nil
}

func (m *mockRepo) GetByID(ctx context.Context, id menucategory.ID) (menucategory.MenuCategory, error) {
	if m.getErr != nil {
		return menucategory.MenuCategory{}, m.getErr
	}
	item, ok := m.items[id]
	if !ok {
		return menucategory.MenuCategory{}, menucategory.ErrNotFound
	}
	return item, nil
}

func (m *mockRepo) List(ctx context.Context, filter menucategory.ListFilter) ([]menucategory.MenuCategory, error) {
	res := make([]menucategory.MenuCategory, 0, len(m.items))
	for _, item := range m.items {
		if filter.HeadquarterID != "" && item.HeadquarterID != filter.HeadquarterID {
			continue
		}
		res = append(res, item)
	}
	return res, nil
}

func (m *mockRepo) Update(ctx context.Context, category menucategory.MenuCategory) error {
	if _, ok := m.items[category.ID]; !ok {
		return menucategory.ErrNotFound
	}
	m.items[category.ID] = category
	return nil
}

func (m *mockRepo) Delete(ctx context.Context, id menucategory.ID) error {
	if _, ok := m.items[id]; !ok {
		return menucategory.ErrNotFound
	}
	delete(m.items, id)
	return nil
}

type fixedIDGenerator struct {
	id menucategory.ID
}

func (f fixedIDGenerator) NewID() menucategory.ID {
	return f.id
}

type fixedClock struct {
	now time.Time
}

func (f fixedClock) Now() time.Time {
	return f.now
}

func TestUseCase_Lifecycle(t *testing.T) {
	ctx := context.Background()
	repo := newMockRepo()
	fixedNow := time.Date(2026, 10, 3, 10, 0, 0, 0, time.UTC)
	idGen := fixedIDGenerator{id: "cat-123"}
	clock := fixedClock{now: fixedNow}

	uc := menucategory.NewUseCase(repo, idGen, clock)

	// 1. Create
	created, err := uc.Create(ctx, menucategory.CreateInput{
		HeadquarterID: "hq-1",
		Name:          "Platos Fuertes",
		Description:   "Carnes y pastas",
		Order:         1,
		Asset:         "asset_dish.png",
		CreatedBy:     "chef",
	})
	if err != nil {
		t.Fatalf("failed to create category: %v", err)
	}
	if created.ID != "cat-123" {
		t.Errorf("expected ID 'cat-123', got %s", created.ID)
	}
	if created.Name != "Platos Fuertes" {
		t.Errorf("expected Name 'Platos Fuertes', got %s", created.Name)
	}

	// 2. GetByID
	fetched, err := uc.GetByID(ctx, "cat-123")
	if err != nil {
		t.Fatalf("failed to get category: %v", err)
	}
	if fetched.ID != "cat-123" {
		t.Errorf("expected ID 'cat-123', got %s", fetched.ID)
	}

	// 3. List
	list, err := uc.List(ctx, menucategory.ListFilter{HeadquarterID: "hq-1"})
	if err != nil {
		t.Fatalf("failed to list categories: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 item in list, got %d", len(list))
	}

	// 4. Update
	updated, err := uc.Update(ctx, menucategory.UpdateInput{
		ID:          "cat-123",
		Name:        "Platos Fuertes Gourmet",
		Description: "Carnes maduradas",
		Order:       2,
		Asset:       "gourmet.png",
	})
	if err != nil {
		t.Fatalf("failed to update category: %v", err)
	}
	if updated.Name != "Platos Fuertes Gourmet" {
		t.Errorf("expected updated name, got %s", updated.Name)
	}
	if updated.Order != 2 {
		t.Errorf("expected updated order 2, got %d", updated.Order)
	}

	// 5. Delete
	if err := uc.Delete(ctx, "cat-123"); err != nil {
		t.Fatalf("failed to delete category: %v", err)
	}

	// Verify not found after delete
	_, err = uc.GetByID(ctx, "cat-123")
	if err != menucategory.ErrNotFound {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
