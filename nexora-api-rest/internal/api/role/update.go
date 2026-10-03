package role

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	roleapp "nexora-api-rest/internal/application/role"
	"nexora-api-rest/internal/domain"
)

type updateRoleRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Update is the HTTP entry point of the "update role" slice.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.RoleID(r.PathValue("id"))

	var req updateRoleRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), roleapp.UpdateInput{
		ID:          id,
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrRoleNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidRole):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrRoleDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRoleResponse(updated))
}
