package roomtariff

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	rtapp "nexora-api-rest/internal/application/roomtariff"
	"nexora-api-rest/internal/domain"
)

type createRoomTariffRequest struct {
	RoomID    string `json:"room_id"`
	RateID    string `json:"rate_id"`
	IsDefault bool   `json:"is_default"`
	Status    string `json:"status"`
	CreatedBy string `json:"created_by"`
}

// Create handles POST /room_tariffs (and POST /room_tariff).
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createRoomTariffRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), rtapp.CreateInput{
		RoomID:    domain.RoomID(req.RoomID),
		RateID:    domain.RateID(req.RateID),
		IsDefault: req.IsDefault,
		Status:    req.Status,
		CreatedBy: req.CreatedBy,
	})
	if err != nil {
		writeRoomTariffError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newRoomTariffResponse(created))
}
