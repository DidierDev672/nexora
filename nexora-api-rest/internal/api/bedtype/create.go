package bedtype

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	bedtypeapp "nexora-api-rest/internal/application/bedtype"
	"nexora-api-rest/internal/domain"
)

type createBedTypeRequest struct {
	Name           string `json:"name"`
	CapacityPeople int    `json:"capacity_people"`
	Description    string `json:"description"`
	CreatedBy      string `json:"created_by"`
}

// Create is the HTTP entry point of the "create bed type" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createBedTypeRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), bedtypeapp.CreateInput{
		Name:           req.Name,
		CapacityPeople: req.CapacityPeople,
		Description:    req.Description,
		CreatedBy:      req.CreatedBy,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidBedTypeName),
			errors.Is(err, domain.ErrInvalidBedTypeCapacity):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrBedTypeDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newBedTypeResponse(created))
}
