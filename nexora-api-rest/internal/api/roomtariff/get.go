package roomtariff

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Get handles GET /room_tariffs/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomTariffID(r.PathValue("id"))
	if id == "" {
		id = domain.RoomTariffID(r.URL.Query().Get("id"))
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	tariff, err := h.Getter.GetByID(r.Context(), id)
	if err != nil {
		writeRoomTariffError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRoomTariffResponse(tariff))
}
