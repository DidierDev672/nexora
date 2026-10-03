package room

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Delete is the HTTP entry point of the "delete room" slice.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomID(r.PathValue("id"))

	if err := h.Deleter.Delete(r.Context(), id); err != nil {
		if errors.Is(err, domain.ErrRoomNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
