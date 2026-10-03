package bed

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a bed (PUT, full replace).
// An empty status means "active".
type UpdateInput struct {
	ID         domain.BedID
	RoomID     domain.RoomID
	TypesBedID []domain.BedTypeID
	Etiquette  string
	Status     string
}

// UpdateBedUseCase implements the "update bed" vertical slice:
// load -> mutate through domain behavior -> uniqueness -> persist.
type UpdateBedUseCase struct {
	repo domain.BedRepository
}

func NewUpdateBedUseCase(repo domain.BedRepository) *UpdateBedUseCase {
	return &UpdateBedUseCase{repo: repo}
}

func (uc *UpdateBedUseCase) Update(ctx context.Context, in UpdateInput) (domain.Bed, error) {
	bed, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Bed{}, err
	}

	// Mutate through domain behavior methods so invariants stay intact.
	if err := bed.ReassignRoom(in.RoomID); err != nil {
		return domain.Bed{}, err
	}
	if err := bed.ReassignBedType(in.TypesBedID); err != nil {
		return domain.Bed{}, err
	}
	if err := bed.ChangeEtiquette(in.Etiquette); err != nil {
		return domain.Bed{}, err
	}

	// Mirror create: an empty status means "active" instead of being
	// rejected by ChangeStatus (ParseBedStatus("") is an error).
	status := in.Status
	if status == "" {
		status = string(domain.BedStatusActive)
	}
	if err := bed.ChangeStatus(status); err != nil {
		return domain.Bed{}, err
	}

	if err := assertUniqueEtiquette(ctx, uc.repo, bed.ID, bed.Etiquette, bed.RoomID); err != nil {
		return domain.Bed{}, err
	}
	bed.UpdatedAt = time.Now().UTC()
	if err := uc.repo.Update(ctx, bed); err != nil {
		return domain.Bed{}, err
	}
	// Re-fetch so updated_at matches the database clock.
	return uc.repo.FindByID(ctx, bed.ID)
}
