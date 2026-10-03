package roomtariff

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// ListByRoom handles GET /room_tariffs/by-room/{room_id}: it returns the room
// tariffs applied to one room.
func (h *Handler) ListByRoom(w http.ResponseWriter, r *http.Request) {
	roomID := domain.RoomID(r.PathValue("room_id"))
	if roomID == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "room_id is required")
		return
	}

	items, err := h.ByRoom.ListByRoom(r.Context(), roomID)
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
