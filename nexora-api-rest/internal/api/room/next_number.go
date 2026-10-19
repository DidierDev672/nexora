package room

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// nextNumberResponse is the HTTP projection of the next consecutive room
// number.
type nextNumberResponse struct {
	NextNumber string `json:"next_number"`
}

// NextNumber handles GET /room/next-number: the next consecutive room number
// across the whole inventory (max trailing digits + 1).
func (h *Handler) NextNumber(w http.ResponseWriter, r *http.Request) {
	next, err := h.NextNumberGetter.NextNumber(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, nextNumberResponse{NextNumber: next})
}
