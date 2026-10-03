package building

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a building (PUT, full
// replace). SubHeadquartersID is nullable: nil clears the value; an empty
// status means "available".
type UpdateInput struct {
	ID                domain.BuildingID
	Name              string
	FloorNumber       int
	HeadquartersID    domain.HeadquarterID
	SubHeadquartersID *domain.SubHeadquarterID
	Status            string
}

// UpdateBuildingUseCase implements the "update building" vertical slice:
// load -> mutate through domain behavior -> uniqueness -> persist.
type UpdateBuildingUseCase struct {
	repo domain.BuildingRepository
}

func NewUpdateBuildingUseCase(repo domain.BuildingRepository) *UpdateBuildingUseCase {
	return &UpdateBuildingUseCase{repo: repo}
}

func (uc *UpdateBuildingUseCase) Update(ctx context.Context, in UpdateInput) (domain.Building, error) {
	building, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Building{}, err
	}

	// Mutate through domain behavior methods so invariants stay intact.
	if err := building.Rename(in.Name); err != nil {
		return domain.Building{}, err
	}
	if err := building.ChangeFloorNumber(in.FloorNumber); err != nil {
		return domain.Building{}, err
	}
	if err := building.ReassignHeadquarter(in.HeadquartersID); err != nil {
		return domain.Building{}, err
	}
	building.AssignSubHeadquarter(in.SubHeadquartersID)

	// Mirror create: an empty status means "available" instead of being
	// rejected by ChangeStatus (ParseBuildingStatus("") is an error).
	status := in.Status
	if status == "" {
		status = string(domain.BuildingStatusAvailable)
	}
	if err := building.ChangeStatus(status); err != nil {
		return domain.Building{}, err
	}

	if err := assertUniqueName(ctx, uc.repo, building.ID, building.Name, building.HeadquartersID); err != nil {
		return domain.Building{}, err
	}
	building.UpdatedAt = time.Now().UTC()
	if err := uc.repo.Update(ctx, building); err != nil {
		return domain.Building{}, err
	}
	// Re-fetch so updated_at matches the database clock.
	return uc.repo.FindByID(ctx, building.ID)
}
