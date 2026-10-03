package roomtariff

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List handles GET /room_tariffs.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		writeRoomTariffError(w, err)
		return
	}

	response := make([]roomTariffResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newRoomTariffResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
