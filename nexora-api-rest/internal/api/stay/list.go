package stay

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List handles GET /stays.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]stayResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newStayResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
