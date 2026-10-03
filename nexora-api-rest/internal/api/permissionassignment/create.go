package permissionassignment

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	paapp "nexora-api-rest/internal/application/permissionassignment"
	"nexora-api-rest/internal/domain"
)

// Create is the HTTP entry point of the "create permission assignment" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createAssignmentRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), paapp.CreateInput{
		UserID:               domain.UserID(req.UserID),
		HeadquartersID:       domain.HeadquarterID(req.HeadquartersID),
		SubHeadquartersID:    optionalSubHeadquarterID(req.SubHeadquartersID),
		ResourceID:           optionalResourceID(req.ResourceID),
		PermissionResourceID: optionalPermissionResourceID(req.PermissionResourceID),
	})
	if err != nil {
		if isValidationError(err) {
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newPermissionAssignmentResponse(created))
}

// isValidationError reports whether err is a domain invariant violation.
func isValidationError(err error) bool {
	switch {
	case errors.Is(err, domain.ErrInvalidPermissionAssignmentID),
		errors.Is(err, domain.ErrInvalidPermissionAssignmentUser),
		errors.Is(err, domain.ErrInvalidPermissionAssignmentHQ),
		errors.Is(err, domain.ErrInvalidPermissionAssignmentSub):
		return true
	default:
		return false
	}
}
