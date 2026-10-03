package bed

import (
	"time"

	bedapp "nexora-api-rest/internal/application/bed"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator bedapp.BedCreator
	Lister  bedapp.BedLister
	Getter  bedapp.BedGetter
	Updater bedapp.BedUpdater
	Deleter bedapp.BedDeleter
}

// bedResponse is the HTTP projection of the domain entity.
type bedResponse struct {
	ID         string    `json:"id"`
	RoomID     string    `json:"room_id"`
	TypesBedID []string  `json:"types_bed_id"`
	Etiquette  string    `json:"etiquette"`
	Status     string    `json:"status"`
	CreatedBy  string    `json:"created_by"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

func newBedResponse(b domain.Bed) bedResponse {
	typesBedID := make([]string, 0, len(b.TypesBedID))
	for _, id := range b.TypesBedID {
		typesBedID = append(typesBedID, string(id))
	}
	return bedResponse{
		ID:         string(b.ID),
		RoomID:     string(b.RoomID),
		TypesBedID: typesBedID,
		Etiquette:  b.Etiquette,
		Status:     string(b.Status),
		CreatedBy:  b.CreatedBy,
		CreatedAt:  b.CreatedAt,
		UpdatedAt:  b.UpdatedAt,
	}
}
