package palette

import (
	"time"

	paletteapp "nexora-api-rest/internal/application/palette"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator paletteapp.PaletteCreator
	Lister  paletteapp.PaletteLister
	Getter  paletteapp.PaletteGetter
	Updater paletteapp.PaletteUpdater
	Deleter paletteapp.PaletteDeleter
}

// colorResponse is the HTTP projection of the domain value object.
type colorResponse struct {
	Hex  string `json:"hex"`
	Name string `json:"name"`
}

// paletteResponse is the HTTP projection of the domain entity.
type paletteResponse struct {
	ID        string          `json:"id"`
	Name      string          `json:"name"`
	Colors    []colorResponse `json:"colors"`
	IsDefined bool            `json:"is_defined"`
	CreatedAt time.Time       `json:"created_at"`
}

func newColorResponse(c domain.Color) colorResponse {
	return colorResponse{Hex: c.Hex, Name: c.Name}
}

func newPaletteResponse(p domain.Palette) paletteResponse {
	resp := paletteResponse{
		ID:        string(p.ID),
		Name:      p.Name,
		IsDefined: p.IsDefined,
		CreatedAt: p.CreatedAt,
		Colors:    make([]colorResponse, 0, len(p.Colors)),
	}
	for _, c := range p.Colors {
		resp.Colors = append(resp.Colors, newColorResponse(c))
	}
	return resp
}
