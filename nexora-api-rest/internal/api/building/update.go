package building

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	buildingapp "nexora-api-rest/internal/application/building"
	"nexora-api-rest/internal/domain"
)

type updateBuildingRequest struct {
	Name              string  `json:"name"`
	FloorNumber       int     `json:"floor_number"`
	HeadquartersID    string  `json:"headquarters_id"`
	SubHeadquartersID *string `json:"sub_headquarters_id"`
	Status            string  `json:"status"`
}

// Update is the HTTP entry point of the "update building" slice (PUT, full
// replace). Send sub_headquarters_id: null to clear the assignment; an empty
// status resets to available.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.BuildingID(r.PathValue("id"))

	var req updateBuildingRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), buildingapp.UpdateInput{
		ID:                id,
		Name:              req.Name,
		FloorNumber:       req.FloorNumber,
		HeadquartersID:    domain.HeadquarterID(req.HeadquartersID),
		SubHeadquartersID: toSubHeadquarterID(req.SubHeadquartersID),
		Status:            req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrBuildingNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidBuildingName),
			errors.Is(err, domain.ErrInvalidBuildingFloorNumber),
			errors.Is(err, domain.ErrInvalidHeadquarterID),
			errors.Is(err, domain.ErrInvalidBuildingStatus):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrBuildingDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newBuildingResponse(updated))
}
