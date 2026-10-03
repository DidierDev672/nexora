package user

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	userapp "nexora-api-rest/internal/application/user"
	"nexora-api-rest/internal/domain"
)

// updateUserRequest is the payload accepted by PUT /users/{id} (full replace).
// password is optional: an empty value keeps the current hash.
type updateUserRequest struct {
	Name              string  `json:"name"`
	Email             string  `json:"email"`
	Password          string  `json:"password"`
	RoleID            string  `json:"role_id"`
	HeadquartersID    *string `json:"headquarters_id"`
	SubHeadquartersID *string `json:"sub_headquarters_id"`
	Status            string  `json:"status"`
}

// Update is the HTTP entry point of the "update user" slice.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.UserID(r.PathValue("id"))

	var req updateUserRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), userapp.UpdateInput{
		ID:                id,
		Name:              req.Name,
		Email:             req.Email,
		Password:          req.Password,
		RoleID:            domain.RoleID(req.RoleID),
		HeadquartersID:    optionalHeadquarterID(req.HeadquartersID),
		SubHeadquartersID: optionalSubHeadquarterID(req.SubHeadquartersID),
		Status:            req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrUserNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrUserDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newUserResponse(updated))
}
