package user

import (
	"context"
	"strings"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the data required to update a user (PUT semantics: all
// business fields are replaced). Password is optional: an empty value keeps the
// current password hash.
type UpdateInput struct {
	ID                domain.UserID
	Name              string
	Email             string
	Password          string
	RoleID            domain.RoleID
	HeadquartersID    *domain.HeadquarterID
	SubHeadquartersID *domain.SubHeadquarterID
	Status            string
}

// UpdateUserUseCase implements the "update user" vertical slice.
type UpdateUserUseCase struct {
	repo   domain.UserRepository
	hasher PasswordHasher
}

func NewUpdateUserUseCase(repo domain.UserRepository, hasher PasswordHasher) *UpdateUserUseCase {
	return &UpdateUserUseCase{repo: repo, hasher: hasher}
}

func (uc *UpdateUserUseCase) Update(ctx context.Context, in UpdateInput) (domain.User, error) {
	user, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.User{}, err
	}

	status, err := domain.ParseUserStatus(in.Status)
	if err != nil {
		return domain.User{}, err
	}

	user.Name = strings.TrimSpace(in.Name)
	user.Email = strings.ToLower(strings.TrimSpace(in.Email))
	user.RoleID = in.RoleID
	user.HeadquartersID = in.HeadquartersID
	user.SubHeadquartersID = in.SubHeadquartersID
	user.Status = status

	if err := user.Validate(); err != nil {
		return domain.User{}, err
	}
	if in.Password != "" {
		if err := domain.ValidateUserPassword(in.Password); err != nil {
			return domain.User{}, err
		}
		hash, err := uc.hasher.Hash(in.Password)
		if err != nil {
			return domain.User{}, err
		}
		user.PasswordHash = hash
	}
	if err := assertUniqueEmail(ctx, uc.repo, user.ID, user.Email); err != nil {
		return domain.User{}, err
	}
	if err := uc.repo.Update(ctx, user); err != nil {
		return domain.User{}, err
	}
	return uc.repo.FindByID(ctx, user.ID)
}
