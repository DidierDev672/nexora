package subheadquarter

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list sub headquarters" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	subHeadquarters, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	resp := make([]subHeadquarterResponse, 0, len(subHeadquarters))
	for _, sub := range subHeadquarters {
		resp = append(resp, newSubHeadquarterResponse(sub))
	}
	httpjson.WriteJSON(w, http.StatusOK, resp)
}
