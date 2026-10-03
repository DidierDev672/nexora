package domain

import (
	"errors"
	"strings"
	"time"
)

// DocumentType classifies the identification document a person presents.
// It is a closed enum with three sanctioned values.
type DocumentType string

const (
	DocumentTypeIDCard     DocumentType = "id_card"
	DocumentTypeNationalID DocumentType = "national_id"
	DocumentTypeForeignID  DocumentType = "foreign_id"
)

// ValidDocumentTypes enumerates the accepted document types.
var ValidDocumentTypes = []DocumentType{
	DocumentTypeIDCard,
	DocumentTypeNationalID,
	DocumentTypeForeignID,
}

// validDocumentTypeSet mirrors ValidDocumentTypes as a set for O(1) lookups.
var validDocumentTypeSet = func() map[DocumentType]struct{} {
	set := make(map[DocumentType]struct{}, len(ValidDocumentTypes))
	for _, d := range ValidDocumentTypes {
		set[d] = struct{}{}
	}
	return set
}()

// Gender classifies the legal sex of a person as requested by the hotel
// registration form. It is a closed enum with two sanctioned values: M/F.
type Gender string

const (
	GenderMale   Gender = "M"
	GenderFemale Gender = "F"
)

// ValidGenders enumerates the accepted gender values.
var ValidGenders = []Gender{
	GenderMale,
	GenderFemale,
}

// validGenderSet mirrors ValidGenders as a set for O(1) lookups.
var validGenderSet = func() map[Gender]struct{} {
	set := make(map[Gender]struct{}, len(ValidGenders))
	for _, g := range ValidGenders {
		set[g] = struct{}{}
	}
	return set
}()

// ParseGender converts a raw string into a valid gender (M or F).
func ParseGender(s string) (Gender, error) {
	gender := Gender(strings.ToUpper(strings.TrimSpace(s)))
	if !IsValidGender(gender) {
		return "", ErrInvalidPersonGender
	}
	return gender, nil
}

// IsValidGender reports whether the value belongs to the closed M/F enum.
func IsValidGender(gender Gender) bool {
	_, ok := validGenderSet[gender]
	return ok
}

// Sentinel errors represent the invariant violations of the person aggregate.
var (
	ErrPersonNotFound              = errors.New("person not found")
	ErrPersonDuplicated            = errors.New("a person with the same document type and number already exists")
	ErrInvalidPersonDocumentType   = errors.New("document type must be one of: id_card, national_id, foreign_id")
	ErrInvalidPersonDocumentNumber = errors.New("document number must not be empty")
	ErrInvalidPersonName           = errors.New("name must not be empty")
	ErrInvalidPersonPhoneNumber    = errors.New("phone number must not be empty")
	ErrInvalidPersonEmail          = errors.New("email must be a valid email address")
	ErrInvalidPersonDateOfBirth    = errors.New("date_of_birth is required")
	ErrInvalidPersonGender         = errors.New("gender must be one of: M, F")
	ErrInvalidPersonNationality    = errors.New("nationality must not be empty")
	ErrInvalidPersonRole           = errors.New("at least one role is required for a person")
	ErrInvalidPersonID             = errors.New("person id must not be empty")
)

// PersonID identifies a person within the system.
type PersonID string

