package person

import (
	"errors"
	"net/http"

	"nexora-api-rest/internal/api/httpjson"
	personapp "nexora-api-rest/internal/application/person"
	"nexora-api-rest/internal/domain"
)

type createPersonRequest struct {
	DocumentType   string   `json:"document_type"`
	DocumentNumber string   `json:"document_number"`
	Name           string   `json:"name"`
	PhoneNumber    string   `json:"phone_number"`
	Email          string   `json:"email"`
	DateOfBirth    string   `json:"date_of_birth"`
	Gender         string   `json:"gender"`
	Nationality    string   `json:"nationality"`
	Roles          []string `json:"roles"`
	CreatedBy      string   `json:"created_by"`
}

// Create is the HTTP entry point of the "create person" slice.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req createPersonRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	dob, err := parseDate(req.DateOfBirth)
	if err != nil {
		httpjson.WriteError(w, http.StatusUnprocessableEntity, "invalid date_of_birth: "+err.Error())
		return
	}

	roles := make([]domain.RoleID, 0, len(req.Roles))
	for _, id := range req.Roles {
		roles = append(roles, domain.RoleID(id))
	}

	created, err := h.Creator.Create(r.Context(), personapp.CreateInput{
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		Name:           req.Name,
		PhoneNumber:    req.PhoneNumber,
		Email:          req.Email,
		DateOfBirth:    dob,
		Gender:         req.Gender,
		Nationality:    req.Nationality,
		Roles:          roles,
		CreatedBy:      req.CreatedBy,
	})
	if err != nil {
		switch {
		case errors.Is(err, domain.ErrInvalidPersonDocumentType),
			errors.Is(err, domain.ErrInvalidPersonDocumentNumber),
			errors.Is(err, domain.ErrInvalidPersonName),
			errors.Is(err, domain.ErrInvalidPersonPhoneNumber),
			errors.Is(err, domain.ErrInvalidPersonEmail),
			errors.Is(err, domain.ErrInvalidPersonDateOfBirth),
			errors.Is(err, domain.ErrInvalidPersonGender),
			errors.Is(err, domain.ErrInvalidPersonNationality),
			errors.Is(err, domain.ErrInvalidPersonRole),
			errors.Is(err, domain.ErrInvalidPersonID):
			httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
		case errors.Is(err, domain.ErrPersonDuplicated):
			httpjson.WriteError(w, http.StatusConflict, err.Error())
		default:
			httpjson.WriteInternalError(w, err)
		}
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newPersonResponse(created))
}
