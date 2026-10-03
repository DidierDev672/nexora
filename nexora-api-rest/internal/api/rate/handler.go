package rate

import (
	"errors"
	"net/http"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	rateapp "nexora-api-rest/internal/application/rate"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer (ISP).
type Handler struct {
	Creator rateapp.RateCreator
	Lister  rateapp.RateLister
	Getter  rateapp.RateGetter
	Updater rateapp.RateUpdater
	Deleter rateapp.RateDeleter
}

// rateResponse represents the JSON projection of the rate entity.
type rateResponse struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	HeadquarterID    string    `json:"headquarter_id"`
	SubHeadquarterID *string   `json:"subheadquarter_id"`
	RoomTypeID       *string   `json:"room_type_id"`
	Modality         string    `json:"modality"`
	Price            float64   `json:"price"`
	DurationUnits    int       `json:"duration_units"`
	StartTime        *string   `json:"start_time"`
	EndTime          *string   `json:"end_time"`
	DaysOfWeek       string    `json:"days_of_week"`
	Status           string    `json:"status"`
	CreatedBy        string    `json:"created_by"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func newRateResponse(r domain.Rate) rateResponse {
	response := rateResponse{
		ID:            string(r.ID),
		Name:          r.Name,
		HeadquarterID: string(r.HeadquarterID),
		Modality:      string(r.Modality),
		Price:         float64(r.Price),
		DurationUnits: r.DurationUnits,
		StartTime:     r.StartTime,
		EndTime:       r.EndTime,
		DaysOfWeek:    r.DaysOfWeek,
		Status:        string(r.Status),
		CreatedBy:     r.CreatedBy,
		CreatedAt:     r.CreatedAt,
		UpdatedAt:     r.UpdatedAt,
	}

	if r.SubHeadquarterID != nil {
		subHeadquarterID := string(*r.SubHeadquarterID)
		response.SubHeadquarterID = &subHeadquarterID
	}
	if r.RoomTypeID != nil {
		roomTypeID := string(*r.RoomTypeID)
		response.RoomTypeID = &roomTypeID
	}

	return response
}

// writeRateError translates a domain or use case failure into an HTTP status:
// a rejected payload is a 422, a missing rate is a 404 and anything else is an
// opaque 500 so internal details never leak to the client.
func writeRateError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrRateNotFound):
		httpjson.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, domain.ErrInvalidRateID),
		errors.Is(err, domain.ErrInvalidRateName),
		errors.Is(err, domain.ErrInvalidRateHeadquarterID),
		errors.Is(err, domain.ErrInvalidRateModality),
		errors.Is(err, domain.ErrInvalidRatePrice),
		errors.Is(err, domain.ErrInvalidRateDurationUnits),
		errors.Is(err, domain.ErrInvalidRateStatus),
		errors.Is(err, domain.ErrInvalidRateTimeFormat),
		errors.Is(err, domain.ErrInvalidRateDaysOfWeek):
		httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
