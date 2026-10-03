package headquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a headquarter (PUT semantics).
type UpdateInput struct {
	ID      domain.HeadquarterID
	Name    string
	Address string
	City    string
	Phone   string
	Status  string
}

// UpdateHeadquarterUseCase implements the "update headquarter" vertical slice.
type UpdateHeadquarterUseCase struct {
	repo domain.HeadquarterRepository
}

func NewUpdateHeadquarterUseCase(repo domain.HeadquarterRepository) *UpdateHeadquarterUseCase {
	return &UpdateHeadquarterUseCase{repo: repo}
}

func (uc *UpdateHeadquarterUseCase) Update(ctx context.Context, in UpdateInput) (domain.Headquarter, error) {
	headquarter, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Headquarter{}, err
	}

	status, err := domain.ParseHeadquarterStatus(in.Status)
	if err != nil {
		return domain.Headquarter{}, err
	}

	headquarter.Name = in.Name
	headquarter.Address = in.Address
	headquarter.City = in.City
	headquarter.Phone = in.Phone
	headquarter.Status = status

	if err := headquarter.Validate(); err != nil {
		return domain.Headquarter{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, headquarter.ID, headquarter.Name); err != nil {
		return domain.Headquarter{}, err
	}
	if err := uc.repo.Update(ctx, headquarter); err != nil {
		return domain.Headquarter{}, err
	}
	return uc.repo.FindByID(ctx, headquarter.ID)
}
