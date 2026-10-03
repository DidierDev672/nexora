package roomtype

import (
	"time"

	roomtypeapp "nexora-api-rest/internal/application/roomtype"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator roomtypeapp.RoomTypeCreator
	Lister  roomtypeapp.RoomTypeLister
	Getter  roomtypeapp.RoomTypeGetter
	Updater roomtypeapp.RoomTypeUpdater
	Deleter roomtypeapp.RoomTypeDeleter
}

// roomTypeResponse is the HTTP projection of the domain entity.
type roomTypeResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Capacity  int       `json:"capacity"`
	BasePrice float64   `json:"base_price"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func newRoomTypeResponse(rt domain.RoomType) roomTypeResponse {
	return roomTypeResponse{
		ID:        string(rt.ID),
		Name:      rt.Name,
		Capacity:  int(rt.Capacity),
		BasePrice: float64(rt.BasePrice),
		CreatedBy: rt.CreatedBy,
		CreatedAt: rt.CreatedAt,
		UpdatedAt: rt.UpdatedAt,
	}
}
