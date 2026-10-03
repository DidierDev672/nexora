package rate

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	rateapp "nexora-api-rest/internal/application/rate"
	"nexora-api-rest/internal/domain"
)

type updateRateRequest struct {
	ID               string  `json:"id"`
	Name             string  `json:"name"`
	HeadquarterID    string  `json:"headquarter_id"`
	SubHeadquarterID *string `json:"subheadquarter_id"`
	RoomTypeID       *string `json:"room_type_id"`
	Modality         string  `json:"modality"`
	Price            float64 `json:"price"`
	DurationUnits    int     `json:"duration_units"`
	StartTime        *string `json:"start_time"`
	EndTime          *string `json:"end_time"`
	DaysOfWeek       string  `json:"days_of_week"`
	Status           string  `json:"status"`
}

// Update handles PUT /rates/{id} (and PUT /rates with id in body).
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.RateID(r.PathValue("id"))

	var req updateRateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if id == "" {
		id = domain.RateID(req.ID)
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	updated, err := h.Updater.Update(r.Context(), rateapp.UpdateInput{
		ID:               id,
		Name:             req.Name,
		HeadquarterID:    domain.HeadquarterID(req.HeadquarterID),
		SubHeadquarterID: toSubHeadquarterID(req.SubHeadquarterID),
		RoomTypeID:       toRoomTypeID(req.RoomTypeID),
		Modality:         req.Modality,
		Price:            req.Price,
		DurationUnits:    req.DurationUnits,
		StartTime:        req.StartTime,
		EndTime:          req.EndTime,
		DaysOfWeek:       req.DaysOfWeek,
		Status:           req.Status,
	})
	if err != nil {
		writeRateError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRateResponse(updated))
}
