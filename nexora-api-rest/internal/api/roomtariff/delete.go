package roomtariff

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Delete handles DELETE /room_tariffs/{id} (and DELETE /room_tariffs?id=...).
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomTariffID(r.PathValue("id"))
	if id == "" {
		id = domain.RoomTariffID(r.URL.Query().Get("id"))
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	if err := h.Deleter.Delete(r.Context(), id); err != nil {
		writeRoomTariffError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
