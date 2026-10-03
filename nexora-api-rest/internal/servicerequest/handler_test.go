package servicerequest_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"nexora-api-rest/internal/servicerequest"
)

func setupSRMux() (*http.ServeMux, *mockSRRepo) {
	repo := newMockSRRepo()
	fixedNow := time.Date(2026, 10, 3, 14, 0, 0, 0, time.UTC)
	idGen := &fixedIDGen{}
	clock := fixedClock{now: fixedNow}

	uc := servicerequest.NewUseCase(repo, idGen, clock)
	h := servicerequest.NewHandler(uc)

	mux := http.NewServeMux()
	h.Register(mux)
	return mux, repo
}

func TestHandler_HTTPFlow(t *testing.T) {
	mux, _ := setupSRMux()

	// 1. Test POST /service-request
	body := []byte(`{
		"order_number": "ORD-2026-888",
		"stay_id": "stay-44",
		"room_id": "room-302",
		"person_id": "guest-11",
		"channel": "room_tablet",
		"payment_method": "room_charge",
		"general_notes": "Dejar cubiertos extra",
		"delivery_instructions": "Tocar timbre suavemente",
		"currency": "USD",
		"tip": 3.0,
		"items": [
			{
				"item_menu_id": "item-pasta",
				"name_snapshot": "Fettuccine Alfredo",
				"price_unit": 18.0,
				"tax_rate": 10.0,
				"amount": 1,
				"note": "Poco queso"
			}
		],
		"created_by": "guest_app"
	}`)

	req := httptest.NewRequest(http.MethodPost, "/service-request", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	mux.ServeHTTP(w, req)

	if w.Code != http.StatusCreated {
		t.Fatalf("expected status 201 Created, got %d. Body: %s", w.Code, w.Body.String())
	}

	var created servicerequest.Response
	if err := json.Unmarshal(w.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if created.ID != "sr-id-1" {
		t.Errorf("expected ID 'sr-id-1', got %s", created.ID)
	}
	if created.OrderNumber != "ORD-2026-888" {
		t.Errorf("expected OrderNumber 'ORD-2026-888', got %s", created.OrderNumber)
	}
	if created.Total != 22.8 { // 18 + 1.8 + 3
		t.Errorf("expected Total 22.8, got %f", created.Total)
	}
	if len(created.Items) != 1 {
		t.Fatalf("expected 1 item, got %d", len(created.Items))
	}

	// 2. Test GET /service-request
	reqList := httptest.NewRequest(http.MethodGet, "/service-request", nil)
	wList := httptest.NewRecorder()
	mux.ServeHTTP(wList, reqList)

	if wList.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", wList.Code)
	}

	var list []servicerequest.Response
	if err := json.Unmarshal(wList.Body.Bytes(), &list); err != nil {
		t.Fatalf("failed to decode list response: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 result, got %d", len(list))
	}

	// 3. Test GET /service-request/{id}
	reqGet := httptest.NewRequest(http.MethodGet, "/service-request/sr-id-1", nil)
	wGet := httptest.NewRecorder()
	mux.ServeHTTP(wGet, reqGet)

	if wGet.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d", wGet.Code)
	}

	// 4. Test PUT /service-request/{id}
	updateBody := []byte(`{
		"status": "confirmed",
		"actor_type": "staff",
		"actor_id": "waiter-9",
		"status_comment": "En cocina"
	}`)
	reqUpdate := httptest.NewRequest(http.MethodPut, "/service-request/sr-id-1", bytes.NewReader(updateBody))
	reqUpdate.Header.Set("Content-Type", "application/json")
	wUpdate := httptest.NewRecorder()
	mux.ServeHTTP(wUpdate, reqUpdate)

	if wUpdate.Code != http.StatusOK {
		t.Fatalf("expected status 200 OK, got %d. Body: %s", wUpdate.Code, wUpdate.Body.String())
	}

	var updated servicerequest.Response
	if err := json.Unmarshal(wUpdate.Body.Bytes(), &updated); err != nil {
		t.Fatalf("failed to decode update response: %v", err)
	}
	if updated.Status != "confirmed" {
		t.Errorf("expected Status 'confirmed', got %s", updated.Status)
	}

	// 5. Test DELETE /service-request/{id}
	reqDel := httptest.NewRequest(http.MethodDelete, "/service-request/sr-id-1", nil)
	wDel := httptest.NewRecorder()
	mux.ServeHTTP(wDel, reqDel)

	if wDel.Code != http.StatusNoContent {
		t.Fatalf("expected status 204 No Content, got %d", wDel.Code)
	}
}
