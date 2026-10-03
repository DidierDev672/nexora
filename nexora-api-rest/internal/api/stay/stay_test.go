package stay_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	stayhttp "nexora-api-rest/internal/api/stay"
	stayapp "nexora-api-rest/internal/application/stay"
	"nexora-api-rest/internal/domain"
)

type mockStayCreator struct {
	created domain.Stay
	err     error
}

func (m *mockStayCreator) Create(ctx context.Context, in stayapp.CreateInput) (domain.Stay, error) {
	if m.err != nil {
		return domain.Stay{}, m.err
	}
	return m.created, nil
}

type mockStayLister struct {
	items []domain.Stay
	err   error
}

func (m *mockStayLister) List(ctx context.Context) ([]domain.Stay, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockStayGetter struct {
	item domain.Stay
	err  error
}

func (m *mockStayGetter) GetByID(ctx context.Context, id domain.StayID) (domain.Stay, error) {
	if m.err != nil {
		return domain.Stay{}, m.err
	}
	return m.item, nil
}

type mockStayUpdater struct {
	updated domain.Stay
	err     error
}

func (m *mockStayUpdater) Update(ctx context.Context, in stayapp.UpdateInput) (domain.Stay, error) {
	if m.err != nil {
		return domain.Stay{}, m.err
	}
	return m.updated, nil
}

type mockStayDeleter struct {
	err error
}

func (m *mockStayDeleter) Delete(ctx context.Context, id domain.StayID) error {
	return m.err
}

func TestStayHandler_Create(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	stay, _ := domain.NewStay(
		"stay-1",
		"room-1",
		"res-1",
		[]domain.PersonID{"person-1"},
		now,
		now.Add(24*time.Hour),
		domain.PaymentMethodCash,
		100.0,
		"no remarks",
		domain.StayStatusProgress,
		"admin",
		now,
	)

	handler := &stayhttp.Handler{
		Creator: &mockStayCreator{created: stay},
	}

	payload := map[string]interface{}{
		"room_id":          "room-1",
		"reservation_id":   "res-1",
		"person_ids":       []string{"person-1"},
		"check_in_date":    now.Format(time.RFC3339),
		"check_out_date":   now.Add(24 * time.Hour).Format(time.RFC3339),
		"payment_method":   "cash",
		"security_deposit": 100.0,
		"remarks":          "no remarks",
		"status":           "progress",
		"created_by":       "admin",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/stays", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	handler.Create(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resp["id"] != "stay-1" {
		t.Fatalf("expected id stay-1, got %v", resp["id"])
	}
	if resp["payment_method"] != "cash" {
		t.Fatalf("expected payment_method cash, got %v", resp["payment_method"])
	}
}

func TestStayHandler_Create_InvalidDate(t *testing.T) {
	handler := &stayhttp.Handler{
		Creator: &mockStayCreator{},
	}

	payload := map[string]interface{}{
		"room_id":        "room-1",
		"reservation_id": "res-1",
		"person_ids":     []string{"person-1"},
		"check_in_date":  "invalid-date",
		"check_out_date": "2026-09-25T12:00:00Z",
		"payment_method": "cash",
	}

	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/stays", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	handler.Create(rec, req)

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected status 422, got %d", rec.Code)
	}
}

func TestStayHandler_Get(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	stay, _ := domain.NewStay(
		"stay-123",
		"room-1",
		"res-1",
		[]domain.PersonID{"person-1"},
		now,
		now.Add(24*time.Hour),
		domain.PaymentMethodCard,
		50.0,
		"",
		domain.StayStatusProgress,
		"admin",
		now,
	)

	handler := &stayhttp.Handler{
		Getter: &mockStayGetter{item: stay},
	}

	req := httptest.NewRequest(http.MethodGet, "/stays/stay-123", nil)
	req.SetPathValue("id", "stay-123")
	rec := httptest.NewRecorder()

	handler.Get(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var resp map[string]interface{}
	_ = json.Unmarshal(rec.Body.Bytes(), &resp)
	if resp["id"] != "stay-123" {
		t.Fatalf("expected stay-123, got %v", resp["id"])
	}
}

func TestStayHandler_Get_NotFound(t *testing.T) {
	handler := &stayhttp.Handler{
		Getter: &mockStayGetter{err: domain.ErrStayNotFound},
	}

	req := httptest.NewRequest(http.MethodGet, "/stays/missing", nil)
	req.SetPathValue("id", "missing")
	rec := httptest.NewRecorder()

	handler.Get(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", rec.Code)
	}
}

func TestStayHandler_List(t *testing.T) {
	now := time.Now().UTC().Truncate(time.Second)
	stay, _ := domain.NewStay(
		"stay-1",
		"room-1",
		"res-1",
		[]domain.PersonID{"person-1"},
		now,
		now.Add(24*time.Hour),
		domain.PaymentMethodCash,
		0,
		"",
		domain.StayStatusProgress,
		"admin",
		now,
	)

	handler := &stayhttp.Handler{
		Lister: &mockStayLister{items: []domain.Stay{stay}},
	}

	req := httptest.NewRequest(http.MethodGet, "/stays", nil)
	rec := httptest.NewRecorder()

	handler.List(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var list []map[string]interface{}
	_ = json.Unmarshal(rec.Body.Bytes(), &list)
	if len(list) != 1 {
		t.Fatalf("expected 1 stay, got %d", len(list))
	}
}

func TestStayHandler_Delete(t *testing.T) {
	handler := &stayhttp.Handler{
		Deleter: &mockStayDeleter{},
	}

	req := httptest.NewRequest(http.MethodDelete, "/stays/stay-1", nil)
	req.SetPathValue("id", "stay-1")
	rec := httptest.NewRecorder()

	handler.Delete(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected status 204, got %d", rec.Code)
	}
}
