package subheadquarter

import (
	"time"

	subheadquarterapp "nexora-api-rest/internal/application/subheadquarter"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator       subheadquarterapp.SubHeadquarterCreator
	Lister        subheadquarterapp.SubHeadquarterLister
	ByHeadquarter subheadquarterapp.SubHeadquarterByHeadquarterLister
	Getter        subheadquarterapp.SubHeadquarterGetter
	Updater       subheadquarterapp.SubHeadquarterUpdater
	Deleter       subheadquarterapp.SubHeadquarterDeleter
}

// subHeadquarterResponse is the HTTP projection of the domain entity.
type subHeadquarterResponse struct {
	ID            string    `json:"id"`
	HeadquarterID string    `json:"headquarter_id"`
	Name          string    `json:"name"`
	Address       string    `json:"address"`
	Phone         string    `json:"phone"`
	Status        string    `json:"status"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func newSubHeadquarterResponse(sub domain.SubHeadquarter) subHeadquarterResponse {
	return subHeadquarterResponse{
		ID:            string(sub.ID),
		HeadquarterID: string(sub.HeadquarterID),
		Name:          sub.Name,
		Address:       sub.Address,
		Phone:         sub.Phone,
		Status:        string(sub.Status),
		CreatedBy:     sub.CreatedBy,
		CreatedAt:     sub.CreatedAt,
		UpdatedAt:     sub.UpdatedAt,
	}
}
