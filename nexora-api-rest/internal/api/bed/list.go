package bed

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list beds" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]bedResponse, 0, len(items))
	for _, b := range items {
		response = append(response, newBedResponse(b))
	}
	httpjson.WriteJSON(w, http.StatusOK, response)
}
