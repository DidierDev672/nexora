package serviceassignment_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"nexora-api-rest/internal/serviceassignment"
)

func TestHandler_HTTPEndpoints(t *testing.T) {
	repo := newMemoryRepo()
	uc := serviceassignment.NewUseCase(repo, nil, nil)
	h := serviceassignment.NewHandler(uc)

	mux := http.NewServeMux()
	h.Register(mux)

	// 1. POST /service-assignments -> 201 Created
	payload := `{"service_request_id":"sr-123","stay_id":"stay-456","person_id":"per-789","is_active":true}`
	req := httptest.NewRequest(http.MethodPost, "/service-assignments", bytes.NewBufferString(payload))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201 Created, got %d: %s", rec.Code, rec.Body.String())
	}

	var created serviceassignment.ServiceAssignment
	if err := json.Unmarshal(rec.Body.Bytes(), &created); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if created.ID == "" || created.ServiceRequestID != "sr-123" {
		t.Errorf("unexpected created assignment: %+v", created)
	}

	// 2. GET /service-assignments -> 200 OK
	req = httptest.NewRequest(http.MethodGet, "/service-assignments", nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}

	// 3. GET /service-assignments/{id} -> 200 OK
	req = httptest.NewRequest(http.MethodGet, "/service-assignments/"+string(created.ID), nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}

	// 4. PUT /service-assignments/{id} -> 200 OK
	updatePayload := `{"service_request_id":"sr-updated","stay_id":"stay-456","person_id":"per-789","is_active":false}`
	req = httptest.NewRequest(http.MethodPut, "/service-assignments/"+string(created.ID), bytes.NewBufferString(updatePayload))
	req.Header.Set("Content-Type", "application/json")
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d: %s", rec.Code, rec.Body.String())
	}

	// 5. DELETE /service-assignments/{id} -> 200 OK
	req = httptest.NewRequest(http.MethodDelete, "/service-assignments/"+string(created.ID), nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rec.Code)
	}

	// 6. GET /service-assignments/{id} after delete -> 404 Not Found
	req = httptest.NewRequest(http.MethodGet, "/service-assignments/"+string(created.ID), nil)
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected 404 Not Found, got %d", rec.Code)
	}

	// 7. POST con body inválido -> 400 Bad Request
	req = httptest.NewRequest(http.MethodPost, "/service-assignments", bytes.NewBufferString(`{"service_request_id":""}`))
	rec = httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 Bad Request, got %d", rec.Code)
	}
}
