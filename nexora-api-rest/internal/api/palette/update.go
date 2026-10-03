package palette

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	paletteapp "nexora-api-rest/internal/application/palette"
	"nexora-api-rest/internal/domain"
)

type updatePaletteRequest struct {
	Name      string         `json:"name"`
	Colors    []colorRequest `json:"colors"`
	IsDefined bool           `json:"is_defined"`
}

// Update is the HTTP entry point of the "update palette" slice.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.PaletteID(r.PathValue("id"))

	var req updatePaletteRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	updated, err := h.Updater.Update(r.Context(), paletteapp.UpdateInput{
		ID:        id,
		Name:      req.Name,
		Colors:    toColorInputs(req.Colors),
		IsDefined: req.IsDefined,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPaletteNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidPaletteName):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrInvalidPaletteColor):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrDuplicatedPaletteColor):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrTooManyPaletteColors):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrPaletteDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newPaletteResponse(updated))
}
