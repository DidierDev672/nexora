package building

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a building. Status defaults
// to available when empty. SubHeadquartersID is optional.
type CreateInput struct {
	Name              string
	FloorNumber       int
	HeadquartersID    domain.HeadquarterID
	SubHeadquartersID *domain.SubHeadquarterID
	Status            string
	CreatedBy         string
}

// CreateBuildingUseCase implements the "create building" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateBuildingUseCase struct {
	repo       domain.BuildingRepository
	idProvider IDProvider
}

func NewCreateBuildingUseCase(repo domain.BuildingRepository, idProvider IDProvider) *CreateBuildingUseCase {
	return &CreateBuildingUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateBuildingUseCase) Create(ctx context.Context, in CreateInput) (domain.Building, error) {
	// Default to available first: ParseBuildingStatus("") returns an error,
	// so a missing status must never reach the parser.
	status := domain.BuildingStatusAvailable
	if in.Status != "" {
		parsed, err := domain.ParseBuildingStatus(in.Status)
		if err != nil {
			return domain.Building{}, err
		}
		status = parsed
	}

	building, err := domain.NewBuilding(
		uc.idProvider.NewBuildingID(),
		in.Name,
		in.FloorNumber,
		in.HeadquartersID,
		in.SubHeadquartersID,
		status,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Building{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, building.ID, building.Name, building.HeadquartersID); err != nil {
		return domain.Building{}, err
	}
	if err := uc.repo.Save(ctx, building); err != nil {
		return domain.Building{}, err
	}
	// Re-fetch so created_at/updated_at match the database clock.
	return uc.repo.FindByID(ctx, building.ID)
}
