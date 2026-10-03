package permissionassignment

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created permission assignments.
type IDProvider interface {
	NewPermissionAssignmentID() domain.PermissionAssignmentID
}

// PermissionAssignmentCreator is the narrow port used by the HTTP layer (ISP).
type PermissionAssignmentCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.PermissionAssignment, error)
}

// PermissionAssignmentLister returns all existing permission assignments.
type PermissionAssignmentLister interface {
	List(ctx context.Context) ([]domain.PermissionAssignment, error)
}

// PermissionAssignmentGetter returns a single permission assignment by id.
type PermissionAssignmentGetter interface {
	GetByID(ctx context.Context, id domain.PermissionAssignmentID) (domain.PermissionAssignment, error)
}

// PermissionAssignmentUpdater edits an existing permission assignment.
type PermissionAssignmentUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.PermissionAssignment, error)
}

// PermissionAssignmentDeleter removes a permission assignment by id.
type PermissionAssignmentDeleter interface {
	Delete(ctx context.Context, id domain.PermissionAssignmentID) error
}
