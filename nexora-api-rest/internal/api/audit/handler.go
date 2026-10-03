package audit

import (
	"errors"
	"net/http"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	auditapp "nexora-api-rest/internal/application/audit"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow read-only use-case ports expected by the audit
// HTTP layer (ISP). The audit slice never mutates the inventory.
type Handler struct {
	Summarizer               auditapp.SummaryProvider
	RoomsLister              auditapp.RoomsProvider
	RoomsByStatusLister      auditapp.RoomsByStatusProvider
	RatesLister              auditapp.RatesProvider
	RoomsWithoutTariffLister auditapp.RoomsWithoutTariffProvider
	InactiveTariffsInUseList auditapp.InactiveTariffsInUseProvider
}

// entityCountResponse is the JSON projection of an active/inactive count.
type entityCountResponse struct {
	Total    int `json:"total"`
	Active   int `json:"active"`
	Inactive int `json:"inactive"`
}

// buildingCountResponse is the JSON projection of a building count.
type buildingCountResponse struct {
	Total       int `json:"total"`
	Available   int `json:"available"`
	Busy        int `json:"busy"`
	Maintenance int `json:"maintenance"`
	Cleaning    int `json:"cleaning"`
	Inactive    int `json:"inactive"`
	Occupied    int `json:"occupied"`
}

// roomCountResponse is the JSON projection of a room count.
type roomCountResponse struct {
	Total       int `json:"total"`
	Available   int `json:"available"`
	Busy        int `json:"busy"`
	Maintenance int `json:"maintenance"`
	Cleaning    int `json:"cleaning"`
	Inactive    int `json:"inactive"`
}

// roomTariffCountResponse is the JSON projection of a room tariff count.
type roomTariffCountResponse struct {
	Total    int `json:"total"`
	Active   int `json:"active"`
	Inactive int `json:"inactive"`
	Defaults int `json:"defaults"`
}

// summaryResponse is the JSON projection of the audit dashboard.
type summaryResponse struct {
	Buildings       buildingCountResponse   `json:"buildings"`
	Rooms           roomCountResponse       `json:"rooms"`
	BedTypes        entityCountResponse     `json:"bed_types"`
	Headquarters    entityCountResponse     `json:"headquarters"`
	SubHeadquarters entityCountResponse     `json:"sub_headquarters"`
	Rates           entityCountResponse     `json:"rates"`
	RoomTariffs     roomTariffCountResponse `json:"room_tariffs"`
}

// auditRoomResponse is the JSON projection of an audited room: its physical
// state plus the prevailing default tariff (both null when unassigned).
type auditRoomResponse struct {
	ID              string   `json:"id"`
	Number          string   `json:"number"`
	Floor           int      `json:"floor"`
	RoomTypesID     string   `json:"room_types_id"`
	BuildingID      string   `json:"building_id"`
	HeadquartersID  string   `json:"headquarters_id"`
	Status          string   `json:"status"`
	DefaultTariffID *string  `json:"default_tariff_id"`
	RateID          *string  `json:"rate_id"`
	Price           *float64 `json:"price"`
}

// auditRoomGapResponse is the JSON projection of a room coverage gap.
type auditRoomGapResponse struct {
	ID             string `json:"id"`
	Number         string `json:"number"`
	Floor          int    `json:"floor"`
	RoomTypesID    string `json:"room_types_id"`
	BuildingID     string `json:"building_id"`
	HeadquartersID string `json:"headquarters_id"`
	Status         string `json:"status"`
	Gap            string `json:"gap"`
}

// inactiveTariffInUseResponse is the JSON projection of a pricing consistency
// breach: an active assignment pointing at an inactive rate.
type inactiveTariffInUseResponse struct {
	ID        string  `json:"id"`
	RoomID    string  `json:"room_id"`
	RateID    string  `json:"rate_id"`
	RateName  string  `json:"rate_name"`
	RatePrice float64 `json:"rate_price"`
	IsDefault bool    `json:"is_default"`
	Gap       string  `json:"gap"`
}

// rateResponse is the JSON projection of an audited rate.
type rateResponse struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	HeadquarterID    string    `json:"headquarter_id"`
	SubHeadquarterID *string   `json:"subheadquarter_id"`
	RoomTypeID       *string   `json:"room_type_id"`
	Modality         string    `json:"modality"`
	Price            float64   `json:"price"`
	DurationUnits    int       `json:"duration_units"`
	StartTime        *string   `json:"start_time"`
	EndTime          *string   `json:"end_time"`
	DaysOfWeek       string    `json:"days_of_week"`
	Status           string    `json:"status"`
	CreatedBy        string    `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func newSummaryResponse(s domain.AuditSummary) summaryResponse {
	return summaryResponse{
		Buildings: buildingCountResponse{
			Total:       s.Buildings.Total,
			Available:   s.Buildings.Available,
			Busy:        s.Buildings.Busy,
			Maintenance: s.Buildings.Maintenance,
			Cleaning:    s.Buildings.Cleaning,
			Inactive:    s.Buildings.Inactive,
			Occupied:    s.Buildings.Occupied,
		},
		Rooms: roomCountResponse{
			Total:       s.Rooms.Total,
			Available:   s.Rooms.Available,
			Busy:        s.Rooms.Busy,
			Maintenance: s.Rooms.Maintenance,
			Cleaning:    s.Rooms.Cleaning,
			Inactive:    s.Rooms.Inactive,
		},
		BedTypes: entityCountResponse{Total: s.BedTypes.Total},
		Headquarters: entityCountResponse{
			Total:    s.Headquarters.Total,
			Active:   s.Headquarters.Active,
			Inactive: s.Headquarters.Inactive,
		},
		SubHeadquarters: entityCountResponse{
			Total:    s.SubHeadquarters.Total,
			Active:   s.SubHeadquarters.Active,
			Inactive: s.SubHeadquarters.Inactive,
		},
		Rates: entityCountResponse{
			Total:    s.Rates.Total,
			Active:   s.Rates.Active,
			Inactive: s.Rates.Inactive,
		},
		RoomTariffs: roomTariffCountResponse{
			Total:    s.RoomTariffs.Total,
			Active:   s.RoomTariffs.Active,
			Inactive: s.RoomTariffs.Inactive,
			Defaults: s.RoomTariffs.Defaults,
		},
	}
}

func newAuditRoomResponse(r domain.AuditRoom) auditRoomResponse {
	var tariffID, rateID *string
	var price *float64
	if r.DefaultTariffID != nil {
		id := string(*r.DefaultTariffID)
		tariffID = &id
	}
	if r.RateID != nil {
		id := string(*r.RateID)
		rateID = &id
	}
	if r.Price != nil {
		p := float64(*r.Price)
		price = &p
	}

	return auditRoomResponse{
		ID:              string(r.ID),
		Number:          r.Number,
		Floor:           r.Floor,
		RoomTypesID:     string(r.RoomTypeID),
		BuildingID:      string(r.BuildingID),
		HeadquartersID:  string(r.HeadquartersID),
		Status:          string(r.Status),
		DefaultTariffID: tariffID,
		RateID:          rateID,
		Price:           price,
	}
}

func newAuditRoomGapResponse(g domain.AuditRoomGap) auditRoomGapResponse {
	return auditRoomGapResponse{
		ID:             string(g.ID),
		Number:         g.Number,
		Floor:          g.Floor,
		RoomTypesID:    string(g.RoomTypeID),
		BuildingID:     string(g.BuildingID),
		HeadquartersID: string(g.HeadquartersID),
		Status:         string(g.Status),
		Gap:            "sin_tarifa_aplicada_activa",
	}
}

func newInactiveTariffInUseResponse(b domain.InactiveTariffInUse) inactiveTariffInUseResponse {
	return inactiveTariffInUseResponse{
		ID:        string(b.ID),
		RoomID:    string(b.RoomID),
		RateID:    string(b.RateID),
		RateName:  b.RateName,
		RatePrice: float64(b.RatePrice),
		IsDefault: b.IsDefault,
		Gap:       "tarifa_inactiva_en_uso",
	}
}

func newRateResponse(r domain.Rate) rateResponse {
	response := rateResponse{
		ID:            string(r.ID),
		Name:          r.Name,
		HeadquarterID: string(r.HeadquarterID),
		Modality:      string(r.Modality),
		Price:         float64(r.Price),
		DurationUnits: r.DurationUnits,
		StartTime:     r.StartTime,
		EndTime:       r.EndTime,
		DaysOfWeek:    r.DaysOfWeek,
		Status:        string(r.Status),
		CreatedBy:     r.CreatedBy,
		CreatedAt:     r.CreatedAt,
		UpdatedAt:     r.UpdatedAt,
	}

	if r.SubHeadquarterID != nil {
		id := string(*r.SubHeadquarterID)
		response.SubHeadquarterID = &id
	}
	if r.RoomTypeID != nil {
		id := string(*r.RoomTypeID)
		response.RoomTypeID = &id
	}

	return response
}

// writeAuditError translates a read-only audit failure into an HTTP status: a
// rejected state filter is a 400 and anything else is an opaque 500 so the
// internal query details never leak to the client.
func writeAuditError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrInvalidRoomStatus):
		httpjson.WriteError(w, http.StatusBadRequest, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
