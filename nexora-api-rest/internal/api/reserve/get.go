package reserve

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Get handles GET /reserve/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := domain.ReserveID(r.PathValue("id"))
	if id == "" {
		id = domain.ReserveID(r.URL.Query().Get("id"))
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	reserve, err := h.Getter.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrReserveNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newReserveResponse(reserve))
}
