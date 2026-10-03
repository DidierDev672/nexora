package reserve_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	reservehttp "nexora-api-rest/internal/api/reserve"
	reserveapp "nexora-api-rest/internal/application/reserve"
	"nexora-api-rest/internal/domain"
)

type mockReserveCreator struct {
	created domain.Reserve
	err     error
}

func (m *mockReserveCreator) Create(ctx context.Context, in reserveapp.CreateInput) (domain.Reserve, error) {
	if m.err != nil {
		return domain.Reserve{}, m.err
	}
	return m.created, nil
}

type mockReserveLister struct {
	items []domain.Reserve
	err   error
}

func (m *mockReserveLister) List(ctx context.Context) ([]domain.Reserve, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockReserveGetter struct {
	item domain.Reserve
	err  error
}

func (m *mockReserveGetter) GetByID(ctx context.Context, id domain.ReserveID) (domain.Reserve, error) {
	if m.err != nil {
		return domain.Reserve{}, m.err
	}
	return m.item, nil
}

type mockReserveUpdater struct {
	updated domain.Reserve
	err     error
}

func (m *mockReserveUpdater) Update(ctx context.Context, in reserveapp.UpdateInput) (domain.Reserve, error) {
	if m.err != nil {
		return domain.Reserve{}, m.err
	}
	return m.updated, nil
}

type mockReserveDeleter struct {
	err error
}

func (m *mockReserveDeleter) Delete(ctx context.Context, id domain.ReserveID) error {
	return m.err
}

func sampleReserve() domain.Reserve {
	now := time.Now().UTC().Truncate(time.Second)
	return domain.Reserve{
		ID:             domain.ReserveID("res-100"),
		RoomID:         domain.RoomID("room-1"),
		PersonID:       domain.PersonID("person-1"),
		CheckInDate:    now,
		CheckOutDate:   now.Add(48 * time.Hour),
		NumberOfGuests: 2,
		State:          domain.ReserveStateConfirmed,
		TotalPrice:     150.50,
		CreatedBy:      "receptionist",
		CreatedAt:      now,
		UpdatedAt:      now,
	}
}

func TestReserveHandler_Create(t *testing.T) {
	res := sampleReserve()
	handler := &reservehttp.Handler{
		Creator: &mockReserveCreator{created: res},
	}

	body := map[string]any{
		"room_id":          "room-1",
		"person_id":        "person-1",
		"check_in_date":    "2026-10-01T14:00:00Z",
		"check_out_date":   "2026-10-03T11:00:00Z",
		"number_of_guests": 2,
		"state":            "confirmed",
		"total_price":      150.50,
		"created_by":       "receptionist",
	}

	raw, _ := json.Marshal(body)
	req := httptest.NewRequest(http.MethodPost, "/reserve", bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.Create(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("expected status 201, got %d", resp.StatusCode)
	}

	var resBody map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&resBody); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resBody["id"] != "res-100" {
		t.Errorf("expected id res-100, got %v", resBody["id"])
	}
	if resBody["state"] != "confirmed" {
		t.Errorf("expected state confirmed, got %v", resBody["state"])
	}
	if resBody["number_of_guests"] != float64(2) {
		t.Errorf("expected 2 guests, got %v", resBody["number_of_guests"])
	}
}

func TestReserveHandler_List(t *testing.T) {
	res := sampleReserve()
	handler := &reservehttp.Handler{
		Lister: &mockReserveLister{items: []domain.Reserve{res}},
	}

	req := httptest.NewRequest(http.MethodGet, "/reserve", nil)
	w := httptest.NewRecorder()

	handler.List(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	var resList []map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&resList); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(resList) != 1 {
		t.Fatalf("expected 1 item, got %d", len(resList))
	}
	if resList[0]["id"] != "res-100" {
		t.Errorf("expected id res-100, got %v", resList[0]["id"])
	}
}

func TestReserveHandler_Get(t *testing.T) {
	res := sampleReserve()
	handler := &reservehttp.Handler{
		Getter: &mockReserveGetter{item: res},
	}

	req := httptest.NewRequest(http.MethodGet, "/reserve/res-100", nil)
	req.SetPathValue("id", "res-100")
	w := httptest.NewRecorder()

	handler.Get(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	var resBody map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&resBody); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resBody["id"] != "res-100" {
		t.Errorf("expected id res-100, got %v", resBody["id"])
	}
}

func TestReserveHandler_Update(t *testing.T) {
	res := sampleReserve()
	res.State = domain.ReserveStateInProgress
	handler := &reservehttp.Handler{
		Updater: &mockReserveUpdater{updated: res},
	}

	body := map[string]any{
		"state": "in progress",
	}
	raw, _ := json.Marshal(body)

	req := httptest.NewRequest(http.MethodPut, "/reserve/res-100", bytes.NewReader(raw))
	req.SetPathValue("id", "res-100")
	w := httptest.NewRecorder()

	handler.Update(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected status 200, got %d", resp.StatusCode)
	}

	var resBody map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&resBody); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resBody["state"] != "in progress" {
		t.Errorf("expected state in progress, got %v", resBody["state"])
	}
}

func TestReserveHandler_Delete(t *testing.T) {
	handler := &reservehttp.Handler{
		Deleter: &mockReserveDeleter{err: nil},
	}

	req := httptest.NewRequest(http.MethodDelete, "/reserve/res-100", nil)
	req.SetPathValue("id", "res-100")
	w := httptest.NewRecorder()

	handler.Delete(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("expected status 204, got %d", resp.StatusCode)
	}
}
