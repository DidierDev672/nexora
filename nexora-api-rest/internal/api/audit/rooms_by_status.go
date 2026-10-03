package audit

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// RoomsByStatus handles GET /audit/rooms/by-status/{status}: the auditable
// room inventory filtered by a physical lifecycle state.
func (h *Handler) RoomsByStatus(w http.ResponseWriter, r *http.Request) {
	status := r.PathValue("status")
	if status == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "status is required")
		return
	}

	items, err := h.RoomsByStatusLister.RoomsByStatus(r.Context(), status)
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
