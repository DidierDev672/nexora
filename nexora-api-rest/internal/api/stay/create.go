package stay

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	stayapp "nexora-api-rest/internal/application/stay"
	"nexora-api-rest/internal/domain"
)

type createStayRequest struct {
	RoomID          string   `json:"room_id"`
	ReservationID   string   `json:"reservation_id"`
	PersonIDs       []string `json:"person_ids"`
	CheckInDate     string   `json:"check_in_date"`
	CheckOutDate    string   `json:"check_out_date"`
	PaymentMethod   string   `json:"payment_method"`
	SecurityDeposit *float64 `json:"security_deposit"`
	Remarks         string   `json:"remarks"`
	Status          string   `json:"status"`
	CreatedBy       string   `json:"created_by"`
}

// Create handles POST /stays (and POST /stay).
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createStayRequest
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

	securityDeposit := 0.0
	if req.SecurityDeposit != nil {
		securityDeposit = *req.SecurityDeposit
	}

	created, err := h.Creator.Create(r.Context(), stayapp.CreateInput{
		RoomID:          domain.RoomID(req.RoomID),
		ReservationID:   domain.ReserveID(req.ReservationID),
		PersonIDs:       toPersonIDs(req.PersonIDs),
		CheckInDate:     checkIn,
		CheckOutDate:    checkOut,
		PaymentMethod:   req.PaymentMethod,
		SecurityDeposit: securityDeposit,
		Remarks:         req.Remarks,
		Status:          req.Status,
		CreatedBy:       req.CreatedBy,
	})
	if err != nil {
		switch {
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

	httpjson.WriteJSON(w, http.StatusCreated, newStayResponse(created))
}