// Person is the core domain entity: identification (document type + number),
// contact data (name + phone + email), demographic data (date of birth,
// gender, nationality), plus the N:N relation to the roles the person can
// hold. It mirrors the "beds -> bed types" aggregate (pivot table
// persons_roles materialises the N:N).
type Person struct {
	ID             PersonID
	DocumentType   DocumentType
	DocumentNumber string
	Name           string
	PhoneNumber    string
	Email          string
	DateOfBirth    time.Time
	Gender         Gender
	Nationality    string
	Roles          []RoleID
	CreatedBy      string
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

// NewPerson is the sanctioned constructor: it validates all invariants before
// the entity can exist, so an invalid person never reaches persistence.
func NewPerson(id PersonID, documentType DocumentType, documentNumber, name, phoneNumber, email string, dateOfBirth time.Time, gender Gender, nationality string, roles []RoleID, createdBy string, createdAt time.Time) (Person, error) {
	person := Person{
		ID:             id,
		DocumentType:   documentType,
		DocumentNumber: strings.TrimSpace(documentNumber),
		Name:           strings.TrimSpace(name),
		PhoneNumber:    strings.TrimSpace(phoneNumber),
		Email:          strings.TrimSpace(email),
		DateOfBirth:    dateOfBirth,
		Gender:         gender,
		Nationality:    strings.TrimSpace(nationality),
		Roles:          roles,
		CreatedBy:      createdBy,
		CreatedAt:      createdAt,
		UpdatedAt:      createdAt,
	}
	if err := person.Validate(); err != nil {
		return Person{}, err
	}
	return person, nil
}

// Validate enforces the business invariants of the person aggregate.
func (p Person) Validate() error {
	switch {
	case strings.TrimSpace(string(p.ID)) == "":
		return ErrInvalidPersonID
	case !IsValidDocumentType(p.DocumentType):
		return ErrInvalidPersonDocumentType
	case strings.TrimSpace(p.DocumentNumber) == "":
		return ErrInvalidPersonDocumentNumber
	case strings.TrimSpace(p.Name) == "":
		return ErrInvalidPersonName
	case strings.TrimSpace(p.PhoneNumber) == "":
		return ErrInvalidPersonPhoneNumber
	case strings.TrimSpace(p.Email) == "" || !strings.Contains(p.Email, "@"):
		return ErrInvalidPersonEmail
	case p.DateOfBirth.IsZero():
		return ErrInvalidPersonDateOfBirth
	case !IsValidGender(p.Gender):
		return ErrInvalidPersonGender
	case strings.TrimSpace(p.Nationality) == "":
		return ErrInvalidPersonNationality
	}
	return nil
}

// ParseDocumentType converts a raw string into a valid document type.
func ParseDocumentType(s string) (DocumentType, error) {
	dt := DocumentType(strings.ToLower(strings.TrimSpace(s)))
	if !IsValidDocumentType(dt) {
		return "", ErrInvalidPersonDocumentType
	}
	return dt, nil
}

// IsValidDocumentType reports whether the type is part of the closed enum.
func IsValidDocumentType(dt DocumentType) bool {
	_, ok := validDocumentTypeSet[dt]
	return ok
}

// ChangeDocument updates the identity data of the person. Side effects on the
// uniqueness (document type + number) are re-validated by the use case because
// that combination is the natural key of the aggregate.
func (p *Person) ChangeDocument(documentType DocumentType, documentNumber string) error {
	if !IsValidDocumentType(documentType) {
		return ErrInvalidPersonDocumentType
	}
	if strings.TrimSpace(documentNumber) == "" {
		return ErrInvalidPersonDocumentNumber
	}
	p.DocumentType = documentType
	p.DocumentNumber = strings.TrimSpace(documentNumber)
	return nil
}

// ChangeContact updates the contact data of the person.
func (p *Person) ChangeContact(name, phoneNumber, email string) error {
	if strings.TrimSpace(name) == "" {
		return ErrInvalidPersonName
	}
	if strings.TrimSpace(phoneNumber) == "" {
		return ErrInvalidPersonPhoneNumber
	}
	if strings.TrimSpace(email) == "" || !strings.Contains(email, "@") {
		return ErrInvalidPersonEmail
	}
	p.Name = strings.TrimSpace(name)
	p.PhoneNumber = strings.TrimSpace(phoneNumber)
	p.Email = strings.TrimSpace(email)
	return nil
}

// ChangePersonalData updates the demographic data of the person (date of
// birth, gender and nationality), enforcing the closed M/F enum and the
// non-empty nationality invariant.
func (p *Person) ChangePersonalData(dateOfBirth time.Time, gender Gender, nationality string) error {
	if dateOfBirth.IsZero() {
		return ErrInvalidPersonDateOfBirth
	}
	parsed, err := ParseGender(string(gender))
	if err != nil {
		return err
	}
	if strings.TrimSpace(nationality) == "" {
		return ErrInvalidPersonNationality
	}
	p.DateOfBirth = dateOfBirth
	p.Gender = parsed
	p.Nationality = strings.TrimSpace(nationality)
	return nil
}

// ReassignRoles replaces the full set of roles held by the person. The new set
// must be non-empty, keeping the "at least one role" invariant of the aggregate.
func (p *Person) ReassignRoles(roles []RoleID) error {
	if len(roles) == 0 {
		return ErrInvalidPersonRole
	}
	for _, id := range roles {
		if strings.TrimSpace(string(id)) == "" {
			return ErrInvalidPersonRole
		}
	}
	p.Roles = roles
	return nil
}
