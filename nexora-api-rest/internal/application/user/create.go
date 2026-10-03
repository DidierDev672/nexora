package user

import (
	"context"
	"strings"

	"nexora-api-rest/internal/domain"
)

// CreateInput carries the data required to create a user. Password is the raw
// value; it is hashed inside the use case and never stored in plain text.
// CreatedBy defaults to "user_system" when empty.
type CreateInput struct {
	Name              string
	Email             string
	Password          string
	RoleID            domain.RoleID
	HeadquartersID    *domain.HeadquarterID
	SubHeadquartersID *domain.SubHeadquarterID
	Status            string
	CreatedBy         string
}

// CreateUserUseCase implements the "create user" vertical slice:
// validate password -> hash -> validate entity -> ensure unique email -> persist.
// One responsibility.
type CreateUserUseCase struct {
	repo       domain.UserRepository
	idProvider IDProvider
	hasher     PasswordHasher
}

func NewCreateUserUseCase(repo domain.UserRepository, idProvider IDProvider, hasher PasswordHasher) *CreateUserUseCase {
	return &CreateUserUseCase{repo: repo, idProvider: idProvider, hasher: hasher}
}

func (uc *CreateUserUseCase) Create(ctx context.Context, in CreateInput) (domain.User, error) {
	if err := domain.ValidateUserPassword(in.Password); err != nil {
		return domain.User{}, err
	}

	hash, err := uc.hasher.Hash(in.Password)
	if err != nil {
		return domain.User{}, err
	}

	status := domain.UserStatus(in.Status)
	if status == "" {
		status = domain.UserStatusActive
	}

	createdBy := in.CreatedBy
	if createdBy == "" {
		createdBy = domain.DefaultUserCreatedBy
	}

	user := domain.User{
		ID:                uc.idProvider.NewUserID(),
		Name:              strings.TrimSpace(in.Name),
		Email:             strings.ToLower(strings.TrimSpace(in.Email)),
		PasswordHash:      hash,
		RoleID:            in.RoleID,
		HeadquartersID:    in.HeadquartersID,
		SubHeadquartersID: in.SubHeadquartersID,
		Status:            status,
		CreatedBy:         createdBy,
	}
	if err := user.Validate(); err != nil {
		return domain.User{}, err
	}
	if err := assertUniqueEmail(ctx, uc.repo, user.ID, user.Email); err != nil {
		return domain.User{}, err
	}
	if err := uc.repo.Save(ctx, user); err != nil {
		return domain.User{}, err
	}
	return uc.repo.FindByID(ctx, user.ID)
}
