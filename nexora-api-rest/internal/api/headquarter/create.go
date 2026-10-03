package headquarter

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	headquarterapp "nexora-api-rest/internal/application/headquarter"
	"nexora-api-rest/internal/domain"
)

type createHeadquarterRequest struct {
	Name      string `json:"name"`
	Address   string `json:"address"`
	City      string `json:"city"`
	Phone     string `json:"phone"`
	Status    string `json:"status"`
	CreatedBy string `json:"created_by"`
}

// Create is the HTTP entry point of the "create headquarter" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createHeadquarterRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), headquarterapp.CreateInput{
		Name:      req.Name,
		Address:   req.Address,
		City:      req.City,
		Phone:     req.Phone,
		Status:    req.Status,
		CreatedBy: req.CreatedBy,
	})
	if err != nil {
		switch {
		case isValidationError(err):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrHeadquarterDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newHeadquarterResponse(created))
}
