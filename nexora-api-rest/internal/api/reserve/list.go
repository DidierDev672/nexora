package reserve

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List handles GET /reserve.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]reserveResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newReserveResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
