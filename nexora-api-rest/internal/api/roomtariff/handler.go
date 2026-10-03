package roomtariff

import (
	"errors"
	"net/http"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	rtapp "nexora-api-rest/internal/application/roomtariff"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer (ISP).
type Handler struct {
	Creator rtapp.RoomTariffCreator
	Lister  rtapp.RoomTariffLister
	Getter  rtapp.RoomTariffGetter
	ByRoom  rtapp.RoomTariffByRoomLister
	Updater rtapp.RoomTariffUpdater
	Deleter rtapp.RoomTariffDeleter
}

// roomTariffResponse represents the JSON projection of the room tariff entity.
type roomTariffResponse struct {
	ID        string    `json:"id"`
	RoomID    string    `json:"room_id"`
	RateID    string    `json:"rate_id"`
	IsDefault bool      `json:"is_default"`
	Status    string    `json:"status"`
	CreatedBy string    `json:"created_by"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func newRoomTariffResponse(t domain.RoomTariff) roomTariffResponse {
	return roomTariffResponse{
		ID:        string(t.ID),
		RoomID:    string(t.RoomID),
		RateID:    string(t.RateID),
		IsDefault: t.IsDefault,
		Status:    string(t.Status),
		CreatedBy: t.CreatedBy,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}
}

// writeRoomTariffError translates a domain or use case failure into an HTTP
// status: a rejected payload is a 422, a missing room tariff is a 404 and
// anything else is an opaque 500.
func writeRoomTariffError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrRoomTariffNotFound):
		httpjson.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, domain.ErrInvalidRoomTariffID),
		errors.Is(err, domain.ErrInvalidRoomTariffRoomID),
		errors.Is(err, domain.ErrInvalidRoomTariffRateID),
		errors.Is(err, domain.ErrInvalidRoomTariffStatus):
		httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
