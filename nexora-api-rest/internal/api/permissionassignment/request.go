package permissionassignment

import (
	"strings"

	"nexora-api-rest/internal/domain"
)

// createAssignmentRequest is the payload accepted by POST /permission-assignment.
// id_sub_headquarters, id_resource and id_permission_resource are optional:
// null and "" both mean "not assigned".
type createAssignmentRequest struct {
	UserID               string  `json:"id_user"`
	HeadquartersID       string  `json:"id_headquarters"`
	SubHeadquartersID    *string `json:"id_sub_headquarters"`
	ResourceID           *string `json:"id_resource"`
	PermissionResourceID *string `json:"id_permission_resource"`
}

// updateAssignmentRequest is the payload accepted by PUT /permission-assignment/{id}
// (full replace of the business fields).
type updateAssignmentRequest struct {
	UserID               string  `json:"id_user"`
	HeadquartersID       string  `json:"id_headquarters"`
	SubHeadquartersID    *string `json:"id_sub_headquarters"`
	ResourceID           *string `json:"id_resource"`
	PermissionResourceID *string `json:"id_permission_resource"`
}

func optionalResourceID(v *string) *domain.ResourceID {
	id := strings.TrimSpace(deref(v))
	if id == "" {
		return nil
	}
	r := domain.ResourceID(id)
	return &r
}

func optionalPermissionResourceID(v *string) *domain.PermissionResourceID {
	id := strings.TrimSpace(deref(v))
	if id == "" {
		return nil
	}
	p := domain.PermissionResourceID(id)
	return &p
}

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
