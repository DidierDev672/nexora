package domain

import "context"

// PermissionAssignmentRepository is the persistence port (DIP: defined in domain,
// implemented by the infrastructure layer).
type PermissionAssignmentRepository interface {
	FindAll(ctx context.Context) ([]PermissionAssignment, error)
	FindByID(ctx context.Context, id PermissionAssignmentID) (PermissionAssignment, error)
	FindByUser(ctx context.Context, userID UserID) ([]PermissionAssignment, error)
	FindByHeadquarter(ctx context.Context, headquarterID HeadquarterID) ([]PermissionAssignment, error)
	Save(ctx context.Context, assignment PermissionAssignment) error
	Update(ctx context.Context, assignment PermissionAssignment) error
	Delete(ctx context.Context, id PermissionAssignmentID) error
}
