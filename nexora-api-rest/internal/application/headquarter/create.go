package headquarter

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a headquarter.
type CreateInput struct {
	Name      string
	Address   string
	City      string
	Phone     string
	Status    string
	CreatedBy string
}

// CreateHeadquarterUseCase implements the "create headquarter" vertical slice:
// validate -> ensure uniqueness -> persist. One responsibility.
type CreateHeadquarterUseCase struct {
	repo       domain.HeadquarterRepository
	idProvider IDProvider
}

func NewCreateHeadquarterUseCase(repo domain.HeadquarterRepository, idProvider IDProvider) *CreateHeadquarterUseCase {
	return &CreateHeadquarterUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateHeadquarterUseCase) Create(ctx context.Context, in CreateInput) (domain.Headquarter, error) {
	status := domain.HeadquarterStatus(in.Status)
	if status == "" {
		status = domain.HeadquarterStatusActive
	}

	headquarter := domain.Headquarter{
		ID:        uc.idProvider.NewHeadquarterID(),
		Name:      in.Name,
		Address:   in.Address,
		City:      in.City,
		Phone:     in.Phone,
		Status:    status,
		CreatedBy: in.CreatedBy,
	}
	if err := headquarter.Validate(); err != nil {
		return domain.Headquarter{}, err
	}
	if err := assertUniqueName(ctx, uc.repo, headquarter.ID, headquarter.Name); err != nil {
		return domain.Headquarter{}, err
	}
	if err := uc.repo.Save(ctx, headquarter); err != nil {
		return domain.Headquarter{}, err
	}
	return uc.repo.FindByID(ctx, headquarter.ID)
}
