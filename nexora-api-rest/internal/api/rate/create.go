package rate

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	rateapp "nexora-api-rest/internal/application/rate"
	"nexora-api-rest/internal/domain"
)

type createRateRequest struct {
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
	CreatedBy        string  `json:"created_by"`
}

// Create handles POST /rates (and POST /rate).
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createRateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), rateapp.CreateInput{
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
		CreatedBy:        req.CreatedBy,
	})
	if err != nil {
		writeRateError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newRateResponse(created))
}

func toSubHeadquarterID(value *string) *domain.SubHeadquarterID {
	if value == nil || *value == "" {
		return nil
	}
	id := domain.SubHeadquarterID(*value)
	return &id
}

func toRoomTypeID(value *string) *domain.RoomTypeID {
	if value == nil || *value == "" {
		return nil
	}
	id := domain.RoomTypeID(*value)
	return &id
}
