package domain_test

import (
	"errors"
	"testing"
	"time"

	"nexora-api-rest/internal/domain"
)

func TestNewPerson(t *testing.T) {
	now := time.Now().UTC()
	dob := time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name            string
		id              domain.PersonID
		documentType    domain.DocumentType
		documentNumber  string
		nameArg         string
		phoneNumber     string
		email           string
		dateOfBirth     time.Time
		gender          domain.Gender
		nationality     string
		roles           []domain.RoleID
		expectedError   error
		expectedTrimmed bool
	}{
		{
			name:            "valid person",
			id:              "p-1",
			documentType:    domain.DocumentTypeNationalID,
			documentNumber:  "12345678",
			nameArg:         "Juan Perez",
			phoneNumber:     "+5491112345678",
			email:           "juan@example.com",
			dateOfBirth:     dob,
			gender:          domain.GenderMale,
			nationality:     "Argentina",
			roles:           []domain.RoleID{"role-1"},
			expectedError:   nil,
			expectedTrimmed: false,
		},
		{
			name:            "whitespace is trimmed",
			id:              "p-1",
			documentType:    domain.DocumentTypeIDCard,
			documentNumber:  " 12345678 ",
			nameArg:         " Maria Gomez ",
			phoneNumber:     " +5491112345678 ",
			email:           " maria@example.com ",
			dateOfBirth:     dob,
			gender:          domain.GenderFemale,
			nationality:     "  Argentina  ",
			roles:           []domain.RoleID{"role-1"},
			expectedError:   nil,
			expectedTrimmed: true,
		},
		{
			name:           "empty id",
			id:             "",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonID,
		},
		{
			name:           "invalid document type",
			id:             "p-1",
			documentType:   domain.DocumentType("passport"),
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonDocumentType,
		},
		{
			name:           "empty document number",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonDocumentNumber,
		},
		{
			name:           "empty name",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonName,
		},
		{
			name:           "empty phone number",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonPhoneNumber,
		},
		{
			name:           "invalid email",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "not-an-email",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonEmail,
		},
		{
			name:           "zero date of birth",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    time.Time{},
			gender:         domain.GenderMale,
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonDateOfBirth,
		},
		{
			name:           "invalid gender",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.Gender("X"),
			nationality:    "Argentina",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonGender,
		},
		{
			name:           "empty nationality",
			id:             "p-1",
			documentType:   domain.DocumentTypeIDCard,
			documentNumber: "12345678",
			nameArg:        "Juan Perez",
			phoneNumber:    "+5491112345678",
			email:          "juan@example.com",
			dateOfBirth:    dob,
			gender:         domain.GenderMale,
			nationality:    "",
			roles:          []domain.RoleID{"role-1"},
			expectedError:  domain.ErrInvalidPersonNationality,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			person, err := domain.NewPerson(
				tt.id,
				tt.documentType,
				tt.documentNumber,
				tt.nameArg,
				tt.phoneNumber,
				tt.email,
				tt.dateOfBirth,
				tt.gender,
				tt.nationality,
				tt.roles,
				"admin",
				now,
			)
			if !errors.Is(err, tt.expectedError) {
				t.Fatalf("NewPerson() error = %v, want %v", err, tt.expectedError)
			}
			if tt.expectedError != nil {
				return
			}
			if tt.expectedTrimmed {
				if person.DocumentNumber != "12345678" ||
					person.Name != "Maria Gomez" ||
					person.PhoneNumber != "+5491112345678" ||
					person.Email != "maria@example.com" ||
					person.Nationality != "Argentina" {
					t.Errorf("NewPerson() did not trim whitespace: %+v", person)
				}
			}
			if person.UpdatedAt != person.CreatedAt {
				t.Errorf("NewPerson() UpdatedAt = %v, want CreatedAt %v", person.UpdatedAt, person.CreatedAt)
			}
		})
	}
}

func TestParseGender(t *testing.T) {
	tests := []struct {
		name          string
		raw           string
		expected      domain.Gender
		expectedError error
	}{
		{name: "male uppercase", raw: "M", expected: domain.GenderMale},
		{name: "male lowercase", raw: "m", expected: domain.GenderMale},
		{name: "female", raw: "f", expected: domain.GenderFemale},
		{name: "male with spaces", raw: " M ", expected: domain.GenderMale},
		{name: "invalid value", raw: "X", expectedError: domain.ErrInvalidPersonGender},
		{name: "empty", raw: "", expectedError: domain.ErrInvalidPersonGender},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gender, err := domain.ParseGender(tt.raw)
			if !errors.Is(err, tt.expectedError) {
				t.Fatalf("ParseGender() error = %v, want %v", err, tt.expectedError)
			}
			if gender != tt.expected {
				t.Errorf("ParseGender() = %q, want %q", gender, tt.expected)
			}
		})
	}
}

func TestPerson_ChangePersonalData(t *testing.T) {
	now := time.Now().UTC()
	dob := time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC)

	person, err := domain.NewPerson(
		"p-1",
		domain.DocumentTypeNationalID,
		"12345678",
		"Juan Perez",
		"+5491112345678",
		"juan@example.com",
		dob,
		domain.GenderMale,
		"Argentina",
		[]domain.RoleID{"role-1"},
		"admin",
		now,
	)
	if err != nil {
		t.Fatalf("NewPerson() error = %v", err)
	}

	t.Run("valid update", func(t *testing.T) {
		newDob := time.Date(1985, 8, 20, 0, 0, 0, 0, time.UTC)
		if err := person.ChangePersonalData(newDob, domain.GenderFemale, "Chile"); err != nil {
			t.Fatalf("ChangePersonalData() error = %v", err)
		}
		if person.DateOfBirth != newDob {
			t.Errorf("DateOfBirth = %v, want %v", person.DateOfBirth, newDob)
		}
		if person.Gender != domain.GenderFemale {
			t.Errorf("Gender = %q, want %q", person.Gender, domain.GenderFemale)
		}
		if person.Nationality != "Chile" {
			t.Errorf("Nationality = %q, want %q", person.Nationality, "Chile")
		}
	})

	t.Run("nationality is trimmed", func(t *testing.T) {
		if err := person.ChangePersonalData(dob, domain.GenderMale, "  Uruguay  "); err != nil {
			t.Fatalf("ChangePersonalData() error = %v", err)
		}
		if person.Nationality != "Uruguay" {
			t.Errorf("Nationality = %q, want %q", person.Nationality, "Uruguay")
		}
	})

	t.Run("zero date of birth", func(t *testing.T) {
		err := person.ChangePersonalData(time.Time{}, domain.GenderMale, "Argentina")
		if !errors.Is(err, domain.ErrInvalidPersonDateOfBirth) {
			t.Errorf("error = %v, want %v", err, domain.ErrInvalidPersonDateOfBirth)
		}
	})

	t.Run("invalid gender", func(t *testing.T) {
		err := person.ChangePersonalData(dob, domain.Gender("X"), "Argentina")
		if !errors.Is(err, domain.ErrInvalidPersonGender) {
			t.Errorf("error = %v, want %v", err, domain.ErrInvalidPersonGender)
		}
	})

	t.Run("empty nationality", func(t *testing.T) {
		err := person.ChangePersonalData(dob, domain.GenderMale, "")
		if !errors.Is(err, domain.ErrInvalidPersonNationality) {
			t.Errorf("error = %v, want %v", err, domain.ErrInvalidPersonNationality)
		}
	})
}
