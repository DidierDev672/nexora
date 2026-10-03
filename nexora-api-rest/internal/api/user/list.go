package user

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list users" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	users, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	resp := make([]userResponse, 0, len(users))
	for _, user := range users {
		resp = append(resp, newUserResponse(user))
	}
	httpjson.WriteJSON(w, http.StatusOK, resp)
}
