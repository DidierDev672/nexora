package bedtype

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a bed type.
type CreateInput struct {
	Name           string
	CapacityPeople int
	Description    string
	CreatedBy      string
}

// CreateBedTypeUseCase implements the "create bed type" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateBedTypeUseCase struct {
	repo       domain.BedTypeRepository
	idProvider IDProvider
}

func NewCreateBedTypeUseCase(repo domain.BedTypeRepository, idProvider IDProvider) *CreateBedTypeUseCase {
	return &CreateBedTypeUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateBedTypeUseCase) Create(ctx context.Context, in CreateInput) (domain.BedType, error) {
	capacity, err := domain.NewCapacityPeople(in.CapacityPeople)
	if err != nil {
		return domain.BedType{}, err
	}
	bedType, err := domain.NewBedType(
		uc.idProvider.NewBedTypeID(),
		in.Name,
		capacity,
		in.Description,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.BedType{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, bedType.ID, bedType.Name); err != nil {
		return domain.BedType{}, err
	}
	if err := uc.repo.Save(ctx, bedType); err != nil {
		return domain.BedType{}, err
	}
	// Re-fetch so created_at/updated_at match the database clock.
	return uc.repo.FindByID(ctx, bedType.ID)
}
