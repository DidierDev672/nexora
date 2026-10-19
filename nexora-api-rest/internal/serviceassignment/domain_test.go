package serviceassignment_test

import (
	"testing"
	"time"

	"nexora-api-rest/internal/serviceassignment"
)

func TestNewServiceAssignment_Success(t *testing.T) {
	now := time.Now().UTC()
	a, err := serviceassignment.NewServiceAssignment(
		"assign-1",
		"sr-100",
		"stay-200",
		"person-300",
		true,
		now,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if a.ID != "assign-1" {
		t.Errorf("expected id assign-1, got %s", a.ID)
	}
	if a.ServiceRequestID != "sr-100" {
		t.Errorf("expected sr-100, got %s", a.ServiceRequestID)
	}
	if a.StayID != "stay-200" {
		t.Errorf("expected stay-200, got %s", a.StayID)
	}
	if a.PersonID != "person-300" {
		t.Errorf("expected person-300, got %s", a.PersonID)
	}
	if !a.IsActive {
		t.Errorf("expected isActive=true")
	}
}

func TestNewServiceAssignment_ValidationErrors(t *testing.T) {
	now := time.Now().UTC()

	tests := []struct {
		name             string
		id               serviceassignment.ID
		serviceRequestID string
		stayID           string
		personID         string
		expectedErr      error
	}{
		{
			name:             "empty id",
			id:               "   ",
			serviceRequestID: "sr-1",
			stayID:           "stay-1",
			personID:         "per-1",
			expectedErr:      serviceassignment.ErrInvalidID,
		},
		{
			name:             "empty service_request_id",
			id:               "id-1",
			serviceRequestID: "   ",
			stayID:           "stay-1",
			personID:         "per-1",
			expectedErr:      serviceassignment.ErrInvalidServiceRequestID,
		},
		{
			name:             "empty stay_id",
			id:               "id-1",
			serviceRequestID: "sr-1",
			stayID:           "   ",
			personID:         "per-1",
			expectedErr:      serviceassignment.ErrInvalidStayID,
		},
		{
			name:             "empty person_id",
			id:               "id-1",
			serviceRequestID: "sr-1",
			stayID:           "stay-1",
			personID:         "   ",
			expectedErr:      serviceassignment.ErrInvalidPersonID,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := serviceassignment.NewServiceAssignment(
				tt.id,
				tt.serviceRequestID,
				tt.stayID,
				tt.personID,
				true,
				now,
			)
			if err != tt.expectedErr {
				t.Errorf("expected %v, got %v", tt.expectedErr, err)
			}
		})
	}
}
