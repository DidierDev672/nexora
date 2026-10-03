package domain_test

import (
	"testing"
	"time"

	"nexora-api-rest/internal/domain"
)

func TestReserve_Invariants(t *testing.T) {
	now := time.Now().UTC()

	tests := []struct {
		name          string
		id            domain.ReserveID
		roomID        domain.RoomID
		personID      domain.PersonID
		checkIn       time.Time
		checkOut      time.Time
		guests        int
		state         domain.ReserveState
		price         float64
		expectedError error
	}{
		{
			name:          "valid reservation",
			id:            "res-1",
			roomID:        "room-1",
			personID:      "person-1",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        2,
			state:         domain.ReserveStatePending,
			price:         100.0,
			expectedError: nil,
		},
		{
			name:          "empty id",
			id:            "",
			roomID:        "room-1",
			personID:      "person-1",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        2,
			state:         domain.ReserveStatePending,
			price:         100.0,
			expectedError: domain.ErrInvalidReserveID,
		},
		{
			name:          "empty room id",
			id:            "res-1",
			roomID:        "",
			personID:      "person-1",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        2,
			state:         domain.ReserveStatePending,
			price:         100.0,
			expectedError: domain.ErrInvalidReserveRoomID,
		},
		{
			name:          "empty person id",
			id:            "res-1",
			roomID:        "room-1",
			personID:      "",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        2,
			state:         domain.ReserveStatePending,
			price:         100.0,
			expectedError: domain.ErrInvalidReservePersonID,
		},
		{
			name:          "checkout before checkin",
			id:            "res-1",
			roomID:        "room-1",
			personID:      "person-1",
			checkIn:       now.Add(24 * time.Hour),
			checkOut:      now,
			guests:        2,
			state:         domain.ReserveStatePending,
			price:         100.0,
			expectedError: domain.ErrInvalidReservationDates,
		},
		{
			name:          "zero guests",
			id:            "res-1",
			roomID:        "room-1",
			personID:      "person-1",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        0,
			state:         domain.ReserveStatePending,
			price:         100.0,
			expectedError: domain.ErrInvalidGuestsNumber,
		},
		{
			name:          "invalid state",
			id:            "res-1",
			roomID:        "room-1",
			personID:      "person-1",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        2,
			state:         domain.ReserveState("unknown"),
			price:         100.0,
			expectedError: domain.ErrInvalidReserveState,
		},
		{
			name:          "negative price",
			id:            "res-1",
			roomID:        "room-1",
			personID:      "person-1",
			checkIn:       now,
			checkOut:      now.Add(24 * time.Hour),
			guests:        2,
			state:         domain.ReserveStateConfirmed,
			price:         -50.0,
			expectedError: domain.ErrInvalidTotalPrice,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := domain.NewReserve(
				tt.id,
				tt.roomID,
				tt.personID,
				tt.checkIn,
				tt.checkOut,
				tt.guests,
				tt.state,
				tt.price,
				"system",
				now,
			)

			if tt.expectedError != nil && err != tt.expectedError {
				t.Errorf("expected error %v, got %v", tt.expectedError, err)
			}
			if tt.expectedError == nil && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}
