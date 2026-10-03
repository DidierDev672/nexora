package building

import (
	"time"

	buildingapp "nexora-api-rest/internal/application/building"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator buildingapp.BuildingCreator
	Lister  buildingapp.BuildingLister
	Getter  buildingapp.BuildingGetter
	Updater buildingapp.BuildingUpdater
	Deleter buildingapp.BuildingDeleter
}

// buildingResponse is the HTTP projection of the domain entity. The optional
// value (sub_headquarters_id) is rendered as null when unset.
type buildingResponse struct {
	ID                string    `json:"id"`
	Name              string    `json:"name"`
	FloorNumber       int       `json:"floor_number"`
	HeadquartersID    string    `json:"headquarters_id"`
	SubHeadquartersID *string   `json:"sub_headquarters_id"`
	Status            string    `json:"status"`
	CreatedBy         string    `json:"created_by"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

func newBuildingResponse(b domain.Building) buildingResponse {
	var subHeadquartersID *string
	if b.SubHeadquartersID != nil {
		id := string(*b.SubHeadquartersID)
		subHeadquartersID = &id
	}

	return buildingResponse{
		ID:                string(b.ID),
		Name:              b.Name,
		FloorNumber:       b.FloorNumber,
		HeadquartersID:    string(b.HeadquartersID),
		SubHeadquartersID: subHeadquartersID,
		Status:            string(b.Status),
		CreatedBy:         b.CreatedBy,
		CreatedAt:         b.CreatedAt,
		UpdatedAt:         b.UpdatedAt,
	}
}
