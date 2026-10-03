package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a sub headquarter (PUT semantics).
type UpdateInput struct {
	ID            domain.SubHeadquarterID
	HeadquarterID domain.HeadquarterID
	Name          string
	Address       string
	Phone         string
	Status        string
}

// UpdateSubHeadquarterUseCase implements the "update sub headquarter" vertical slice.
type UpdateSubHeadquarterUseCase struct {
	repo domain.SubHeadquarterRepository
}

func NewUpdateSubHeadquarterUseCase(repo domain.SubHeadquarterRepository) *UpdateSubHeadquarterUseCase {
	return &UpdateSubHeadquarterUseCase{repo: repo}
}

func (uc *UpdateSubHeadquarterUseCase) Update(ctx context.Context, in UpdateInput) (domain.SubHeadquarter, error) {
	subHeadquarter, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.SubHeadquarter{}, err
	}

	status, err := domain.ParseSubHeadquarterStatus(in.Status)
	if err != nil {
		return domain.SubHeadquarter{}, err
	}

	subHeadquarter.HeadquarterID = in.HeadquarterID
	subHeadquarter.Name = in.Name
	subHeadquarter.Address = in.Address
	subHeadquarter.Phone = in.Phone
	subHeadquarter.Status = status

	if err := subHeadquarter.Validate(); err != nil {
		return domain.SubHeadquarter{}, err
	}
	if err := assertUniqueNameInHeadquarter(ctx, uc.repo, subHeadquarter.ID, subHeadquarter.HeadquarterID, subHeadquarter.Name); err != nil {
		return domain.SubHeadquarter{}, err
	}
	if err := uc.repo.Update(ctx, subHeadquarter); err != nil {
		return domain.SubHeadquarter{}, err
	}
	return uc.repo.FindByID(ctx, subHeadquarter.ID)
}
