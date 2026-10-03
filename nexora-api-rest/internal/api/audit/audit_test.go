package audit_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	audithttp "nexora-api-rest/internal/api/audit"
	"nexora-api-rest/internal/domain"
)

type mockSummaryProvider struct {
	summary domain.AuditSummary
	err     error
}

func (m *mockSummaryProvider) Summary(ctx context.Context) (domain.AuditSummary, error) {
	if m.err != nil {
		return domain.AuditSummary{}, m.err
	}
	return m.summary, nil
}

type mockRoomsProvider struct {
	items []domain.AuditRoom
	err   error
}

func (m *mockRoomsProvider) Rooms(ctx context.Context) ([]domain.AuditRoom, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockRoomsByStatusProvider struct {
	items []domain.AuditRoom
	err   error
}

func (m *mockRoomsByStatusProvider) RoomsByStatus(ctx context.Context, raw string) ([]domain.AuditRoom, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockRatesProvider struct {
	items []domain.Rate
	err   error
}

func (m *mockRatesProvider) Rates(ctx context.Context) ([]domain.Rate, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockRoomsWithoutTariffProvider struct {
	items []domain.AuditRoomGap
	err   error
}

func (m *mockRoomsWithoutTariffProvider) RoomsWithoutTariff(ctx context.Context) ([]domain.AuditRoomGap, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

type mockInactiveTariffsInUseProvider struct {
	items []domain.InactiveTariffInUse
	err   error
}

func (m *mockInactiveTariffsInUseProvider) InactiveTariffsInUse(ctx context.Context) ([]domain.InactiveTariffInUse, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.items, nil
}

func newAuditRoom(t *testing.T) domain.AuditRoom {
	t.Helper()
	tariffID := domain.RoomTariffID("room-tariff-1")
	rateID := domain.RateID("rate-1")
	price := domain.BasePrice(120.00)

	return domain.AuditRoom{
		ID:              "room-1",
		Number:          "105",
		Floor:           1,
		RoomTypeID:      "room-type-1",
		BuildingID:      "building-1",
		HeadquartersID:  "hq-1",
		Status:          domain.RoomStatusAvailable,
		DefaultTariffID: &tariffID,
		RateID:          &rateID,
		Price:           &price,
	}
}

func newAuditRoomGap(t *testing.T) domain.AuditRoomGap {
	t.Helper()
	return domain.AuditRoomGap{
		ID:             "room-2",
		Number:         "210",
		Floor:          2,
		RoomTypeID:     "room-type-1",
		BuildingID:     "building-1",
		HeadquartersID: "hq-1",
		Status:         domain.RoomStatusAvailable,
	}
}

func newInactiveTariffInUse(t *testing.T) domain.InactiveTariffInUse {
	t.Helper()
	return domain.InactiveTariffInUse{
		ID:        "room-tariff-1",
		RoomID:    "room-1",
		RateID:    "rate-1",
		RateName:  "Tarifa Legacy",
		RatePrice: 90.00,
		IsDefault: true,
	}
}

func newRate(t *testing.T) domain.Rate {
	t.Helper()
	now := time.Now().UTC().Truncate(time.Second)

	rate, err := domain.NewRate(
		"rate-1",
		"Tarifa Noche",
		"hq-1",
		nil,
		nil,
		domain.RateModalityNight,
		120.00,
		1,
		nil,
		nil,
		"all",
		domain.RateStatusActive,
		"supervisor@nexora.com",
		now,
	)
	if err != nil {
		t.Fatalf("failed to build rate: %v", err)
	}
	return rate
}

func newSummary() domain.AuditSummary {
	return domain.AuditSummary{
		Buildings: domain.AuditBuildingCount{
			Total:     3,
			Available: 3,
		},
		Rooms: domain.AuditRoomCount{
			Total:     2,
			Available: 2,
		},
		BedTypes: domain.AuditBedTypeCount{Total: 4},
		Headquarters: domain.AuditEntityCount{
			Total:  1,
			Active: 1,
		},
		SubHeadquarters: domain.AuditEntityCount{Total: 1},
		Rates: domain.AuditEntityCount{
			Total:    2,
			Active:   1,
			Inactive: 1,
		},
		RoomTariffs: domain.AuditRoomTariffCount{
			Total:    1,
			Active:   1,
			Defaults: 1,
		},
	}
}

func getJSON(t *testing.T, handler http.HandlerFunc, path string) *httptest.ResponseRecorder {
	t.Helper()
	req := httptest.NewRequest(http.MethodGet, path, nil)
	rec := httptest.NewRecorder()
	handler(rec, req)
	return rec
}

func TestAuditHandler_Summary(t *testing.T) {
	handler := &audithttp.Handler{
		Summarizer: &mockSummaryProvider{summary: newSummary()},
	}

	rec := getJSON(t, handler.Summary, "/audit/summary")

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp map[string]map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if resp["buildings"]["total"] != float64(3) {
		t.Fatalf("expected buildings total 3, got %v", resp["buildings"]["total"])
	}
	if resp["rates"]["inactive"] != float64(1) {
		t.Fatalf("expected rates inactive 1, got %v", resp["rates"]["inactive"])
	}
	if resp["room_tariffs"]["defaults"] != float64(1) {
		t.Fatalf("expected room_tariffs defaults 1, got %v", resp["room_tariffs"]["defaults"])
	}
}

func TestAuditHandler_Rooms(t *testing.T) {
	handler := &audithttp.Handler{
		RoomsLister: &mockRoomsProvider{items: []domain.AuditRoom{newAuditRoom(t)}},
	}

	rec := getJSON(t, handler.Rooms, "/audit/rooms")

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(resp) != 1 {
		t.Fatalf("expected 1 room, got %d", len(resp))
	}
	if resp[0]["default_tariff_id"] != "room-tariff-1" {
		t.Fatalf("expected tariff room-tariff-1, got %v", resp[0]["default_tariff_id"])
	}
	if resp[0]["price"] != float64(120) {
		t.Fatalf("expected price 120, got %v", resp[0]["price"])
	}
}

func TestAuditHandler_RoomsByStatus(t *testing.T) {
	handler := &audithttp.Handler{
		RoomsByStatusLister: &mockRoomsByStatusProvider{items: []domain.AuditRoom{newAuditRoom(t)}},
	}

	req := httptest.NewRequest(http.MethodGet, "/audit/rooms/by-status/available", nil)
	req.SetPathValue("status", "available")
	rec := httptest.NewRecorder()
	handler.RoomsByStatus(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(resp) != 1 {
		t.Fatalf("expected 1 room, got %d", len(resp))
	}
	if resp[0]["status"] != "available" {
		t.Fatalf("expected status available, got %v", resp[0]["status"])
	}
}

func TestAuditHandler_RoomsByStatus_RejectsInvalidStatus(t *testing.T) {
	handler := &audithttp.Handler{
		RoomsByStatusLister: &mockRoomsByStatusProvider{err: domain.ErrInvalidRoomStatus},
	}

	req := httptest.NewRequest(http.MethodGet, "/audit/rooms/by-status/alien", nil)
	req.SetPathValue("status", "alien")
	rec := httptest.NewRecorder()
	handler.RoomsByStatus(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestAuditHandler_RoomsByStatus_MissingStatus(t *testing.T) {
	handler := &audithttp.Handler{
		RoomsByStatusLister: &mockRoomsByStatusProvider{},
	}

	req := httptest.NewRequest(http.MethodGet, "/audit/rooms/by-status/", nil)
	req.SetPathValue("status", "")
	rec := httptest.NewRecorder()
	handler.RoomsByStatus(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", rec.Code)
	}
}

func TestAuditHandler_Rates(t *testing.T) {
	handler := &audithttp.Handler{
		RatesLister: &mockRatesProvider{items: []domain.Rate{newRate(t)}},
	}

	rec := getJSON(t, handler.Rates, "/audit/rates")

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(resp) != 1 {
		t.Fatalf("expected 1 rate, got %d", len(resp))
	}
	if resp[0]["price"] != float64(120) {
		t.Fatalf("expected price 120, got %v", resp[0]["price"])
	}
}

func TestAuditHandler_RoomsWithoutTariff(t *testing.T) {
	handler := &audithttp.Handler{
		RoomsWithoutTariffLister: &mockRoomsWithoutTariffProvider{items: []domain.AuditRoomGap{newAuditRoomGap(t)}},
	}

	rec := getJSON(t, handler.RoomsWithoutTariff, "/audit/rooms-without-tariff")

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(resp) != 1 {
		t.Fatalf("expected 1 gap, got %d", len(resp))
	}
	if resp[0]["gap"] != "sin_tarifa_aplicada_activa" {
		t.Fatalf("expected gap sin_tarifa_aplicada_activa, got %v", resp[0]["gap"])
	}
}

func TestAuditHandler_InactiveTariffsInUse(t *testing.T) {
	handler := &audithttp.Handler{
		InactiveTariffsInUseList: &mockInactiveTariffsInUseProvider{items: []domain.InactiveTariffInUse{newInactiveTariffInUse(t)}},
	}

	rec := getJSON(t, handler.InactiveTariffsInUse, "/audit/tariffs-inactive-in-use")

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp []map[string]interface{}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(resp) != 1 {
		t.Fatalf("expected 1 breach, got %d", len(resp))
	}
	if resp[0]["gap"] != "tarifa_inactiva_en_uso" {
		t.Fatalf("expected gap tarifa_inactiva_en_uso, got %v", resp[0]["gap"])
	}
	if resp[0]["rate_name"] != "Tarifa Legacy" {
		t.Fatalf("expected rate_name Tarifa Legacy, got %v", resp[0]["rate_name"])
	}
}
