package palette

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	paletteapp "nexora-api-rest/internal/application/palette"
	"nexora-api-rest/internal/domain"
)

type colorRequest struct {
	Hex  string `json:"hex"`
	Name string `json:"name"`
}

type createPaletteRequest struct {
	Name      string         `json:"name"`
	Colors    []colorRequest `json:"colors"`
	IsDefined bool           `json:"is_defined"`
}

// Create is the HTTP entry point of the "create palette" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createPaletteRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	created, err := h.Creator.Create(r.Context(), paletteapp.CreateInput{
		Name:      req.Name,
		Colors:    toColorInputs(req.Colors),
		IsDefined: req.IsDefined,
	})
	if err != nil {
		switch {
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

	httpjson.WriteJSON(w, http.StatusCreated, newPaletteResponse(created))
}

// toColorInputs adapts the HTTP projection to the use case input.
func toColorInputs(reqs []colorRequest) []paletteapp.ColorInput {
	inputs := make([]paletteapp.ColorInput, 0, len(reqs))
	for _, c := range reqs {
		inputs = append(inputs, paletteapp.ColorInput{Hex: c.Hex, Name: c.Name})
	}
	return inputs
}
