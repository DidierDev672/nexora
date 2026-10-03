package bedtype

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a bed type (PUT).
// Only set fields are applied: Name empty, CapacityPeople nil or
// Description nil leave the current value untouched.
type UpdateInput struct {
	ID             domain.BedTypeID
	Name           string
	CapacityPeople *int
	Description    *string
}

// UpdateBedTypeUseCase implements the "update bed type" vertical slice:
// load -> mutate through domain behavior -> uniqueness -> persist.
type UpdateBedTypeUseCase struct {
	repo domain.BedTypeRepository
}

func NewUpdateBedTypeUseCase(repo domain.BedTypeRepository) *UpdateBedTypeUseCase {
	return &UpdateBedTypeUseCase{repo: repo}
}

func (uc *UpdateBedTypeUseCase) Update(ctx context.Context, in UpdateInput) (domain.BedType, error) {
	bedType, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.BedType{}, err
	}

	// Mutate through domain behavior methods so invariants stay intact.
	if in.Name != "" {
		if err := bedType.Rename(in.Name); err != nil {
			return domain.BedType{}, err
		}
	}
	if in.CapacityPeople != nil {
		if err := bedType.ChangeCapacity(*in.CapacityPeople); err != nil {
			return domain.BedType{}, err
		}
	}
	if in.Description != nil {
		bedType.SetDescription(*in.Description)
	}

	if err := assertUniqueName(ctx, uc.repo, bedType.ID, bedType.Name); err != nil {
		return domain.BedType{}, err
	}
	bedType.UpdatedAt = time.Now().UTC()
	if err := uc.repo.Update(ctx, bedType); err != nil {
		return domain.BedType{}, err
	}
	// Re-fetch so updated_at matches the database clock.
	return uc.repo.FindByID(ctx, bedType.ID)
}
