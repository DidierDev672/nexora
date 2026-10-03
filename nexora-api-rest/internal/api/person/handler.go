package person

import (
	"errors"
	"strings"
	"time"

	personapp "nexora-api-rest/internal/application/person"
	"nexora-api-rest/internal/domain"
)

// Handler composes the narrow use-case ports expected by the HTTP layer.
type Handler struct {
	Creator personapp.PersonCreator
	Lister  personapp.PersonLister
	Getter  personapp.PersonGetter
	Updater personapp.PersonUpdater
	Deleter personapp.PersonDeleter
}

// personResponse is the HTTP projection of the domain entity.
type personResponse struct {
	ID             string    `json:"id"`
	DocumentType   string    `json:"document_type"`
	DocumentNumber string    `json:"document_number"`
	Name           string    `json:"name"`
	PhoneNumber    string    `json:"phone_number"`
	Email          string    `json:"email"`
	DateOfBirth    time.Time `json:"date_of_birth"`
	Gender         string    `json:"gender"`
	Nationality    string    `json:"nationality"`
	Roles          []string  `json:"roles"`
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

func newPersonResponse(p domain.Person) personResponse {
	roles := make([]string, 0, len(p.Roles))
	for _, id := range p.Roles {
		roles = append(roles, string(id))
	}
	return personResponse{
		ID:             string(p.ID),
		DocumentType:   string(p.DocumentType),
		DocumentNumber: p.DocumentNumber,
		Name:           p.Name,
		PhoneNumber:    p.PhoneNumber,
		Email:          p.Email,
		DateOfBirth:    p.DateOfBirth,
		Gender:         string(p.Gender),
		Nationality:    p.Nationality,
		Roles:          roles,
		CreatedBy:      p.CreatedBy,
		CreatedAt:      p.CreatedAt,
		UpdatedAt:      p.UpdatedAt,
	}
}

// parseDate parses a date_of_birth string, accepting RFC3339 or the ISO date
// format (YYYY-MM-DD), and normalizes it to midnight UTC so only the date part
// is persisted.
func parseDate(raw string) (time.Time, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return time.Time{}, errors.New("date is required")
	}

	layouts := []string{
		time.RFC3339,
		"2006-01-02",
	}
	for _, layout := range layouts {
		if t, err := time.Parse(layout, trimmed); err == nil {
			year, month, day := t.Date()
			return time.Date(year, month, day, 0, 0, 0, 0, time.UTC), nil
		}
	}

	return time.Time{}, errors.New("date format must be RFC3339 or YYYY-MM-DD")
}
