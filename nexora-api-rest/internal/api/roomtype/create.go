package roomtype

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	roomtypeapp "nexora-api-rest/internal/application/roomtype"
	"nexora-api-rest/internal/domain"
)

type createRoomTypeRequest struct {
	Name      string  `json:"name"`
	Capacity  int     `json:"capacity"`
	BasePrice float64 `json:"base_price"`
	CreatedBy string  `json:"created_by"`
}

// Create is the HTTP entry point of the "create room type" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createRoomTypeRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), roomtypeapp.CreateInput{
		Name:      req.Name,
		Capacity:  req.Capacity,
		BasePrice: req.BasePrice,
		CreatedBy: req.CreatedBy,
	})
	if err != nil {
		switch {
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

	httpjson.WriteJSON(w, http.StatusCreated, newRoomTypeResponse(created))
}
