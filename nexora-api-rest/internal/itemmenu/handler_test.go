package itemmenu_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"nexora-api-rest/internal/itemmenu"
)

func setupItemMenuMux() (*http.ServeMux, *mockItemRepo) {
	repo := newMockItemRepo()
	fixedNow := time.Date(2026, 10, 3, 12, 0, 0, 0, time.UTC)
	idGen := fixedItemIDGenerator{id: "item-test-1"}
	clock := fixedItemClock{now: fixedNow}

	uc := itemmenu.NewUseCase(repo, idGen, clock)
	h := itemmenu.NewHandler(uc)

	mux := http.NewServeMux()
	h.Register(mux)
	return mux, repo
}

func TestHandler_HTTPFlow(t *testing.T) {
	mux, _ := setupItemMenuMux()

	// 1. Test POST /item-menu
	body := []byte(`{
		"category_id": "cat-pizzas",
		"name": "Pizza Margarita",
		"description": "Salsa de tomate, mozzarella fior di latte y albahaca fresca",
		"price": 14.00,
		"tax_percentage": 10.0,
		"prep_time": 18,
		"isVegetarian": true,
		"isVegan": false,
		"imageURL": "https://example.com/pizza.jpg",
		"start_time": "12:00",
		"end_time": "23:00",
		"available": true,
		"created_by": "pizzaiolo"
	}`)

	req := httptest.NewRequest(http.MethodPost, "/item-menu", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got %d. Body: %s", w.Code, w.Body.String())
	}

	var created itemmenu.Response
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if created.ID != "item-test-1" {
		t.Errorf("expected ID 'item-test-1', got %s", created.ID)
	}
	if created.CategoryID != "cat-pizzas" {
		t.Errorf("expected category_id 'cat-pizzas', got %s", created.CategoryID)
	}
	if created.Name != "Pizza Margarita" {
		t.Errorf("expected name 'Pizza Margarita', got %s", created.Name)
	}
	if !created.IsVegetarian {
		t.Errorf("expected isVegetarian true")
	}

	// 2. Test GET /item-menu
	reqList := httptest.NewRequest(http.MethodGet, "/item-menu", nil)
	wList := httptest.NewRecorder()
	mux.ServeHTTP(wList, reqList)

	if wList.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", wList.Code)
	}

	var list []itemmenu.Response
	if err := json.Unmarshal(wList.Body.Bytes(), &list); err != nil {
		t.Fatalf("failed to decode list response: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 item, got %d", len(list))
	}

	// 3. Test GET /item-menu/{id}
	reqGet := httptest.NewRequest(http.MethodGet, "/item-menu/item-test-1", nil)
	wGet := httptest.NewRecorder()
	mux.ServeHTTP(wGet, reqGet)

	if wGet.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", wGet.Code)
	}

	// 4. Test PUT /item-menu/{id}
	updateBody := []byte(`{
		"name": "Pizza Margarita Bufala",
		"description": "Mozzarella di bufala campana DOP",
		"price": 16.50,
		"tax_percentage": 10.0,
		"prep_time": 20,
		"isVegetarian": true,
		"isVegan": false,
		"imageURL": "https://example.com/bufala.jpg",
		"start_time": "12:00",
		"end_time": "23:00",
		"available": true
	}`)
	reqUpdate := httptest.NewRequest(http.MethodPut, "/item-menu/item-test-1", bytes.NewReader(updateBody))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	mux.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updated itemmenu.Response
	if err := json.Unmarshal(wUpdate.Body.Bytes(), &updated); err != nil {
		t.Fatalf("failed to decode updated response: %v", err)
	}
	if updated.Name != "Pizza Margarita Bufala" {
		t.Errorf("expected updated name, got %s", updated.Name)
	}
	if updated.Price != 16.50 {
		t.Errorf("expected price 16.50, got %f", updated.Price)
	}

	// 5. Test DELETE /item-menu/{id}
	reqDel := httptest.NewRequest(http.MethodDelete, "/item-menu/item-test-1", nil)
	wDel := httptest.NewRecorder()
	mux.ServeHTTP(wDel, reqDel)

	if wDel.Code != http.StatusNoContent {
		t.Fatalf("expected status 204 No Content, got %d", wDel.Code)
	}

	// Verify not found after deletion
	reqGetAfterDel := httptest.NewRequest(http.MethodGet, "/item-menu/item-test-1", nil)
	wGetAfterDel := httptest.NewRecorder()
	mux.ServeHTTP(wGetAfterDel, reqGetAfterDel)
	if wGetAfterDel.Code != http.StatusNotFound {
		t.Fatalf("expected status 404 Not Found after delete, got %d", wGetAfterDel.Code)
	}
}
