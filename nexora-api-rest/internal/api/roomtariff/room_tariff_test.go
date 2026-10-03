package roomtariff_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	rthttp "nexora-api-rest/internal/api/roomtariff"
	rtapp "nexora-api-rest/internal/application/roomtariff"
	"nexora-api-rest/internal/domain"
)

type mockRoomTariffCreator struct {
	created domain.RoomTariff
	err     error
}

func (m *mockRoomTariffCreator) Create(ctx context.Context, in rtapp.CreateInput) (domain.RoomTariff, error) {
	if m.err != nil {
		return domain.RoomTariff{}, m.err
	}
	return m.created, nil
}

type mockRoomTariffLister struct {
	items []domain.RoomTariff
	err   error
}

func (m *mockRoomTariffLister) List(ctx context.Context) ([]domain.RoomTariff, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockRoomTariffByRoomLister struct {
	items []domain.RoomTariff
	err   error
}

func (m *mockRoomTariffByRoomLister) ListByRoom(ctx context.Context, roomID domain.RoomID) ([]domain.RoomTariff, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockRoomTariffGetter struct {
	item domain.RoomTariff
	err  error
}

func (m *mockRoomTariffGetter) GetByID(ctx context.Context, id domain.RoomTariffID) (domain.RoomTariff, error) {
	if m.err != nil {
		return domain.RoomTariff{}, m.err
	}
	return m.item, nil
}

type mockRoomTariffUpdater struct {
	updated domain.RoomTariff
	err     error
}

func (m *mockRoomTariffUpdater) Update(ctx context.Context, in rtapp.UpdateInput) (domain.RoomTariff, error) {
	if m.err != nil {
		return domain.RoomTariff{}, m.err
	}
	return m.updated, nil
}

type mockRoomTariffDeleter struct {
	err error
}

func (m *mockRoomTariffDeleter) Delete(ctx context.Context, id domain.RoomTariffID) error {
	return m.err
}

func newRoomTariff(t *testing.T) domain.RoomTariff {
	t.Helper()
	now := time.Now().UTC().Truncate(time.Second)

	tariff, err := domain.NewRoomTariff(
		"room-tariff-1",
		"room-1",
		"rate-1",
		true,
		domain.RoomTariffStatusActive,
		"supervisor@nexora.com",
		now,
	)
	if err != nil {
		t.Fatalf("failed to build room tariff: %v", err)
	}
	return tariff
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

func TestRoomTariffHandler_Create(t *testing.T) {
	handler := &rthttp.Handler{
		Creator: &mockRoomTariffCreator{created: newRoomTariff(t)},
	}

	payload := map[string]interface{}{
		"room_id":    "room-1",
		"rate_id":    "rate-1",
		"is_default": true,
		"status":     "active",
		"created_by": "supervisor@nexora.com",
	}

	rec := postJSON(t, handler.Create, "/room_tariffs", payload)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp["id"] != "room-tariff-1" {
		t.Fatalf("expected id room-tariff-1, got %v", resp["id"])
	}
	if resp["is_default"] != true {
		t.Fatalf("expected is_default true, got %v", resp["is_default"])
	}
}

func TestRoomTariffHandler_Create_RejectsDomainError(t *testing.T) {
	handler := &rthttp.Handler{
		Creator: &mockRoomTariffCreator{err: domain.ErrInvalidRoomTariffRoomID},
	}

	payload := map[string]interface{}{
		"room_id": "room-1",
		"rate_id": "rate-1",
	}

	rec := postJSON(t, handler.Create, "/room_tariffs", payload)

	if rec.Code != http.StatusUnprocessableEntity {
		t.Fatalf("expected status 422, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRoomTariffHandler_Create_RejectsUnknownField(t *testing.T) {
	handler := &rthttp.Handler{
		Creator: &mockRoomTariffCreator{created: newRoomTariff(t)},
	}

	payload := map[string]interface{}{
		"room_id":    "room-1",
		"rate_id":    "rate-1",
		"unexpected": "value",
	}

	rec := postJSON(t, handler.Create, "/room_tariffs", payload)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRoomTariffHandler_List(t *testing.T) {
	handler := &rthttp.Handler{
		Lister: &mockRoomTariffLister{items: []domain.RoomTariff{newRoomTariff(t)}},
	}

	req := httptest.NewRequest(http.MethodGet, "/room_tariffs", nil)
	rec := httptest.NewRecorder()
	handler.List(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var list []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &list); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(list) != 1 {
		t.Fatalf("expected 1 room tariff, got %d", len(list))
	}
	if list[0]["is_default"] != true {
		t.Fatalf("expected is_default true, got %v", list[0]["is_default"])
	}
}

func TestRoomTariffHandler_Get(t *testing.T) {
	handler := &rthttp.Handler{
		Getter: &mockRoomTariffGetter{item: newRoomTariff(t)},
	}

	req := httptest.NewRequest(http.MethodGet, "/room_tariffs/room-tariff-1", nil)
	req.SetPathValue("id", "room-tariff-1")
	rec := httptest.NewRecorder()
	handler.Get(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp["id"] != "room-tariff-1" {
		t.Fatalf("expected id room-tariff-1, got %v", resp["id"])
	}
}

func TestRoomTariffHandler_Get_NotFound(t *testing.T) {
	handler := &rthttp.Handler{
		Getter: &mockRoomTariffGetter{err: domain.ErrRoomTariffNotFound},
	}

	req := httptest.NewRequest(http.MethodGet, "/room_tariffs/missing", nil)
	req.SetPathValue("id", "missing")
	rec := httptest.NewRecorder()
	handler.Get(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRoomTariffHandler_ListByRoom(t *testing.T) {
	handler := &rthttp.Handler{
		ByRoom: &mockRoomTariffByRoomLister{items: []domain.RoomTariff{newRoomTariff(t)}},
	}

	req := httptest.NewRequest(http.MethodGet, "/room_tariffs/by-room/room-1", nil)
	req.SetPathValue("room_id", "room-1")
	rec := httptest.NewRecorder()
	handler.ListByRoom(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(resp) != 1 {
		t.Fatalf("expected 1 room tariff, got %d", len(resp))
	}
	if resp[0]["room_id"] != "room-1" {
		t.Fatalf("expected room_id room-1, got %v", resp[0]["room_id"])
	}
}

func TestRoomTariffHandler_ListByRoom_MissingRoom(t *testing.T) {
	handler := &rthttp.Handler{
		ByRoom: &mockRoomTariffByRoomLister{},
	}

	req := httptest.NewRequest(http.MethodGet, "/room_tariffs/by-room/", nil)
	req.SetPathValue("room_id", "")
	rec := httptest.NewRecorder()
	handler.ListByRoom(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}

func TestRoomTariffHandler_Update(t *testing.T) {
	handler := &rthttp.Handler{
		Updater: &mockRoomTariffUpdater{updated: newRoomTariff(t)},
	}

	payload := map[string]interface{}{
		"room_id":    "room-1",
		"rate_id":    "rate-1",
		"is_default": false,
		"status":     "inactive",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPut, "/room_tariffs/room-tariff-1", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.SetPathValue("id", "room-tariff-1")
	rec := httptest.NewRecorder()
	handler.Update(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRoomTariffHandler_Update_RequiresID(t *testing.T) {
	handler := &rthttp.Handler{
		Updater: &mockRoomTariffUpdater{},
	}

	payload := map[string]interface{}{
		"room_id": "room-1",
		"rate_id": "rate-1",
	}
	body, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPut, "/room_tariffs", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	handler.Update(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRoomTariffHandler_Delete(t *testing.T) {
	handler := &rthttp.Handler{
		Deleter: &mockRoomTariffDeleter{},
	}

	req := httptest.NewRequest(http.MethodDelete, "/room_tariffs/room-tariff-1", nil)
	req.SetPathValue("id", "room-tariff-1")
	rec := httptest.NewRecorder()
	handler.Delete(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Fatalf("expected status 204, got %d", rec.Code)
	}
}

func TestRoomTariffHandler_Delete_NotFound(t *testing.T) {
	handler := &rthttp.Handler{
		Deleter: &mockRoomTariffDeleter{err: domain.ErrRoomTariffNotFound},
	}

	req := httptest.NewRequest(http.MethodDelete, "/room_tariffs/missing", nil)
	req.SetPathValue("id", "missing")
	rec := httptest.NewRecorder()
	handler.Delete(rec, req)

	if rec.Code != http.StatusNotFound {
		t.Fatalf("expected status 404, got %d", rec.Code)
	}
}
