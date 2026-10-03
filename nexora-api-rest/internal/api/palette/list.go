package palette

import (
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
)

// List is the HTTP entry point of the "list palettes" slice.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	palettes, err := h.Lister.List(r.Context())
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	resp := make([]paletteResponse, 0, len(palettes))
	for _, p := range palettes {
		resp = append(resp, newPaletteResponse(p))
	}
	httpjson.WriteJSON(w, http.StatusOK, resp)
}
