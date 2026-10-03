package bed

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	bedapp "nexora-api-rest/internal/application/bed"
	"nexora-api-rest/internal/domain"
)

type updateBedRequest struct {
	RoomID     string   `json:"room_id"`
	TypesBedID []string `json:"types_bed_id"`
	Etiquette  string   `json:"etiquette"`
	Status     string   `json:"status"`
}

// Update is the HTTP entry point of the "update bed" slice (PUT, full
// replace). Send an empty status to reset to active.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.BedID(r.PathValue("id"))

	var req updateBedRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	typesBedID := make([]domain.BedTypeID, 0, len(req.TypesBedID))
	for _, id := range req.TypesBedID {
		typesBedID = append(typesBedID, domain.BedTypeID(id))
	}
	updated, err := h.Updater.Update(r.Context(), bedapp.UpdateInput{
		ID:         id,
		RoomID:     domain.RoomID(req.RoomID),
		TypesBedID: typesBedID,
		Etiquette:  req.Etiquette,
		Status:     req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrBedNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
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

	httpjson.WriteJSON(w, http.StatusOK, newBedResponse(updated))
}
