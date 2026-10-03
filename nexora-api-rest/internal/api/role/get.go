package role

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Get is the HTTP entry point of the "get role by id" slice.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := domain.RoleID(r.PathValue("id"))

	found, err := h.Getter.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrRoleNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRoleResponse(found))
}
