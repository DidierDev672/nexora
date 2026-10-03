package room

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	roomapp "nexora-api-rest/internal/application/room"
	"nexora-api-rest/internal/domain"
)

type createRoomRequest struct {
	Number        string   `json:"number"`
	Floor         int      `json:"floor"`
	RoomTypesID   string   `json:"room_types_id"`
	BuildingID    string   `json:"building_id"`
	PriceOverride *float64 `json:"price_override"`
	Status        string   `json:"status"`
	HasReception  bool     `json:"has_reception"`
	CreatedBy     string   `json:"created_by"`
}

// Create is the HTTP entry point of the "create room" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createRoomRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), roomapp.CreateInput{
		Number:        req.Number,
		Floor:         req.Floor,
		RoomTypeID:    domain.RoomTypeID(req.RoomTypesID),
		BuildingID:    domain.BuildingID(req.BuildingID),
		PriceOverride: toBasePrice(req.PriceOverride),
		Status:        req.Status,
		HasReception:  req.HasReception,
		CreatedBy:     req.CreatedBy,
	})
	if err != nil {
		switch {
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

	httpjson.WriteJSON(w, http.StatusCreated, newRoomResponse(created))
}
