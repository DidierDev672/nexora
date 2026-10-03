package stay

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// Reception handles GET /stay/reception/{room_id}: the active stay of the
// room, which is what the reception front displays.
func (h *Handler) Reception(w http.ResponseWriter, r *http.Request) {
	roomID := domain.RoomID(r.PathValue("room_id"))

	stay, err := h.ReceptionGetter.GetByRoomID(r.Context(), roomID)
	if err != nil {
		if errors.Is(err, domain.ErrStayNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newStayResponse(stay))
}
