package menucategory_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"nexora-api-rest/internal/menucategory"
)

func setupTestMux() (*http.ServeMux, *mockRepo) {
	repo := newMockRepo()
	fixedNow := time.Date(2026, 10, 3, 12, 0, 0, 0, time.UTC)
	idGen := fixedIDGenerator{id: "cat-test-1"}
	clock := fixedClock{now: fixedNow}

	uc := menucategory.NewUseCase(repo, idGen, clock)
	h := menucategory.NewHandler(uc)

	mux := http.NewServeMux()
	h.Register(mux)
	return mux, repo
}

func TestHandler_HTTPFlow(t *testing.T) {
	mux, _ := setupTestMux()

	// 1. Test POST /menu-category
	body := []byte(`{
		"headquartes_id": "hq-abc",
		"sub_headquartes_id": "sub-123",
		"building_id": "bld-456",
		"name": "Coctelería",
		"description": "Bebidas con alcohol",
		"order": 1,
		"asset": "cocktail.png",
		"created_by": "bartender"
	}`)

	req := httptest.NewRequest(http.MethodPost, "/menu-category", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got %d. Body: %s", w.Code, w.Body.String())
	}

	var created menucategory.Response
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if created.ID != "cat-test-1" {
		t.Errorf("expected ID 'cat-test-1', got %s", created.ID)
	}
	if created.HeadquarterID != "hq-abc" {
		t.Errorf("expected headquartes_id 'hq-abc', got %s", created.HeadquarterID)
	}
	if created.Name != "Coctelería" {
		t.Errorf("expected name 'Coctelería', got %s", created.Name)
	}

	// 2. Test GET /menu-category
	reqList := httptest.NewRequest(http.MethodGet, "/menu-category", nil)
	wList := httptest.NewRecorder()
	mux.ServeHTTP(wList, reqList)

	if wList.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", wList.Code)
	}

	var list []menucategory.Response
	if err := json.Unmarshal(wList.Body.Bytes(), &list); err != nil {
		t.Fatalf("failed to decode list response: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 item in list, got %d", len(list))
	}

	// 3. Test GET /menu-category/{id}
	reqGet := httptest.NewRequest(http.MethodGet, "/menu-category/cat-test-1", nil)
	wGet := httptest.NewRecorder()
	mux.ServeHTTP(wGet, reqGet)

	if wGet.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", wGet.Code)
	}

	// 4. Test PUT /menu-category/{id}
	updateBody := []byte(`{
		"name": "Coctelería de Autor",
		"description": "Tragos exclusivos",
		"order": 5,
		"asset": "cocktail_signature.png"
	}`)
	reqUpdate := httptest.NewRequest(http.MethodPut, "/menu-category/cat-test-1", bytes.NewReader(updateBody))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	mux.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updated menucategory.Response
	if err := json.Unmarshal(wUpdate.Body.Bytes(), &updated); err != nil {
		t.Fatalf("failed to decode updated response: %v", err)
	}
	if updated.Name != "Coctelería de Autor" {
		t.Errorf("expected updated name, got %s", updated.Name)
	}
	if updated.Order != 5 {
		t.Errorf("expected updated order 5, got %d", updated.Order)
	}

	// 5. Test DELETE /menu-category/{id}
	reqDel := httptest.NewRequest(http.MethodDelete, "/menu-category/cat-test-1", nil)
	wDel := httptest.NewRecorder()
	mux.ServeHTTP(wDel, reqDel)

	if wDel.Code != http.StatusNoContent {
		t.Fatalf("expected status 204 No Content, got %d", wDel.Code)
	}

	// Verify it's gone
	reqGetAfterDel := httptest.NewRequest(http.MethodGet, "/menu-category/cat-test-1", nil)
	wGetAfterDel := httptest.NewRecorder()
	mux.ServeHTTP(wGetAfterDel, reqGetAfterDel)
	if wGetAfterDel.Code != http.StatusNotFound {
		t.Fatalf("expected status 404 Not Found after delete, got %d", wGetAfterDel.Code)
	}
}
