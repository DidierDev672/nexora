package headquarter

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list headquarters" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	headquarters, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	resp := make([]headquarterResponse, 0, len(headquarters))
	for _, hq := range headquarters {
		resp = append(resp, newHeadquarterResponse(hq))
	}
	httpjson.WriteJSON(w, http.StatusOK, resp)
}
