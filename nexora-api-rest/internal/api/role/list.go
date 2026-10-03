package role

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list roles" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	roles, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	resp := make([]roleResponse, 0, len(roles))
	for _, role := range roles {
		resp = append(resp, newRoleResponse(role))
	}
	httpjson.WriteJSON(w, http.StatusOK, resp)
}
