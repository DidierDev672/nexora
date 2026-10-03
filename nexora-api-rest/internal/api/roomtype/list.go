package roomtype

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list room types" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]roomTypeResponse, 0, len(items))
	for _, rt := range items {
		response = append(response, newRoomTypeResponse(rt))
	}
	httpjson.WriteJSON(w, http.StatusOK, response)
}
