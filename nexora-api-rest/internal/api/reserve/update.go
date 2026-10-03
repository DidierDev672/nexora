package reserve

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	reserveapp "nexora-api-rest/internal/application/reserve"
	"nexora-api-rest/internal/domain"
)

type updateReserveRequest struct {
	ID             string   `json:"id"`
	RoomID         string   `json:"room_id"`
	PersonID       string   `json:"person_id"`
	CheckInDate    string   `json:"check_in_date"`
	CheckOutDate   string   `json:"check_out_date"`
	NumberOfGuests int      `json:"number_of_guests"`
	State          string   `json:"state"`
	TotalPrice     *float64 `json:"total_price"`
}

// Update handles PUT /reserve/{id} (and PUT /reserve with id in body).
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.ReserveID(r.PathValue("id"))

	var req updateReserveRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if id == "" {
		id = domain.ReserveID(req.ID)
	}
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "id is required")
		return
	}

	var checkIn time.Time
	if strings.TrimSpace(req.CheckInDate) != "" {
		parsed, err := parseDateTime(req.CheckInDate)
		if err != nil {
			httpjson.WriteError(w, http.StatusUnprocessableEntity, "invalid check_in_date: "+err.Error())
			return
		}
		checkIn = parsed
	}

	var checkOut time.Time
	if strings.TrimSpace(req.CheckOutDate) != "" {
		parsed, err := parseDateTime(req.CheckOutDate)
		if err != nil {
			httpjson.WriteError(w, http.StatusUnprocessableEntity, "invalid check_out_date: "+err.Error())
			return
		}
		checkOut = parsed
	}

	totalPrice := 0.0
	if req.TotalPrice != nil {
		totalPrice = *req.TotalPrice
	}

	updated, err := h.Updater.Update(r.Context(), reserveapp.UpdateInput{
		ID:             id,
		RoomID:         domain.RoomID(req.RoomID),
		PersonID:       domain.PersonID(req.PersonID),
		CheckInDate:    checkIn,
		CheckOutDate:   checkOut,
		NumberOfGuests: req.NumberOfGuests,
		State:          req.State,
		TotalPrice:     totalPrice,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrReserveNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidReserveID),
			errors.Is(err, domain.ErrInvalidReserveRoomID),
			errors.Is(err, domain.ErrInvalidReservePersonID),
			errors.Is(err, domain.ErrInvalidReservationDates),
			errors.Is(err, domain.ErrInvalidGuestsNumber),
			errors.Is(err, domain.ErrInvalidReserveState),
			errors.Is(err, domain.ErrInvalidTotalPrice):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newReserveResponse(updated))
}
