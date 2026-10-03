package headquarter

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	headquarterapp "nexora-api-rest/internal/application/headquarter"
	"nexora-api-rest/internal/domain"
)

type updateHeadquarterRequest struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	City    string `json:"city"`
	Phone   string `json:"phone"`
	Status  string `json:"status"`
}

// Update is the HTTP entry point of the "update headquarter" slice.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.HeadquarterID(r.PathValue("id"))

	var req updateHeadquarterRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), headquarterapp.UpdateInput{
		ID:      id,
		Name:    req.Name,
		Address: req.Address,
		City:    req.City,
		Phone:   req.Phone,
		Status:  req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrHeadquarterNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrHeadquarterDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newHeadquarterResponse(updated))
}

func isValidationError(err error) bool {
	return errors.Is(err, domain.ErrInvalidHeadquarterName) ||
		errors.Is(err, domain.ErrInvalidHeadquarterAddress) ||
		errors.Is(err, domain.ErrInvalidHeadquarterCity) ||
		errors.Is(err, domain.ErrInvalidHeadquarterStatus)
}
