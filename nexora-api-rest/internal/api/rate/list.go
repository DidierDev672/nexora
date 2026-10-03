package rate

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// List handles GET /rates with optional query filters: headquarter_id,
// subheadquarter_id, room_type_id, modality and status.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	filter := domain.RateFilter{}

	if value := query.Get("headquarter_id"); value != "" {
		id := domain.HeadquarterID(value)
		filter.HeadquarterID = &id
	}
	if value := query.Get("subheadquarter_id"); value != "" {
		id := domain.SubHeadquarterID(value)
		filter.SubHeadquarterID = &id
	}
	if value := query.Get("room_type_id"); value != "" {
		id := domain.RoomTypeID(value)
		filter.RoomTypeID = &id
	}
	if value := query.Get("modality"); value != "" {
		modality, err := domain.ParseRateModality(value)
		if err != nil {
			httpjson.WriteError(w, http.StatusBadRequest, err.Error())
			return
		}
		filter.Modality = &modality
	}
	if value := query.Get("status"); value != "" {
		status, err := domain.ParseRateStatus(value)
		if err != nil {
			httpjson.WriteError(w, http.StatusBadRequest, err.Error())
			return
		}
		filter.Status = &status
	}

	items, err := h.Lister.List(r.Context(), filter)
	if err != nil {
		writeRateError(w, err)
		return
	}

	response := make([]rateResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newRateResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
