package audit

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// Rates handles GET /audit/rates: the audited rate catalog for pricing control.
func (h *Handler) Rates(w http.ResponseWriter, r *http.Request) {
	items, err := h.RatesLister.Rates(r.Context())
	if err != nil {
		writeAuditError(w, err)
		return
	}

	response := make([]rateResponse, 0, len(items))
	for _, item := range items {
		response = append(response, newRateResponse(item))
	}

	httpjson.WriteJSON(w, http.StatusOK, response)
}
