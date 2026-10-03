package bedtype

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	bedtypeapp "nexora-api-rest/internal/application/bedtype"
	"nexora-api-rest/internal/domain"
)

type updateBedTypeRequest struct {
	Name           string  `json:"name"`
	CapacityPeople *int    `json:"capacity_people"`
	Description    *string `json:"description"`
}

// Update is the HTTP entry point of the "update bed type" slice (PUT).
// Only fields present in the request are applied; omitted ones keep their
// current value. null is treated as omitted.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.BedTypeID(r.PathValue("id"))

	var req updateBedTypeRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), bedtypeapp.UpdateInput{
		ID:             id,
		Name:           req.Name,
		CapacityPeople: req.CapacityPeople,
		Description:    req.Description,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrBedTypeNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
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

	httpjson.WriteJSON(w, http.StatusOK, newBedTypeResponse(updated))
}
