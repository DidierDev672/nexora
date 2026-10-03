package bedtype

import (
	"time"

	bedtypeapp "nexora-api-rest/internal/application/bedtype"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator bedtypeapp.BedTypeCreator
	Lister  bedtypeapp.BedTypeLister
	Getter  bedtypeapp.BedTypeGetter
	Updater bedtypeapp.BedTypeUpdater
	Deleter bedtypeapp.BedTypeDeleter
}

// bedTypeResponse is the HTTP projection of the domain entity.
type bedTypeResponse struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	CapacityPeople int       `json:"capacity_people"`
	Description    string    `json:"description"`
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func newBedTypeResponse(bt domain.BedType) bedTypeResponse {
	return bedTypeResponse{
		ID:             string(bt.ID),
		Name:           bt.Name,
		CapacityPeople: int(bt.CapacityPeople),
		Description:    bt.Description,
		CreatedBy:      bt.CreatedBy,
		CreatedAt:      bt.CreatedAt,
		UpdatedAt:      bt.UpdatedAt,
	}
}
