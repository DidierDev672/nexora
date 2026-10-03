package building

import (
	"net/http"
	"strings"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// toSubHeadquarterID adapts an optional HTTP value into the nullable domain
// type. An empty string is treated as "not assigned" instead of a broken FK.
func toSubHeadquarterID(raw *string) *domain.SubHeadquarterID {
	if raw == nil || strings.TrimSpace(*raw) == "" {
		return nil
	}
	id := domain.SubHeadquarterID(*raw)
	return &id
}

// List is the HTTP entry point of the "list buildings" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	items, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]buildingResponse, 0, len(items))
	for _, building := range items {
		response = append(response, newBuildingResponse(building))
	}
	httpjson.WriteJSON(w, http.StatusOK, response)
}
