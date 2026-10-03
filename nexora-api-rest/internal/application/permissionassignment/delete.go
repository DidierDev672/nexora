package permissionassignment

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// DeletePermissionAssignmentUseCase implements the "delete permission assignment" vertical slice.
type DeletePermissionAssignmentUseCase struct {
	repo domain.PermissionAssignmentRepository
}

func NewDeletePermissionAssignmentUseCase(repo domain.PermissionAssignmentRepository) *DeletePermissionAssignmentUseCase {
	return &DeletePermissionAssignmentUseCase{repo: repo}
}

func (uc *DeletePermissionAssignmentUseCase) Delete(ctx context.Context, id domain.PermissionAssignmentID) error {
	return uc.repo.Delete(ctx, id)
}
