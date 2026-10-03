package subheadquarter

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	subheadquarterapp "nexora-api-rest/internal/application/subheadquarter"
	"nexora-api-rest/internal/domain"
)

type createSubHeadquarterRequest struct {
	HeadquarterID string `json:"headquarter_id"`
	Name          string `json:"name"`
	Address       string `json:"address"`
	Phone         string `json:"phone"`
	Status        string `json:"status"`
	CreatedBy     string `json:"created_by"`
}

// Create is the HTTP entry point of the "create sub headquarter" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createSubHeadquarterRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), subheadquarterapp.CreateInput{
		HeadquarterID: domain.HeadquarterID(req.HeadquarterID),
		Name:          req.Name,
		Address:       req.Address,
		Phone:         req.Phone,
		Status:        req.Status,
		CreatedBy:     req.CreatedBy,
	})
	if err != nil {
		switch {
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrSubHeadquarterDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newSubHeadquarterResponse(created))
}
