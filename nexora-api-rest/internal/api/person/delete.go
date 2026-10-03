package person

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Delete is the HTTP entry point for removing a person.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "person id is required")
		return
	}

	if err := h.Deleter.Delete(r.Context(), domain.PersonID(id)); err != nil {
		if errors.Is(err, domain.ErrPersonNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, "person not found")
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
