package domain_test

import (
	"testing"
	"time"

	"nexora-api-rest/internal/domain"
)

func TestStay_Invariants(t *testing.T) {
	now := time.Now().UTC()

	tests := []struct {
		name          string
		id            domain.StayID
		roomID        domain.RoomID
		reservationID domain.ReserveID
		personIDs     []domain.PersonID
		checkIn       time.Time
		checkOut      time.Time
		paymentMethod domain.PaymentMethod
		deposit       float64
		status        domain.StayStatus
		expectedError error
	}{
		{
			name:          "valid stay",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1", "person-2"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: nil,
		},
		{
			name:          "empty id",
			id:            "",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidStayID,
		},
		{
			name:          "empty room id",
			id:            "stay-1",
			roomID:        "",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCard,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidStayRoomID,
		},
		{
			name:          "empty reservation id is allowed",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodBankTransfer,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: nil,
		},
		{
			name:          "empty person ids",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     nil,
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidStayPersonID,
		},
		{
			name:          "empty person id inside the list",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1", ""},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidStayPersonID,
		},
		{
			name:          "invalid dates (checkOut before checkIn)",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(-1 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidStayDates,
		},
		{
			name:          "invalid payment method",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: "crypto",
			deposit:       50.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidPaymentMethod,
		},
		{
			name:          "negative security deposit",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       -10.0,
			status:        domain.StayStatusProgress,
			expectedError: domain.ErrInvalidSecurityDeposit,
		},
		{
			name:          "invalid status",
			id:            "stay-1",
			roomID:        "room-1",
			reservationID: "res-1",
			personIDs:     []domain.PersonID{"person-1"},
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			paymentMethod: domain.PaymentMethodCash,
			deposit:       50.0,
			status:        "unknown",
			expectedError: domain.ErrInvalidStayStatus,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := domain.NewStay(
				tt.id,
				tt.roomID,
				tt.reservationID,
				tt.personIDs,
				tt.checkIn,
				tt.checkOut,
				tt.paymentMethod,
				tt.deposit,
				"remarks",
				tt.status,
				"admin",
				now,
			)

			if tt.expectedError != nil {
				if err != tt.expectedError {
					t.Fatalf("expected error %v, got %v", tt.expectedError, err)
				}
			} else {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			}
		})
	}
}

func TestStay_Transitions(t *testing.T) {
	now := time.Now().UTC()
	stay, err := domain.NewStay(
		"stay-1",
		"room-1",
		"res-1",
		[]domain.PersonID{"person-1"},
		now,
		now.Add(24*time.Hour),
		domain.PaymentMethodCash,
		100.0,
		"",
		domain.StayStatusProgress,
		"admin",
		now,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Complete
	if err := stay.Complete(now.Add(2 * time.Hour)); err != nil {
		t.Fatalf("unexpected complete error: %v", err)
	}
	if stay.Status != domain.StayStatusCompleted {
		t.Fatalf("expected completed status, got %s", stay.Status)
	}

	// Cannot cancel completed stay
	if err := stay.Cancel("changed mind", now.Add(3*time.Hour)); err == nil {
		t.Fatal("expected error canceling completed stay, got nil")
	}

	// New stay for cancellation
	stay2, err := domain.NewStay(
		"stay-2",
		"room-1",
		"res-1",
		[]domain.PersonID{"person-1"},
		now,
		now.Add(24*time.Hour),
		domain.PaymentMethodCard,
		100.0,
		"",
		domain.StayStatusProgress,
		"admin",
		now,
	)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if err := stay2.Cancel("guest left", now.Add(1*time.Hour)); err != nil {
		t.Fatalf("unexpected cancel error: %v", err)
	}
	if stay2.Status != domain.StayStatusCanceled {
		t.Fatalf("expected canceled status, got %s", stay2.Status)
	}

	// Cannot complete canceled stay
	if err := stay2.Complete(now.Add(2 * time.Hour)); err == nil {
		t.Fatal("expected error completing canceled stay, got nil")
	}
}
