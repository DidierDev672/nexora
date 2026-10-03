package permissionassignment

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// GetPermissionAssignmentUseCase implements the "get permission assignment by id" vertical slice.
type GetPermissionAssignmentUseCase struct {
	repo domain.PermissionAssignmentRepository
}

func NewGetPermissionAssignmentUseCase(repo domain.PermissionAssignmentRepository) *GetPermissionAssignmentUseCase {
	return &GetPermissionAssignmentUseCase{repo: repo}
}

func (uc *GetPermissionAssignmentUseCase) GetByID(ctx context.Context, id domain.PermissionAssignmentID) (domain.PermissionAssignment, error) {
	return uc.repo.FindByID(ctx, id)
}
