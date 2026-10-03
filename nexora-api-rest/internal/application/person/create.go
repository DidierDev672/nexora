package person

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a person.
type CreateInput struct {
	DocumentType   string
	DocumentNumber string
	Name           string
	PhoneNumber    string
	Email          string
	DateOfBirth    time.Time
	Gender         string
	Nationality    string
	Roles          []domain.RoleID
	CreatedBy      string
}

// CreatePersonUseCase implements the "create person" vertical slice:
// validate -> ensure natural key uniqueness -> persist.
type CreatePersonUseCase struct {
	repo       domain.PersonRepository
	idProvider IDProvider
}

func NewCreatePersonUseCase(repo domain.PersonRepository, idProvider IDProvider) *CreatePersonUseCase {
	return &CreatePersonUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreatePersonUseCase) Create(ctx context.Context, in CreateInput) (domain.Person, error) {
	docType, err := domain.ParseDocumentType(in.DocumentType)
	if err != nil {
		return domain.Person{}, err
	}

	gender, err := domain.ParseGender(in.Gender)
	if err != nil {
		return domain.Person{}, err
	}

	person, err := domain.NewPerson(
		uc.idProvider.NewPersonID(),
		docType,
		in.DocumentNumber,
		in.Name,
		in.PhoneNumber,
		in.Email,
		in.DateOfBirth,
		gender,
		in.Nationality,
		in.Roles,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Person{}, err
	}

	if err := assertUniqueDocument(ctx, uc.repo, person.ID, person.DocumentType, person.DocumentNumber); err != nil {
		return domain.Person{}, err
	}

	if err := uc.repo.Save(ctx, person); err != nil {
		return domain.Person{}, err
	}

	return uc.repo.FindByID(ctx, person.ID)
}
