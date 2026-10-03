package user

import (
	"time"

	userapp "nexora-api-rest/internal/application/user"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator userapp.UserCreator
	Lister  userapp.UserLister
	Getter  userapp.UserGetter
	Updater userapp.UserUpdater
	Deleter userapp.UserDeleter
}

// userResponse is the HTTP projection of the domain entity. The password hash
// is intentionally NOT exposed by the API (security by design).
type userResponse struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	Email             string    `json:"email"`
	RoleID            string    `json:"role_id"`
	HeadquartersID    *string   `json:"headquarters_id"`
	SubHeadquartersID *string   `json:"sub_headquarters_id"`
	Status            string    `json:"status"`
	CreatedBy         string    `json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func newUserResponse(u domain.User) userResponse {
	return userResponse{
		ID:                string(u.ID),
		Name:              u.Name,
		Email:             u.Email,
		RoleID:            string(u.RoleID),
		HeadquartersID:    headquarterIDRef(u.HeadquartersID),
		SubHeadquartersID: subHeadquarterIDRef(u.SubHeadquartersID),
		Status:            string(u.Status),
		CreatedBy:         u.CreatedBy,
		CreatedAt:         u.CreatedAt,
		UpdatedAt:         u.UpdatedAt,
	}
}

func headquarterIDRef(id *domain.HeadquarterID) *string {
	if id == nil {
		return nil
	}
	s := string(*id)
	return &s
}

func subHeadquarterIDRef(id *domain.SubHeadquarterID) *string {
	if id == nil {
		return nil
	}
	s := string(*id)
	return &s
}
