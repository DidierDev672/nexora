package room

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	roomapp "nexora-api-rest/internal/application/room"
	"nexora-api-rest/internal/domain"
)

type updateRoomRequest struct {
	Number        string   `json:"number"`
	Floor         int      `json:"floor"`
	RoomTypesID   string   `json:"room_types_id"`
	BuildingID    string   `json:"building_id"`
	PriceOverride *float64 `json:"price_override"`
	Status        string   `json:"status"`
	HasReception  bool     `json:"has_reception"`
}

// Update is the HTTP entry point of the "update room" slice (PUT, full
// replace). Send price_override: null to clear the override; an empty status
// resets to available.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomID(r.PathValue("id"))

	var req updateRoomRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), roomapp.UpdateInput{
		ID:            id,
		Number:        req.Number,
		Floor:         req.Floor,
		RoomTypeID:    domain.RoomTypeID(req.RoomTypesID),
		BuildingID:    domain.BuildingID(req.BuildingID),
		PriceOverride: toBasePrice(req.PriceOverride),
		Status:        req.Status,
		HasReception:  req.HasReception,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrRoomNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidRoomNumber),
			errors.Is(err, domain.ErrInvalidRoomFloor),
			errors.Is(err, domain.ErrInvalidRoomTypeID),
			errors.Is(err, domain.ErrInvalidBuildingID),
			errors.Is(err, domain.ErrInvalidRoomStatus),
			errors.Is(err, domain.ErrInvalidPriceOverride):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrRoomDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRoomResponse(updated))
}
