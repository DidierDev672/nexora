package audit

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// RoomsWithoutTariff handles GET /audit/rooms-without-tariff: the room
// coverage gaps, i.e. rooms with no active tariff assigned.
func (h *Handler) RoomsWithoutTariff(w http.ResponseWriter, r *http.Request) {
	items, err := h.RoomsWithoutTariffLister.RoomsWithoutTariff(r.Context())
	if err != nil {
		writeAuditError(w, err)
		return
	}

	response := make([]auditRoomGapResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newAuditRoomGapResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
