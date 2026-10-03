package room

import (
	"time"

	roomapp "nexora-api-rest/internal/application/room"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator roomapp.RoomCreator
	Lister  roomapp.RoomLister
	Getter  roomapp.RoomGetter
	Updater roomapp.RoomUpdater
	Deleter roomapp.RoomDeleter
}

// roomResponse is the HTTP projection of the domain entity. The optional
// value (price_override) is rendered as null when unset.
type roomResponse struct {
	ID            string    `json:"id"`
	Number        string    `json:"number"`
	Floor         int       `json:"floor"`
	RoomTypesID   string    `json:"room_types_id"`
	BuildingID    string    `json:"building_id"`
	PriceOverride *float64  `json:"price_override"`
	Status        string    `json:"status"`
	HasReception  bool      `json:"has_reception"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func newRoomResponse(r domain.Room) roomResponse {
	var priceOverride *float64
	if r.PriceOverride != nil {
		price := float64(*r.PriceOverride)
		priceOverride = &price
	}

	return roomResponse{
		ID:            string(r.ID),
		Number:        r.Number,
		Floor:         r.Floor,
		RoomTypesID:   string(r.RoomTypeID),
		BuildingID:    string(r.BuildingID),
		PriceOverride: priceOverride,
		Status:        string(r.Status),
		HasReception:  r.HasReception,
		CreatedBy:     r.CreatedBy,
		CreatedAt:     r.CreatedAt,
		UpdatedAt:     r.UpdatedAt,
	}
}
