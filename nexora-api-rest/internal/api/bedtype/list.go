package bedtype

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list bed types" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]bedTypeResponse, 0, len(items))
	for _, bt := range items {
		response = append(response, newBedTypeResponse(bt))
	}
	httpjson.WriteJSON(w, http.StatusOK, response)
}
