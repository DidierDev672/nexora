package domain

import (
	"errors"
	"time"
)

// ResourceID identifies a resource within the system.
type ResourceID string

// PermissionResourceID identifies a permission-resource within the system.
type PermissionResourceID string

// PermissionAssignmentID identifies a permission assignment within the system.
type PermissionAssignmentID string

// Sentinel errors represent the invariant violations of the permission assignment aggregate.
var (
	ErrPermissionAssignmentNotFound    = errors.New("permission assignment not found")
	ErrInvalidPermissionAssignmentID   = errors.New("permission assignment id must not be empty")
	ErrInvalidPermissionAssignmentUser = errors.New("user id must not be empty")
	ErrInvalidPermissionAssignmentHQ   = errors.New("headquarters id must not be empty")
	ErrInvalidPermissionAssignmentSub  = errors.New("sub_headquarters_id requires headquarters_id")
)

// PermissionAssignment is the core domain entity that assigns permissions
// to a user within a specific headquarters scope. It binds a user to a
// resource with a permission-resource rule.
type PermissionAssignment struct {
	ID                   PermissionAssignmentID
	UserID               UserID
	HeadquartersID       HeadquarterID
	SubHeadquartersID    *SubHeadquarterID
	ResourceID           *ResourceID
	PermissionResourceID *PermissionResourceID
	CreatedAt            time.Time
	UpdatedAt            time.Time
}

// Validate enforces the business invariants of a permission assignment.
func (pa PermissionAssignment) Validate() error {
	switch {
	case pa.ID == "":
		return ErrInvalidPermissionAssignmentID
	case pa.UserID == "":
		return ErrInvalidPermissionAssignmentUser
	case pa.HeadquartersID == "":
		return ErrInvalidPermissionAssignmentHQ
	case pa.SubHeadquartersID != nil && pa.HeadquartersID == "":
		return ErrInvalidPermissionAssignmentSub
	}
	return nil
}

// HasResource reports whether this assignment targets a specific resource.
func (pa PermissionAssignment) HasResource() bool {
	return pa.ResourceID != nil
}

// HasPermissionRule reports whether this assignment has an explicit permission rule.
func (pa PermissionAssignment) HasPermissionRule() bool {
	return pa.PermissionResourceID != nil
}

// UnassignResource removes the resource binding, reverting to a headquarters-scoped assignment.
func (pa *PermissionAssignment) UnassignResource() {
	pa.ResourceID = nil
}

// AssignResource binds the assignment to a specific resource.
func (pa *PermissionAssignment) AssignResource(id ResourceID) {
	pa.ResourceID = &id
}

// RevokePermission removes the explicit permission rule.
func (pa *PermissionAssignment) RevokePermission() {
	pa.PermissionResourceID = nil
}

// AssignPermission binds an explicit permission rule to this assignment.
func (pa *PermissionAssignment) AssignPermission(id PermissionResourceID) {
	pa.PermissionResourceID = &id
}
