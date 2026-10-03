package role

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	roleapp "nexora-api-rest/internal/application/role"
	"nexora-api-rest/internal/domain"
)

type createRoleRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

// Create is the HTTP entry point of the "create role" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createRoleRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), roleapp.CreateInput{
		Name:        req.Name,
		Description: req.Description,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidRole):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrRoleDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newRoleResponse(created))
}
