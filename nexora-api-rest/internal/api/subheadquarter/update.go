package subheadquarter

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	subheadquarterapp "nexora-api-rest/internal/application/subheadquarter"
	"nexora-api-rest/internal/domain"
)

type updateSubHeadquarterRequest struct {
	HeadquarterID string `json:"headquarter_id"`
	Name          string `json:"name"`
	Address       string `json:"address"`
	Phone         string `json:"phone"`
	Status        string `json:"status"`
}

// Update is the HTTP entry point of the "update sub headquarter" slice.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.SubHeadquarterID(r.PathValue("id"))

	var req updateSubHeadquarterRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), subheadquarterapp.UpdateInput{
		ID:            id,
		HeadquarterID: domain.HeadquarterID(req.HeadquarterID),
		Name:          req.Name,
		Address:       req.Address,
		Phone:         req.Phone,
		Status:        req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrSubHeadquarterNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrSubHeadquarterDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newSubHeadquarterResponse(updated))
}

func isValidationError(err error) bool {
	return errors.Is(err, domain.ErrInvalidSubHeadquarterHeadquarterID) ||
		errors.Is(err, domain.ErrInvalidSubHeadquarterName) ||
		errors.Is(err, domain.ErrInvalidSubHeadquarterAddress) ||
		errors.Is(err, domain.ErrInvalidSubHeadquarterStatus)
}
