package subheadquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a sub headquarter.
type CreateInput struct {
	HeadquarterID domain.HeadquarterID
	Name          string
	Address       string
	Phone         string
	Status        string
	CreatedBy     string
}

// CreateSubHeadquarterUseCase implements the "create sub headquarter" vertical
// slice: validate -> ensure uniqueness within the headquarter -> persist.
// One responsibility.
type CreateSubHeadquarterUseCase struct {
	repo       domain.SubHeadquarterRepository
	idProvider IDProvider
}

func NewCreateSubHeadquarterUseCase(repo domain.SubHeadquarterRepository, idProvider IDProvider) *CreateSubHeadquarterUseCase {
	return &CreateSubHeadquarterUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateSubHeadquarterUseCase) Create(ctx context.Context, in CreateInput) (domain.SubHeadquarter, error) {
	status := domain.SubHeadquarterStatus(in.Status)
	if status == "" {
		status = domain.SubHeadquarterStatusActive
	}

	subHeadquarter := domain.SubHeadquarter{
		ID:            uc.idProvider.NewSubHeadquarterID(),
		HeadquarterID: in.HeadquarterID,
		Name:          in.Name,
		Address:       in.Address,
		Phone:         in.Phone,
		Status:        status,
		CreatedBy:     in.CreatedBy,
	}
	if err := subHeadquarter.Validate(); err != nil {
		return domain.SubHeadquarter{}, err
	}
	if err := assertUniqueNameInHeadquarter(ctx, uc.repo, subHeadquarter.ID, subHeadquarter.HeadquarterID, subHeadquarter.Name); err != nil {
		return domain.SubHeadquarter{}, err
	}
	if err := uc.repo.Save(ctx, subHeadquarter); err != nil {
		return domain.SubHeadquarter{}, err
	}
	return uc.repo.FindByID(ctx, subHeadquarter.ID)
}
