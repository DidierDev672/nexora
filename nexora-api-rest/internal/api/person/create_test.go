package person_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	personhttp "nexora-api-rest/internal/api/person"
	personapp "nexora-api-rest/internal/application/person"
	"nexora-api-rest/internal/domain"
)

type mockCreator struct {
	created domain.Person
	err     error
}

func (m *mockCreator) Create(ctx context.Context, in personapp.CreateInput) (domain.Person, error) {
	if m.err != nil {
		return domain.Person{}, m.err
	}
	return m.created, nil
}

func TestPersonHandler_Create(t *testing.T) {
	now := time.Now().UTC()
	expectedPerson := domain.Person{
		ID:             domain.PersonID("p-123"),
		DocumentType:   domain.DocumentTypeNationalID,
		DocumentNumber: "12345678",
		Name:           "Juan Perez",
		PhoneNumber:    "+5491112345678",
		Email:          "juan@example.com",
		DateOfBirth:    time.Date(1990, 5, 15, 0, 0, 0, 0, time.UTC),
		Gender:         domain.GenderMale,
		Nationality:    "Argentina",
		Roles:          []domain.RoleID{domain.RoleID("role-1")},
		CreatedBy:      "admin",
		CreatedAt:      now,
		UpdatedAt:      now,
	}

	handler := &personhttp.Handler{
		Creator: &mockCreator{created: expectedPerson},
	}

	body := map[string]any{
		"document_type":   "national_id",
		"document_number": "12345678",
		"name":            "Juan Perez",
		"phone_number":    "+5491112345678",
		"email":           "juan@example.com",
		"date_of_birth":   "1990-05-15",
		"gender":          "M",
		"nationality":     "Argentina",
		"roles":           []string{"role-1"},
		"created_by":      "admin",
	}
	raw, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("failed to marshal request body: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/persons", bytes.NewReader(raw))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()

	handler.Create(w, req)

	resp := w.Result()
	if resp.StatusCode != http.StatusCreated {
		t.Errorf("expected status 201, got %d", resp.StatusCode)
	}

	var resBody map[string]any
	if err := json.NewDecoder(resp.Body).Decode(&resBody); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if resBody["id"] != "p-123" {
		t.Errorf("expected id p-123, got %v", resBody["id"])
	}
	if resBody["document_number"] != "12345678" {
		t.Errorf("expected document_number 12345678, got %v", resBody["document_number"])
	}
}
