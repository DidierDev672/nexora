package audit

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// Rooms handles GET /audit/rooms: the full auditable room inventory with its
// prevailing default tariff.
func (h *Handler) Rooms(w http.ResponseWriter, r *http.Request) {
	items, err := h.RoomsLister.Rooms(r.Context())
	if err != nil {
		writeAuditError(w, err)
		return
	}

	response := make([]auditRoomResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newAuditRoomResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
