package person

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"nexora-api-rest/internal/api/httpjson"
	personapp "nexora-api-rest/internal/application/person"
	"nexora-api-rest/internal/domain"
)

type updatePersonRequest struct {
	DocumentType   string   `json:"document_type"`
	DocumentNumber string   `json:"document_number"`
	Name           string   `json:"name"`
	PhoneNumber    string   `json:"phone_number"`
	Email          string   `json:"email"`
	DateOfBirth    string   `json:"date_of_birth"`
	Gender         string   `json:"gender"`
	Nationality    string   `json:"nationality"`
	Roles          []string `json:"roles"`
}

// Update is the HTTP entry point for updating a person.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if id == "" {
		httpjson.WriteError(w, http.StatusBadRequest, "person id is required")
		return
	}

	var req updatePersonRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	var dob time.Time
	if strings.TrimSpace(req.DateOfBirth) != "" {
		parsed, err := parseDate(req.DateOfBirth)
		if err != nil {
			httpjson.WriteError(w, http.StatusUnprocessableEntity, "invalid date_of_birth: "+err.Error())
			return
		}
		dob = parsed
	}

	roles := make([]domain.RoleID, 0, len(req.Roles))
	for _, rid := range req.Roles {
		roles = append(roles, domain.RoleID(rid))
	}

	updated, err := h.Updater.Update(r.Context(), personapp.UpdateInput{
		ID:             domain.PersonID(id),
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		Name:           req.Name,
		PhoneNumber:    req.PhoneNumber,
		Email:          req.Email,
		DateOfBirth:    dob,
		Gender:         req.Gender,
		Nationality:    req.Nationality,
		Roles:          roles,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrPersonNotFound):
			httpjson.WriteError(w, http.StatusNotFound, "person not found")
		case errors.Is(err, domain.ErrInvalidPersonDocumentType),
			errors.Is(err, domain.ErrInvalidPersonDocumentNumber),
			errors.Is(err, domain.ErrInvalidPersonName),
			errors.Is(err, domain.ErrInvalidPersonPhoneNumber),
			errors.Is(err, domain.ErrInvalidPersonEmail),
			errors.Is(err, domain.ErrInvalidPersonDateOfBirth),
			errors.Is(err, domain.ErrInvalidPersonGender),
			errors.Is(err, domain.ErrInvalidPersonNationality),
			errors.Is(err, domain.ErrInvalidPersonRole):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrPersonDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newPersonResponse(updated))
}
