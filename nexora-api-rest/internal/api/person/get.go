package person

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Get is the HTTP entry point for retrieving a single person by id.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "person id is required")
		return
	}

	person, err := h.Getter.GetByID(r.Context(), domain.PersonID(id))
	if err != nil {
		if errors.Is(err, domain.ErrPersonNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, "person not found")
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newPersonResponse(person))
}
