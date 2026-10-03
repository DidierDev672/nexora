package itemmenu_test

import (
	"context"
	"testing"
	"time"

	"nexora-api-rest/internal/itemmenu"
)

type mockItemRepo struct {
	items       map[itemmenu.ID]itemmenu.ItemMenu
	ensureCount int
}

func newMockItemRepo() *mockItemRepo {
	return &mockItemRepo{
		items: make(map[itemmenu.ID]itemmenu.ItemMenu),
	}
}

func (m *mockItemRepo) EnsureTable(ctx context.Context) error {
	m.ensureCount++
	return nil
}

func (m *mockItemRepo) Create(ctx context.Context, item itemmenu.ItemMenu) error {
	m.items[item.ID] = item
	return nil
}

func (m *mockItemRepo) GetByID(ctx context.Context, id itemmenu.ID) (itemmenu.ItemMenu, error) {
	item, ok := m.items[id]
	if !ok {
		return itemmenu.ItemMenu{}, itemmenu.ErrNotFound
	}
	return item, nil
}

func (m *mockItemRepo) List(ctx context.Context, filter itemmenu.ListFilter) ([]itemmenu.ItemMenu, error) {
	res := make([]itemmenu.ItemMenu, 0, len(m.items))
	for _, item := range m.items {
		if filter.CategoryID != "" && item.CategoryID != filter.CategoryID {
			continue
		}
		if filter.Available != nil && item.Available != *filter.Available {
			continue
		}
		res = append(res, item)
	}
	return res, nil
}

func (m *mockItemRepo) Update(ctx context.Context, item itemmenu.ItemMenu) error {
	if _, ok := m.items[item.ID]; !ok {
		return itemmenu.ErrNotFound
	}
	m.items[item.ID] = item
	return nil
}

func (m *mockItemRepo) Delete(ctx context.Context, id itemmenu.ID) error {
	if _, ok := m.items[id]; !ok {
		return itemmenu.ErrNotFound
	}
	delete(m.items, id)
	return nil
}

type fixedItemIDGenerator struct {
	id itemmenu.ID
}

func (f fixedItemIDGenerator) NewID() itemmenu.ID {
	return f.id
}

type fixedItemClock struct {
	now time.Time
}

func (f fixedItemClock) Now() time.Time {
	return f.now
}

func TestUseCase_Lifecycle(t *testing.T) {
	ctx := context.Background()
	repo := newMockItemRepo()
	fixedNow := time.Date(2026, 10, 3, 10, 0, 0, 0, time.UTC)
	idGen := fixedItemIDGenerator{id: "item-100"}
	clock := fixedItemClock{now: fixedNow}

	uc := itemmenu.NewUseCase(repo, idGen, clock)
	pt := 25

	// 1. Create
	created, err := uc.Create(ctx, itemmenu.CreateInput{
		CategoryID:    "cat-drinks",
		Name:          "Mojito Clásico",
		Description:   "Ron blanco, hierbabuena, lima y soda",
		Price:         8.50,
		TaxPercentage: 10.0,
		PrepTime:      &pt,
		IsVegetarian:  true,
		IsVegan:       true,
		ImageURL:      "mojito.png",
		StartTime:     "12:00",
		EndTime:       "02:00",
		Available:     true,
		CreatedBy:     "bartender",
	})
	if err != nil {
		t.Fatalf("failed to create item: %v", err)
	}
	if created.ID != "item-100" {
		t.Errorf("expected ID 'item-100', got %s", created.ID)
	}
	if created.Name != "Mojito Clásico" {
		t.Errorf("expected Name 'Mojito Clásico', got %s", created.Name)
	}

	// 2. GetByID
	fetched, err := uc.GetByID(ctx, "item-100")
	if err != nil {
		t.Fatalf("failed to get item: %v", err)
	}
	if fetched.ID != "item-100" {
		t.Errorf("expected ID 'item-100', got %s", fetched.ID)
	}

	// 3. List
	list, err := uc.List(ctx, itemmenu.ListFilter{CategoryID: "cat-drinks"})
	if err != nil {
		t.Fatalf("failed to list items: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 item in list, got %d", len(list))
	}

	// 4. Update
	updated, err := uc.Update(ctx, itemmenu.UpdateInput{
		ID:            "item-100",
		Name:          "Mojito de Frutos Rojos",
		Description:   "Ron añejo, frutos rojos, hierbabuena",
		Price:         9.50,
		TaxPercentage: 10.0,
		PrepTime:      &pt,
		IsVegetarian:  true,
		IsVegan:       true,
		ImageURL:      "berry_mojito.png",
		StartTime:     "12:00",
		EndTime:       "02:00",
		Available:     true,
	})
	if err != nil {
		t.Fatalf("failed to update item: %v", err)
	}
	if updated.Name != "Mojito de Frutos Rojos" {
		t.Errorf("expected updated name, got %s", updated.Name)
	}
	if updated.Price != 9.50 {
		t.Errorf("expected updated price 9.50, got %f", updated.Price)
	}

	// 5. Delete
	if err := uc.Delete(ctx, "item-100"); err != nil {
		t.Fatalf("failed to delete item: %v", err)
	}

	// Verify not found
	_, err = uc.GetByID(ctx, "item-100")
	if err != itemmenu.ErrNotFound {
		t.Errorf("expected ErrNotFound, got %v", err)
	}
}
