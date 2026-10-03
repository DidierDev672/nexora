package itemmenu_test

import (
	"testing"
	"time"

	"nexora-api-rest/internal/itemmenu"
)

func TestNewItemMenu(t *testing.T) {
	now := time.Now().UTC()
	prepTime := 15

	tests := []struct {
		name          string
		id            itemmenu.ID
		catID         string
		itemName      string
		description   string
		price         float64
		tax           float64
		prepTime      *int
		isVeg         bool
		isVegan       bool
		imgURL        string
		startTime     string
		endTime       string
		available     bool
		createdBy     string
		expectedError error
	}{
		{
			name:          "valid item menu",
			id:            "item-1",
			catID:         "cat-1",
			itemName:      "Hamburguesa Vegana",
			description:   "Lentejas, aguacate y pan artesanal",
			price:         12.50,
			tax:           10.0,
			prepTime:      &prepTime,
			isVeg:         false,
			isVegan:       true,
			imgURL:        "https://example.com/burger.jpg",
			startTime:     "11:00",
			endTime:       "23:00",
			available:     true,
			createdBy:     "admin",
			expectedError: nil,
		},
		{
			name:          "empty id",
			id:            "",
			catID:         "cat-1",
			itemName:      "Ensalada",
			expectedError: itemmenu.ErrInvalidID,
		},
		{
			name:          "empty category id",
			id:            "item-1",
			catID:         "  ",
			itemName:      "Ensalada",
			expectedError: itemmenu.ErrInvalidCategoryID,
		},
		{
			name:          "empty name",
			id:            "item-1",
			catID:         "cat-1",
			itemName:      "   ",
			expectedError: itemmenu.ErrEmptyName,
		},
		{
			name:          "negative price",
			id:            "item-1",
			catID:         "cat-1",
			itemName:      "Ensalada",
			price:         -1.0,
			expectedError: itemmenu.ErrInvalidPrice,
		},
		{
			name:          "negative tax",
			id:            "item-1",
			catID:         "cat-1",
			itemName:      "Ensalada",
			price:         10.0,
			tax:           -5.0,
			expectedError: itemmenu.ErrInvalidTaxPercentage,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			item, err := itemmenu.NewItemMenu(
				tt.id,
				tt.catID,
				tt.itemName,
				tt.description,
				tt.price,
				tt.tax,
				tt.prepTime,
				tt.isVeg,
				tt.isVegan,
				tt.imgURL,
				tt.startTime,
				tt.endTime,
				tt.available,
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
			if item.ID != tt.id {
				t.Errorf("expected ID %s, got %s", tt.id, item.ID)
			}
			if item.Name != tt.itemName {
				t.Errorf("expected Name %s, got %s", tt.itemName, item.Name)
			}
			// When vegan, must also be vegetarian
			if tt.isVegan && !item.IsVegetarian {
				t.Errorf("expected isVegetarian to be true when isVegan is true")
			}
		})
	}
}

func TestItemMenu_Update(t *testing.T) {
	now := time.Now().UTC()
	pt := 20
	item, err := itemmenu.NewItemMenu(
		"item-1",
		"cat-1",
		"Café Americano",
		"Café filtrado",
		2.50,
		0.0,
		&pt,
		true,
		true,
		"coffee.png",
		"07:00",
		"18:00",
		true,
		"admin",
		now,
	)
	if err != nil {
		t.Fatalf("failed to create item: %v", err)
	}

	later := now.Add(time.Hour)
	newPt := 10

	t.Run("valid update", func(t *testing.T) {
		err := item.Update(
			"Café Espresso Doble",
			"Extracción intensa",
			3.00,
			5.0,
			&newPt,
			true,
			true,
			"espresso.png",
			"06:30",
			"20:00",
			true,
			later,
		)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if item.Name != "Café Espresso Doble" {
			t.Errorf("expected Name 'Café Espresso Doble', got '%s'", item.Name)
		}
		if item.Price != 3.00 {
			t.Errorf("expected Price 3.00, got %f", item.Price)
		}
		if item.PrepTime == nil || *item.PrepTime != 10 {
			t.Errorf("expected PrepTime 10, got %v", item.PrepTime)
		}
	})

	t.Run("invalid price update", func(t *testing.T) {
		err := item.Update("Café", "desc", -2.0, 0.0, nil, false, false, "", "", "", true, later)
		if err != itemmenu.ErrInvalidPrice {
			t.Errorf("expected ErrInvalidPrice, got %v", err)
		}
	})
}
