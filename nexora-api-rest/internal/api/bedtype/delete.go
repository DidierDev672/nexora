package bedtype

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Delete is the HTTP entry point of the "delete bed type" slice.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := domain.BedTypeID(r.PathValue("id"))

	if err := h.Deleter.Delete(r.Context(), id); err != nil {
		if errors.Is(err, domain.ErrBedTypeNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
