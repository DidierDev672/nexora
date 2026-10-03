package headquarter

import (
	"time"

	headquarterapp "nexora-api-rest/internal/application/headquarter"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator headquarterapp.HeadquarterCreator
	Lister  headquarterapp.HeadquarterLister
	Getter  headquarterapp.HeadquarterGetter
	Updater headquarterapp.HeadquarterUpdater
	Deleter headquarterapp.HeadquarterDeleter
}

// headquarterResponse is the HTTP projection of the domain entity.
type headquarterResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Address   string    `json:"address"`
	City      string    `json:"city"`
	Phone     string    `json:"phone"`
	Status    string    `json:"status"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func newHeadquarterResponse(hq domain.Headquarter) headquarterResponse {
	return headquarterResponse{
		ID:        string(hq.ID),
		Name:      hq.Name,
		Address:   hq.Address,
		City:      hq.City,
		Phone:     hq.Phone,
		Status:    string(hq.Status),
		CreatedBy: hq.CreatedBy,
		CreatedAt: hq.CreatedAt,
		UpdatedAt: hq.UpdatedAt,
	}
}
