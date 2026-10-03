package rate_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	ratehttp "nexora-api-rest/internal/api/rate"
	rateapp "nexora-api-rest/internal/application/rate"
	"nexora-api-rest/internal/domain"
)

type mockRateCreator struct {
	created domain.Rate
	err     error
}

func (m *mockRateCreator) Create(ctx context.Context, in rateapp.CreateInput) (domain.Rate, error) {
	if m.err != nil {
		return domain.Rate{}, m.err
	}
	return m.created, nil
}

type mockRateLister struct {
	items  []domain.Rate
	filter domain.RateFilter
	err    error
}

func (m *mockRateLister) List(ctx context.Context, filter domain.RateFilter) ([]domain.Rate, error) {
	m.filter = filter
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockRateGetter struct {
	item domain.Rate
	err  error
}

func (m *mockRateGetter) GetByID(ctx context.Context, id domain.RateID) (domain.Rate, error) {
	if m.err != nil {
		return domain.Rate{}, m.err
	}
	return m.item, nil
}

type mockRateUpdater struct {
	updated domain.Rate
	err     error
}

func (m *mockRateUpdater) Update(ctx context.Context, in rateapp.UpdateInput) (domain.Rate, error) {
	if m.err != nil {
		return domain.Rate{}, m.err
	}
	return m.updated, nil
}

type mockRateDeleter struct {
	err error
}

func (m *mockRateDeleter) Delete(ctx context.Context, id domain.RateID) error {
	return m.err
}

func newRate(t *testing.T) domain.Rate {
	t.Helper()
	now := time.Now().UTC().Truncate(time.Second)
	subHeadquarterID := domain.SubHeadquarterID("sub-1")
	roomTypeID := domain.RoomTypeID("room-type-1")
	startTime := "20:00:00"
	endTime := "08:00:00"

	rate, err := domain.NewRate(
		"rate-1",
		"Tarifa Noche Fin de Semana",
		"hq-1",
		&subHeadquarterID,
		&roomTypeID,
		domain.RateModalityNight,
		120,
		1,
		&startTime,
		&endTime,
		"weekend",
		domain.RateStatusActive,
		"supervisor@nexora.com",
		now,
	)
	if err != nil {
		t.Fatalf("failed to build rate: %v", err)
	}
	return rate
}

func postJSON(t *testing.T, handler http.HandlerFunc, path string, payload map[string]interface{}) *httptest.ResponseRecorder {
	t.Helper()
	body, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("failed to encode payload: %v", err)
	}
	req := httptest.NewRequest(http.MethodPost, path, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler(rec, req)
	return rec
}

func TestRateHandler_Create(t *testing.T) {
	rate := newRate(t)
	handler := &ratehttp.Handler{
		Creator: &mockRateCreator{created: rate},
	}

	payload := map[string]interface{}{
		"name":              "Tarifa Noche Fin de Semana",
		"headquarter_id":    "hq-1",
		"subheadquarter_id": "sub-1",
		"room_type_id":      "room-type-1",
		"modality":          "night",
		"price":             120.0,
		"duration_units":    1,
		"start_time":        "20:00:00",
		"end_time":          "08:00:00",
		"days_of_week":      "weekend",
		"status":            "active",
		"created_by":        "supervisor@nexora.com",
	}

	rec := postJSON(t, handler.Create, "/rates", payload)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp["id"] != "rate-1" {
		t.Fatalf("expected id rate-1, got %v", resp["id"])
	}
	if resp["modality"] != "night" {
		t.Fatalf("expected modality night, got %v", resp["modality"])
	}
	if resp["subheadquarter_id"] != "sub-1" {
		t.Fatalf("expected subheadquarter_id sub-1, got %v", resp["subheadquarter_id"])
	}
}

func TestRateHandler_Create_RejectsDomainError(t *testing.T) {
	handler := &ratehttp.Handler{
		Creator: &mockRateCreator{err: domain.ErrInvalidRatePrice},
	}

	payload := map[string]interface{}{
		"name":           "Tarifa Inválida",
		"headquarter_id": "hq-1",
		"modality":       "night",
		"price":          0,
	}

	rec := postJSON(t, handler.Create, "/rates", payload)

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected status 422, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRateHandler_Create_RejectsUnknownField(t *testing.T) {
	handler := &ratehttp.Handler{
		Creator: &mockRateCreator{created: newRate(t)},
	}

	payload := map[string]interface{}{
		"name":           "Tarifa Noche",
		"headquarter_id": "hq-1",
		"modality":       "night",
		"price":          120.0,
		"unexpected":     "value",
	}

	rec := postJSON(t, handler.Create, "/rates", payload)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRateHandler_List(t *testing.T) {
	rate := newRate(t)
	lister := &mockRateLister{items: []domain.Rate{rate}}
	handler := &ratehttp.Handler{Lister: lister}

	req := httptest.NewRequest(http.MethodGet, "/rates?headquarter_id=hq-1&modality=night&status=active", nil)
	rec := httptest.NewRecorder()
	handler.List(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}
	if lister.filter.HeadquarterID == nil || *lister.filter.HeadquarterID != "hq-1" {
		t.Fatalf("expected headquarter filter hq-1, got %v", lister.filter.HeadquarterID)
	}
	if lister.filter.Modality == nil || *lister.filter.Modality != domain.RateModalityNight {
		t.Fatalf("expected modality filter night, got %v", lister.filter.Modality)
	}
	if lister.filter.Status == nil || *lister.filter.Status != domain.RateStatusActive {
		t.Fatalf("expected status filter active, got %v", lister.filter.Status)
	}

	var list []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &list); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 rate, got %d", len(list))
	}
}

func TestRateHandler_List_RejectsInvalidFilter(t *testing.T) {
	handler := &ratehttp.Handler{Lister: &mockRateLister{}}

	req := httptest.NewRequest(http.MethodGet, "/rates?modality=yearly", nil)
	rec := httptest.NewRecorder()
	handler.List(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRateHandler_Get(t *testing.T) {
	handler := &ratehttp.Handler{
		Getter: &mockRateGetter{item: newRate(t)},
	}

	req := httptest.NewRequest(http.MethodGet, "/rates/rate-1", nil)
	req.SetPathValue("id", "rate-1")
	rec := httptest.NewRecorder()
	handler.Get(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp["id"] != "rate-1" {
		t.Fatalf("expected id rate-1, got %v", resp["id"])
	}
}

func TestRateHandler_Get_NotFound(t *testing.T) {
	handler := &ratehttp.Handler{
		Getter: &mockRateGetter{err: domain.ErrRateNotFound},
	}

	req := httptest.NewRequest(http.MethodGet, "/rates/missing", nil)
	req.SetPathValue("id", "missing")
	rec := httptest.NewRecorder()
	handler.Get(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRateHandler_Update(t *testing.T) {
	handler := &ratehttp.Handler{
		Updater: &mockRateUpdater{updated: newRate(t)},
	}

	payload := map[string]interface{}{
		"name":           "Tarifa Noche Fin de Semana Ajustada",
		"headquarter_id": "hq-1",
		"modality":       "night",
		"price":          135.0,
		"days_of_week":   "weekend",
		"status":         "active",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPut, "/rates/rate-1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "rate-1")
	rec := httptest.NewRecorder()
	handler.Update(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRateHandler_Update_RequiresID(t *testing.T) {
	handler := &ratehttp.Handler{
		Updater: &mockRateUpdater{},
	}

	payload := map[string]interface{}{
		"name":           "Tarifa",
		"headquarter_id": "hq-1",
		"modality":       "night",
		"price":          120.0,
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPut, "/rates", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.Update(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRateHandler_Delete(t *testing.T) {
	handler := &ratehttp.Handler{
		Deleter: &mockRateDeleter{},
	}

	req := httptest.NewRequest(http.MethodDelete, "/rates/rate-1", nil)
	req.SetPathValue("id", "rate-1")
	rec := httptest.NewRecorder()
	handler.Delete(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected status 204, got %d", rec.Code)
	}
}

func TestRateHandler_Delete_NotFound(t *testing.T) {
	handler := &ratehttp.Handler{
		Deleter: &mockRateDeleter{err: domain.ErrRateNotFound},
	}

	req := httptest.NewRequest(http.MethodDelete, "/rates/missing", nil)
	req.SetPathValue("id", "missing")
	rec := httptest.NewRecorder()
	handler.Delete(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", rec.Code)
	}
}
