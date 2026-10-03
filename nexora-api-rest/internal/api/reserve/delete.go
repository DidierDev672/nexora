package reserve

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Delete handles DELETE /reserve/{id} (and DELETE /reserve?id=...).
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := domain.ReserveID(r.PathValue("id"))
	if id == "" {
		id = domain.ReserveID(r.URL.Query().Get("id"))
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	if err := h.Deleter.Delete(r.Context(), id); err != nil {
		if errors.Is(err, domain.ErrReserveNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
