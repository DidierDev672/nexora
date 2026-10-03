package user

import (
	"errors"
	"net/http"
	"strings"

	"nexora-api-rest/internal/api/httpjson"
	userapp "nexora-api-rest/internal/application/user"
	"nexora-api-rest/internal/domain"
)

// createUserRequest is the payload accepted by POST /users. headquarters_id,
// sub_headquarters_id, status and created_by are optional (created_by defaults
// to "user_system").
type createUserRequest struct {
	Name              string  `json:"name"`
	Email             string  `json:"email"`
	Password          string  `json:"password"`
	RoleID            string  `json:"role_id"`
	HeadquartersID    *string `json:"headquarters_id"`
	SubHeadquartersID *string `json:"sub_headquarters_id"`
	Status            string  `json:"status"`
	CreatedBy         string  `json:"created_by"`
}

// Create is the HTTP entry point of the "create user" slice. It maps the raw
// request onto the application input and translates domain errors to HTTP codes:
// 400 (bad body), 422 (invariants), 409 (duplicated email), 500 (unexpected).
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createUserRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), userapp.CreateInput{
		Name:              req.Name,
		Email:             req.Email,
		Password:          req.Password,
		RoleID:            domain.RoleID(req.RoleID),
		HeadquartersID:    optionalHeadquarterID(req.HeadquartersID),
		SubHeadquartersID: optionalSubHeadquarterID(req.SubHeadquartersID),
		Status:            req.Status,
		CreatedBy:         req.CreatedBy,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newUserResponse(created))
}

// optionalHeadquarterID converts an optional string from the request into an
// optional domain headquarter id. Both null and "" mean "not assigned", so a
// client that sends empty strings for unselected fields does not trip an FK
// error downstream.
func optionalHeadquarterID(v *string) *domain.HeadquarterID {
	id := strings.TrimSpace(deref(v))
	if id == "" {
		return nil
	}
	hq := domain.HeadquarterID(id)
	return &hq
}

// optionalSubHeadquarterID converts an optional string from the request into an
// optional domain sub headquarter id (null/"" -> not assigned).
func optionalSubHeadquarterID(v *string) *domain.SubHeadquarterID {
	id := strings.TrimSpace(deref(v))
	if id == "" {
		return nil
	}
	sub := domain.SubHeadquarterID(id)
	return &sub
}

func deref(v *string) string {
	if v == nil {
		return ""
	}
	return *v
}

// isValidationError reports whether err is a domain invariant violation.
func isValidationError(err error) bool {
	switch {
	case errors.Is(err, domain.ErrInvalidUserName),
		errors.Is(err, domain.ErrInvalidUserEmail),
		errors.Is(err, domain.ErrInvalidUserPassword),
		errors.Is(err, domain.ErrInvalidUserRoleID),
		errors.Is(err, domain.ErrInvalidUserSubUnit),
		errors.Is(err, domain.ErrInvalidUserReference),
		errors.Is(err, domain.ErrInvalidUserRoleRef),
		errors.Is(err, domain.ErrInvalidUserHeadquarterRef),
		errors.Is(err, domain.ErrInvalidUserSubHeadquarterRef),
		errors.Is(err, domain.ErrInvalidUserStatus):
		return true
	default:
		return false
	}
}
