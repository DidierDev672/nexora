package stay

import (
	"errors"
	"strings"
	"time"

	stayapp "nexora-api-rest/internal/application/stay"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer (ISP).
type Handler struct {
	Creator         stayapp.StayCreator
	Lister          stayapp.StayLister
	Getter          stayapp.StayGetter
	Updater         stayapp.StayUpdater
	Deleter         stayapp.StayDeleter
	ReceptionGetter stayapp.RoomReceptionGetter
	PersonsLister   stayapp.StayPersonsLister
}

// stayResponse represents the JSON projection of the stay entity.
type stayResponse struct {
	ID              string    `json:"id"`
	RoomID          string    `json:"room_id"`
	ReservationID   string    `json:"reservation_id"`
	PersonIDs       []string  `json:"person_ids"`
	CheckInDate     time.Time `json:"check_in_date"`
	CheckOutDate    time.Time `json:"check_out_date"`
	PaymentMethod   string    `json:"payment_method"`
	SecurityDeposit float64   `json:"security_deposit"`
	Remarks         string    `json:"remarks"`
	Status          string    `json:"status"`
	CreatedBy       string    `json:"created_by"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

func newStayResponse(s domain.Stay) stayResponse {
	return stayResponse{
		ID:              string(s.ID),
		RoomID:          string(s.RoomID),
		ReservationID:   string(s.ReservationID),
		PersonIDs:       toPersonIDStrings(s.PersonIDs),
		CheckInDate:     s.CheckInDate,
		CheckOutDate:    s.CheckOutDate,
		PaymentMethod:   string(s.PaymentMethod),
		SecurityDeposit: s.SecurityDeposit,
		Remarks:         s.Remarks,
		Status:          string(s.Status),
		CreatedBy:       s.CreatedBy,
		CreatedAt:       s.CreatedAt,
		UpdatedAt:       s.UpdatedAt,
	}
}

// toPersonIDs converts a raw slice of person id strings into domain.PersonID.
func toPersonIDs(raw []string) []domain.PersonID {
	ids := make([]domain.PersonID, len(raw))
	for i, v := range raw {
		ids[i] = domain.PersonID(v)
	}
	return ids
}

// toPersonIDStrings converts a slice of domain.PersonID into raw strings.
func toPersonIDStrings(ids []domain.PersonID) []string {
	raw := make([]string, len(ids))
	for i, v := range ids {
		raw[i] = string(v)
	}
	return raw
}

// parseDateTime parses date strings flexibly, accepting RFC3339 or ISO date format (YYYY-MM-DD).
func parseDateTime(raw string) (time.Time, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return time.Time{}, errors.New("date is required")
	}

	layouts := []string{
		time.RFC3339,
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"2006-01-02",
	}

	for _, layout := range layouts {
		if t, err := time.Parse(layout, trimmed); err == nil {
			return t.UTC(), nil
		}
	}

	return time.Time{}, errors.New("date format must be RFC3339 or YYYY-MM-DD")
}
