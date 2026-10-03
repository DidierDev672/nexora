package bed

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a bed. Status defaults to
// active when empty.
type CreateInput struct {
	RoomID     domain.RoomID
	TypesBedID []domain.BedTypeID
	Etiquette  string
	Status     string
	CreatedBy  string
}

// CreateBedUseCase implements the "create bed" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateBedUseCase struct {
	repo       domain.BedRepository
	idProvider IDProvider
}

func NewCreateBedUseCase(repo domain.BedRepository, idProvider IDProvider) *CreateBedUseCase {
	return &CreateBedUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateBedUseCase) Create(ctx context.Context, in CreateInput) (domain.Bed, error) {
	// Default to active first: ParseBedStatus("") returns an error, so a
	// missing status must never reach the parser.
	status := domain.BedStatusActive
	if in.Status != "" {
		parsed, err := domain.ParseBedStatus(in.Status)
		if err != nil {
			return domain.Bed{}, err
		}
		status = parsed
	}

	bed, err := domain.NewBed(
		uc.idProvider.NewBedID(),
		in.RoomID,
		in.TypesBedID,
		in.Etiquette,
		status,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Bed{}, err
	}
	if err := assertUniqueEtiquette(ctx, uc.repo, bed.ID, bed.Etiquette, bed.RoomID); err != nil {
		return domain.Bed{}, err
	}
	if err := uc.repo.Save(ctx, bed); err != nil {
		return domain.Bed{}, err
	}
	// Re-fetch so created_at/updated_at match the database clock.
	return uc.repo.FindByID(ctx, bed.ID)
}
