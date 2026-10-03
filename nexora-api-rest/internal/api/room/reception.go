package room

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// receptionResponse is the HTTP projection of the room's reception flag.
type receptionResponse struct {
	RoomID       string `json:"room_id"`
	HasReception bool   `json:"has_reception"`
}

// Reception handles GET /rooms/{id}/reception: whether the room counts with
// a reception point.
func (h *Handler) Reception(w http.ResponseWriter, r *http.Request) {
	id := domain.RoomID(r.PathValue("id"))

	item, err := h.Getter.GetByID(r.Context(), id)
	if err != nil {
		if errors.Is(err, domain.ErrRoomNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, receptionResponse{
		RoomID:       string(item.ID),
		HasReception: item.HasReception,
	})
}
