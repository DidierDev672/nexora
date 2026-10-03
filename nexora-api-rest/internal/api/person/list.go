package person

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point for listing persons.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	persons, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	res := make([]personResponse, 0, len(persons))
	for _, p := range persons {
		res = append(res, newPersonResponse(p))
	}

	httpjson.WriteJSON(w, http.StatusOK, res)
}
