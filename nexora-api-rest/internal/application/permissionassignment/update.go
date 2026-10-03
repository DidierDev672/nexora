package permissionassignment

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a permission assignment
// (PUT semantics: all business fields are replaced).
type UpdateInput struct {
	ID                   domain.PermissionAssignmentID
	UserID               domain.UserID
	HeadquartersID       domain.HeadquarterID
	SubHeadquartersID    *domain.SubHeadquarterID
	ResourceID           *domain.ResourceID
	PermissionResourceID *domain.PermissionResourceID
}

// UpdatePermissionAssignmentUseCase implements the "update permission assignment" vertical slice.
type UpdatePermissionAssignmentUseCase struct {
	repo domain.PermissionAssignmentRepository
}

func NewUpdatePermissionAssignmentUseCase(repo domain.PermissionAssignmentRepository) *UpdatePermissionAssignmentUseCase {
	return &UpdatePermissionAssignmentUseCase{repo: repo}
}

func (uc *UpdatePermissionAssignmentUseCase) Update(ctx context.Context, in UpdateInput) (domain.PermissionAssignment, error) {
	assignment, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.PermissionAssignment{}, err
	}

	assignment.UserID = in.UserID
	assignment.HeadquartersID = in.HeadquartersID
	assignment.SubHeadquartersID = in.SubHeadquartersID
	assignment.ResourceID = in.ResourceID
	assignment.PermissionResourceID = in.PermissionResourceID
	assignment.UpdatedAt = time.Now()

	if err := assignment.Validate(); err != nil {
		return domain.PermissionAssignment{}, err
	}
	if err := uc.repo.Update(ctx, assignment); err != nil {
		return domain.PermissionAssignment{}, err
	}
	return uc.repo.FindByID(ctx, assignment.ID)
}
