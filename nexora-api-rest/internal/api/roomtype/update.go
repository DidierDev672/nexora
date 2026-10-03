package roomtype

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	roomtypeapp "nexora-api-rest/internal/application/roomtype"
	"nexora-api-rest/internal/domain"
)

type updateRoomTypeRequest struct {
	Name      string   `json:"name"`
	Capacity  *int     `json:"capacity"`
	BasePrice *float64 `json:"base_price"`
}

// Update is the HTTP entry point of the "update room type" slice (PUT).
// Only fields present in the request are applied; omitted ones keep their
// current value. null is treated as omitted.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomTypeID(r.PathValue("id"))

	var req updateRoomTypeRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), roomtypeapp.UpdateInput{
		ID:        id,
		Name:      req.Name,
		Capacity:  req.Capacity,
		BasePrice: req.BasePrice,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrRoomTypeNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidRoomTypeName),
			errors.Is(err, domain.ErrInvalidRoomTypeCapacity),
			errors.Is(err, domain.ErrInvalidRoomTypeBasePrice):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrRoomTypeDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newRoomTypeResponse(updated))
}
