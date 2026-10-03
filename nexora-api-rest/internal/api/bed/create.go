package bed

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	bedapp "nexora-api-rest/internal/application/bed"
	"nexora-api-rest/internal/domain"
)

type createBedRequest struct {
	RoomID     string   `json:"room_id"`
	TypesBedID []string `json:"types_bed_id"`
	Etiquette  string   `json:"etiquette"`
	Status     string   `json:"status"`
	CreatedBy  string   `json:"created_by"`
}

// Create is the HTTP entry point of the "create bed" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createBedRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	typesBedID := make([]domain.BedTypeID, 0, len(req.TypesBedID))
	for _, id := range req.TypesBedID {
		typesBedID = append(typesBedID, domain.BedTypeID(id))
	}
	created, err := h.Creator.Create(r.Context(), bedapp.CreateInput{
		RoomID:     domain.RoomID(req.RoomID),
		TypesBedID: typesBedID,
		Etiquette:  req.Etiquette,
		Status:     req.Status,
		CreatedBy:  req.CreatedBy,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidBedEtiquette),
			errors.Is(err, domain.ErrInvalidBedRoomID),
			errors.Is(err, domain.ErrInvalidBedTypeID),
			errors.Is(err, domain.ErrInvalidBedStatus):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrBedDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newBedResponse(created))
}
