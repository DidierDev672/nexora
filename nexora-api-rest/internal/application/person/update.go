package person

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a person (PUT, full replace).
type UpdateInput struct {
	ID             domain.PersonID
	DocumentType   string
	DocumentNumber string
	Name           string
	PhoneNumber    string
	Email          string
	DateOfBirth    time.Time
	Gender         string
	Nationality    string
	Roles          []domain.RoleID
}

// UpdatePersonUseCase implements the "update person" vertical slice:
// load -> mutate through domain behavior -> uniqueness -> persist.
type UpdatePersonUseCase struct {
	repo domain.PersonRepository
}

func NewUpdatePersonUseCase(repo domain.PersonRepository) *UpdatePersonUseCase {
	return &UpdatePersonUseCase{repo: repo}
}

func (uc *UpdatePersonUseCase) Update(ctx context.Context, in UpdateInput) (domain.Person, error) {
	person, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Person{}, err
	}

	docType, err := domain.ParseDocumentType(in.DocumentType)
	if err != nil {
		return domain.Person{}, err
	}

	gender, err := domain.ParseGender(in.Gender)
	if err != nil {
		return domain.Person{}, err
	}

	if err := person.ChangeDocument(docType, in.DocumentNumber); err != nil {
		return domain.Person{}, err
	}
	if err := person.ChangeContact(in.Name, in.PhoneNumber, in.Email); err != nil {
		return domain.Person{}, err
	}
	if err := person.ChangePersonalData(in.DateOfBirth, gender, in.Nationality); err != nil {
		return domain.Person{}, err
	}
	if err := person.ReassignRoles(in.Roles); err != nil {
		return domain.Person{}, err
	}

	if err := assertUniqueDocument(ctx, uc.repo, person.ID, person.DocumentType, person.DocumentNumber); err != nil {
		return domain.Person{}, err
	}

	person.UpdatedAt = time.Now().UTC()
	if err := uc.repo.Update(ctx, person); err != nil {
		return domain.Person{}, err
	}

	return uc.repo.FindByID(ctx, person.ID)
}
