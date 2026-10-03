package subheadquarter

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// ListByHeadquarter is the HTTP entry point of the
// "list sub headquarters by headquarter" slice.
func (h *Handler) ListByHeadquarter(w http.ResponseWriter, r *http.Request) {
	id := domain.HeadquarterID(r.PathValue("id_headquarters"))

	subHeadquarters, err := h.ByHeadquarter.ListByHeadquarter(r.Context(), id)
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
