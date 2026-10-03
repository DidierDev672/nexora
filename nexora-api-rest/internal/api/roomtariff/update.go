package roomtariff

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	rtapp "nexora-api-rest/internal/application/roomtariff"
	"nexora-api-rest/internal/domain"
)

type updateRoomTariffRequest struct {
	ID        string `json:"id"`
	RoomID    string `json:"room_id"`
	RateID    string `json:"rate_id"`
	IsDefault bool   `json:"is_default"`
	Status    string `json:"status"`
}

// Update handles PUT /room_tariffs/{id} (and PUT /room_tariffs with id in body).
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomTariffID(r.PathValue("id"))

	var req updateRoomTariffRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if id == "" {
		id = domain.RoomTariffID(req.ID)
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	updated, err := h.Updater.Update(r.Context(), rtapp.UpdateInput{
		ID:        id,
		RoomID:    domain.RoomID(req.RoomID),
		RateID:    domain.RateID(req.RateID),
		IsDefault: req.IsDefault,
		Status:    req.Status,
	})
	if err != nil {
		writeRoomTariffError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRoomTariffResponse(updated))
}
