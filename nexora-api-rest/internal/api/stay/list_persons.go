package stay

import (
	"errors"
	"net/http"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	"nexora-api-rest/internal/domain"
)

// stayPerson is the HTTP projection of a person linked to a stay.
type stayPerson struct {
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

func newStayPerson(p domain.Person) stayPerson {
	roles := make([]string, 0, len(p.Roles))
	for _, id := range p.Roles {
		roles = append(roles, string(id))
	}
	return stayPerson{
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

// StayPersons handles GET /stays_person/{stay_id}: the persons of a stay.
func (h *Handler) StayPersons(w http.ResponseWriter, r *http.Request) {
	stayID := domain.StayID(r.PathValue("stay_id"))
	if stayID == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "stay id is required")
		return
	}

	persons, err := h.PersonsLister.ListByStay(r.Context(), stayID)
	if err != nil {
		if errors.Is(err, domain.ErrStayNotFound) {
			httpjson.WriteError(w, http.StatusNotFound, err.Error())
			return
		}
		httpjson.WriteInternalError(w, err)
		return
	}

	response := make([]stayPerson, 0, len(persons))
	for _, p := range persons {
		response = append(response, newStayPerson(p))
	}
	httpjson.WriteJSON(w, http.StatusOK, response)
}
