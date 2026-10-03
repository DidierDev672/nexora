package auth

import (
	"errors"
	"net/http"
	"strings"

	"nexora-api-rest/internal/api/httpjson"
	authapp "nexora-api-rest/internal/application/auth"
)

// Handler composes the narrow ports expected by the HTTP layer.
type Handler struct {
	Authenticator authapp.Authenticator
}

// credentialsRequest is the payload accepted by POST /login. Validation is
// deliberately limited to presence/format: anything deeper must not leak
// whether the email exists, so it collapses into the generic 401.
type credentialsRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// loginResponse is the success projection: the signed token plus its lifetime
// hint so clients can schedule a silent refresh.
type loginResponse struct {
	Token string `json:"token"`
}

// Login is the HTTP entry point of the "login" slice.
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req credentialsRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "email and password are required")
		return
	}

	token, err := h.Authenticator.Authenticate(r.Context(), authapp.AuthenticateInput{
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		if errors.Is(err, authapp.ErrInvalidCredentials) {
			// Same 401 for unknown email, wrong password and inactive
			// account: the response never reveals which part failed.
			httpjson.WriteError(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, loginResponse{Token: token})
}
