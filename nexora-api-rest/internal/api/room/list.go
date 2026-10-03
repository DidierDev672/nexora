package room

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// toBasePrice adapts an optional HTTP value into the nullable domain value
// object.
func toBasePrice(raw *float64) *domain.BasePrice {
	if raw == nil {
		return nil
	}
	price := domain.BasePrice(*raw)
	return &price
}

// List is the HTTP entry point of the "list rooms" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]roomResponse, 0, len(items))
	for _, room := range items {
		response = append(response, newRoomResponse(room))
	}
	httpjson.WriteJSON(w, http.StatusOK, response)
}
