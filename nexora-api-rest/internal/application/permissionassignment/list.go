package permissionassignment

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListPermissionAssignmentsUseCase implements the "list permission assignments" vertical slice.
type ListPermissionAssignmentsUseCase struct {
	repo domain.PermissionAssignmentRepository
}

func NewListPermissionAssignmentsUseCase(repo domain.PermissionAssignmentRepository) *ListPermissionAssignmentsUseCase {
	return &ListPermissionAssignmentsUseCase{repo: repo}
}

func (uc *ListPermissionAssignmentsUseCase) List(ctx context.Context) ([]domain.PermissionAssignment, error) {
	return uc.repo.FindAll(ctx)
}
