package menucategory_test

import (
	"testing"
	"time"

	"nexora-api-rest/internal/menucategory"
)

func TestNewMenuCategory(t *testing.T) {
	now := time.Now().UTC()
	subHQ := "sub-hq-1"
	bld := "bld-1"

	tests := []struct {
		name          string
		id            menucategory.ID
		hqID          string
		subHQ         *string
		bld           *string
		catName       string
		description   string
		order         int
		asset         string
		createdBy     string
		expectedError error
	}{
		{
			name:          "valid menu category",
			id:            "cat-1",
			hqID:          "hq-1",
			subHQ:         &subHQ,
			bld:           &bld,
			catName:       "Desayunos",
			description:   "Opciones de desayuno",
			order:         1,
			asset:         "https://example.com/breakfast.png",
			createdBy:     "admin",
			expectedError: nil,
		},
		{
			name:          "empty id",
			id:            "",
			hqID:          "hq-1",
			catName:       "Bebidas",
			expectedError: menucategory.ErrInvalidID,
		},
		{
			name:          "empty headquarter id",
			id:            "cat-1",
			hqID:          "  ",
			catName:       "Bebidas",
			expectedError: menucategory.ErrInvalidHeadquarterID,
		},
		{
			name:          "empty name",
			id:            "cat-1",
			hqID:          "hq-1",
			catName:       "   ",
			expectedError: menucategory.ErrEmptyName,
		},
		{
			name:          "negative order",
			id:            "cat-1",
			hqID:          "hq-1",
			catName:       "Bebidas",
			order:         -1,
			expectedError: menucategory.ErrInvalidOrder,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cat, err := menucategory.NewMenuCategory(
				tt.id,
				tt.hqID,
				tt.subHQ,
				tt.bld,
				tt.catName,
				tt.description,
				tt.order,
				tt.asset,
				tt.createdBy,
				now,
			)

			if tt.expectedError != nil {
				if err != tt.expectedError {
					t.Fatalf("expected error %v, got %v", tt.expectedError, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if cat.ID != tt.id {
				t.Errorf("expected ID %s, got %s", tt.id, cat.ID)
			}
			if cat.Name != tt.catName {
				t.Errorf("expected Name %s, got %s", tt.catName, cat.Name)
			}
			if cat.HeadquarterID != tt.hqID {
				t.Errorf("expected HQ %s, got %s", tt.hqID, cat.HeadquarterID)
			}
		})
	}
}

func TestMenuCategory_Update(t *testing.T) {
	now := time.Now().UTC()
	cat, err := menucategory.NewMenuCategory(
		"cat-1",
		"hq-1",
		nil,
		nil,
		"Postres",
		"Dulces",
		2,
		"asset.png",
		"user",
		now,
	)
	if err != nil {
		t.Fatalf("failed to create category: %v", err)
	}

	later := now.Add(time.Hour)
	newSubHQ := "sub-hq-2"

	t.Run("valid update", func(t *testing.T) {
		err := cat.Update(
			"Postres y Helados",
			"Variedad de postres",
			3,
			"new_asset.png",
			&newSubHQ,
			nil,
			later,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if cat.Name != "Postres y Helados" {
			t.Errorf("expected Name 'Postres y Helados', got '%s'", cat.Name)
		}
		if cat.Order != 3 {
			t.Errorf("expected Order 3, got %d", cat.Order)
		}
		if cat.SubHeadquarterID == nil || *cat.SubHeadquarterID != "sub-hq-2" {
			t.Errorf("expected SubHQ 'sub-hq-2', got %v", cat.SubHeadquarterID)
		}
	})

	t.Run("invalid name update", func(t *testing.T) {
		err := cat.Update("", "desc", 1, "asset", nil, nil, later)
		if err != menucategory.ErrEmptyName {
			t.Errorf("expected ErrEmptyName, got %v", err)
		}
	})

	t.Run("invalid order update", func(t *testing.T) {
		err := cat.Update("Valid", "desc", -5, "asset", nil, nil, later)
		if err != menucategory.ErrInvalidOrder {
			t.Errorf("expected ErrInvalidOrder, got %v", err)
		}
	})
}
