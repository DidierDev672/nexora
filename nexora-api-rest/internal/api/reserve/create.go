package reserve

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	reserveapp "nexora-api-rest/internal/application/reserve"
	"nexora-api-rest/internal/domain"
)

type createReserveRequest struct {
	RoomID         string   `json:"room_id"`
	PersonID       string   `json:"person_id"`
	CheckInDate    string   `json:"check_in_date"`
	CheckOutDate   string   `json:"check_out_date"`
	NumberOfGuests int      `json:"number_of_guests"`
	State          string   `json:"state"`
	TotalPrice     *float64 `json:"total_price"`
	CreatedBy      string   `json:"created_by"`
}

// Create handles POST /reserve.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createReserveRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	checkIn, err := parseDateTime(req.CheckInDate)
	if err != nil {
		httpjson.WriteError(w, http.StatusUnprocessableEntity, "invalid check_in_date: "+err.Error())
		return
	}

	checkOut, err := parseDateTime(req.CheckOutDate)
	if err != nil {
		httpjson.WriteError(w, http.StatusUnprocessableEntity, "invalid check_out_date: "+err.Error())
		return
	}

	totalPrice := 0.0
	if req.TotalPrice != nil {
		totalPrice = *req.TotalPrice
	}

	created, err := h.Creator.Create(r.Context(), reserveapp.CreateInput{
		RoomID:         domain.RoomID(req.RoomID),
		PersonID:       domain.PersonID(req.PersonID),
		CheckInDate:    checkIn,
		CheckOutDate:   checkOut,
		NumberOfGuests: req.NumberOfGuests,
		State:          req.State,
		TotalPrice:     totalPrice,
		CreatedBy:      req.CreatedBy,
	})
	if err != nil {
		switch {
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

	httpjson.WriteJSON(w, http.StatusCreated, newReserveResponse(created))
}
