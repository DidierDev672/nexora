package stay

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	stayapp "nexora-api-rest/internal/application/stay"
	"nexora-api-rest/internal/domain"
)

type updateStayRequest struct {
	ID              string   `json:"id"`
	RoomID          string   `json:"room_id"`
	ReservationID   string   `json:"reservation_id"`
	PersonIDs       []string `json:"person_ids"`
	CheckInDate     string   `json:"check_in_date"`
	CheckOutDate    string   `json:"check_out_date"`
	PaymentMethod   string   `json:"payment_method"`
	SecurityDeposit *float64 `json:"security_deposit"`
	Remarks         string   `json:"remarks"`
	Status          string   `json:"status"`
}

// Update handles PUT /stays/{id} (and PUT /stays with id in body).
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := domain.StayID(r.PathValue("id"))

	var req updateStayRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	if id == "" {
		id = domain.StayID(req.ID)
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

	securityDeposit := 0.0
	if req.SecurityDeposit != nil {
		securityDeposit = *req.SecurityDeposit
	}

	updated, err := h.Updater.Update(r.Context(), stayapp.UpdateInput{
		ID:              id,
		RoomID:          domain.RoomID(req.RoomID),
		ReservationID:   domain.ReserveID(req.ReservationID),
		PersonIDs:       toPersonIDs(req.PersonIDs),
		CheckInDate:     checkIn,
		CheckOutDate:    checkOut,
		PaymentMethod:   req.PaymentMethod,
		SecurityDeposit: securityDeposit,
		Remarks:         req.Remarks,
		Status:          req.Status,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrStayNotFound):
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
		case errors.Is(err, domain.ErrInvalidStayID),
			errors.Is(err, domain.ErrInvalidStayRoomID),
			errors.Is(err, domain.ErrInvalidStayReservationID),
			errors.Is(err, domain.ErrInvalidStayPersonID),
			errors.Is(err, domain.ErrInvalidStayDates),
			errors.Is(err, domain.ErrInvalidPaymentMethod),
			errors.Is(err, domain.ErrInvalidSecurityDeposit),
			errors.Is(err, domain.ErrInvalidStayStatus):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newStayResponse(updated))
}
