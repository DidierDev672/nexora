package building

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Get is the HTTP entry point of the "get building by id" slice.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := domain.BuildingID(r.PathValue("id"))

	item, err := h.Getter.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrBuildingNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newBuildingResponse(item))
}
