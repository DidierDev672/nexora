package rate

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Delete handles DELETE /rates/{id} (and DELETE /rates?id=...).
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := domain.RateID(r.PathValue("id"))
	if id == "" {
		id = domain.RateID(r.URL.Query().Get("id"))
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	if err := h.Deleter.Delete(r.Context(), id); err != nil {
		writeRateError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
