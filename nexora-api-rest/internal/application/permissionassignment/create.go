package permissionassignment

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a permission assignment.
type CreateInput struct {
	UserID               domain.UserID
	HeadquartersID       domain.HeadquarterID
	SubHeadquartersID    *domain.SubHeadquarterID
	ResourceID           *domain.ResourceID
	PermissionResourceID *domain.PermissionResourceID
}

// CreatePermissionAssignmentUseCase implements the "create permission assignment"
// vertical slice: default id/audit -> validate invariants -> persist.
// One responsibility.
type CreatePermissionAssignmentUseCase struct {
	repo       domain.PermissionAssignmentRepository
	idProvider IDProvider
}

func NewCreatePermissionAssignmentUseCase(repo domain.PermissionAssignmentRepository, idProvider IDProvider) *CreatePermissionAssignmentUseCase {
	return &CreatePermissionAssignmentUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreatePermissionAssignmentUseCase) Create(ctx context.Context, in CreateInput) (domain.PermissionAssignment, error) {
	now := time.Now()
	assignment := domain.PermissionAssignment{
		ID:                   uc.idProvider.NewPermissionAssignmentID(),
		UserID:               in.UserID,
		HeadquartersID:       in.HeadquartersID,
		SubHeadquartersID:    in.SubHeadquartersID,
		ResourceID:           in.ResourceID,
		PermissionResourceID: in.PermissionResourceID,
		CreatedAt:            now,
		UpdatedAt:            now,
	}
	if err := assignment.Validate(); err != nil {
		return domain.PermissionAssignment{}, err
	}
	if err := uc.repo.Save(ctx, assignment); err != nil {
		return domain.PermissionAssignment{}, err
	}
	return uc.repo.FindByID(ctx, assignment.ID)
}
