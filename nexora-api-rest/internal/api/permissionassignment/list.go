package permissionassignment

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list permission assignments" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	assignments, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	resp := make([]permissionAssignmentResponse, 0, len(assignments))
	for _, pa := range assignments {
		resp = append(resp, newPermissionAssignmentResponse(pa))
	}
	httpjson.WriteJSON(w, http.StatusOK, resp)
}
