package rate

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Get handles GET /rates/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := domain.RateID(r.PathValue("id"))
	if id == "" {
		id = domain.RateID(r.URL.Query().Get("id"))
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	rate, err := h.Getter.GetByID(r.Context(), id)
	if err != nil {
		writeRateError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRateResponse(rate))
}
