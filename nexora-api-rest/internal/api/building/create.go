package building

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	buildingapp "nexora-api-rest/internal/application/building"
	"nexora-api-rest/internal/domain"
)

type createBuildingRequest struct {
	Name              string  `json:"name"`
	FloorNumber       int     `json:"floor_number"`
	HeadquartersID    string  `json:"headquarters_id"`
	SubHeadquartersID *string `json:"sub_headquarters_id"`
	Status            string  `json:"status"`
	CreatedBy         string  `json:"created_by"`
}

// Create is the HTTP entry point of the "create building" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createBuildingRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), buildingapp.CreateInput{
		Name:              req.Name,
		FloorNumber:       req.FloorNumber,
		HeadquartersID:    domain.HeadquarterID(req.HeadquartersID),
		SubHeadquartersID: toSubHeadquarterID(req.SubHeadquartersID),
		Status:            req.Status,
		CreatedBy:         req.CreatedBy,
	})
	if err != nil {
		switch {
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

	httpjson.WriteJSON(w, http.StatusCreated, newBuildingResponse(created))
}
