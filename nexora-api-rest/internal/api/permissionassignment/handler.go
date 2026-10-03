package permissionassignment

import (
	"time"

	paapp "nexora-api-rest/internal/application/permissionassignment"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator paapp.PermissionAssignmentCreator
	Lister  paapp.PermissionAssignmentLister
	Getter  paapp.PermissionAssignmentGetter
	Updater paapp.PermissionAssignmentUpdater
	Deleter paapp.PermissionAssignmentDeleter
}

// permissionAssignmentResponse is the HTTP projection of the domain entity.
type permissionAssignmentResponse struct {
	ID                   string    `json:"id"`
	UserID               string    `json:"id_user"`
	HeadquartersID       string    `json:"id_headquarters"`
	SubHeadquartersID    *string   `json:"id_sub_headquarters"`
	ResourceID           *string   `json:"id_resource"`
	PermissionResourceID *string   `json:"id_permission_resource"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

func newPermissionAssignmentResponse(pa domain.PermissionAssignment) permissionAssignmentResponse {
	return permissionAssignmentResponse{
		ID:                   string(pa.ID),
		UserID:               string(pa.UserID),
		HeadquartersID:       string(pa.HeadquartersID),
		SubHeadquartersID:    subRef(pa.SubHeadquartersID),
		ResourceID:           resourceRef(pa.ResourceID),
		PermissionResourceID: permissionResourceRef(pa.PermissionResourceID),
		CreatedAt:            pa.CreatedAt,
		UpdatedAt:            pa.UpdatedAt,
	}
}

func subRef(id *domain.SubHeadquarterID) *string {
	if id == nil {
		return nil
	}
	s := string(*id)
	return &s
}

func resourceRef(id *domain.ResourceID) *string {
	if id == nil {
		return nil
	}
	s := string(*id)
	return &s
}

func permissionResourceRef(id *domain.PermissionResourceID) *string {
	if id == nil {
		return nil
	}
	s := string(*id)
	return &s
}
