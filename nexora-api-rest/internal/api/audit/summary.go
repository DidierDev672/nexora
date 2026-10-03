package audit

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// Summary handles GET /audit/summary: the audit dashboard totals.
func (h *Handler) Summary(w http.ResponseWriter, r *http.Request) {
	summary, err := h.Summarizer.Summary(r.Context())
	if err != nil {
		writeAuditError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newSummaryResponse(summary))
}
