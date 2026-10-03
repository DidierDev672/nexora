package permissionassignment

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	paapp "nexora-api-rest/internal/application/permissionassignment"
	"nexora-api-rest/internal/domain"
)

// Update is the HTTP entry point of the "update permission assignment" slice.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.PermissionAssignmentID(r.PathValue("id"))

	var req updateAssignmentRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), paapp.UpdateInput{
		ID:                   id,
		UserID:               domain.UserID(req.UserID),
		HeadquartersID:       domain.HeadquarterID(req.HeadquartersID),
		SubHeadquartersID:    optionalSubHeadquarterID(req.SubHeadquartersID),
		ResourceID:           optionalResourceID(req.ResourceID),
		PermissionResourceID: optionalPermissionResourceID(req.PermissionResourceID),
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPermissionAssignmentNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newPermissionAssignmentResponse(updated))
}
