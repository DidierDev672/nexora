package domain_test

import (
	"errors"
	"testing"
	"time"

	"nexora-api-rest/internal/domain"
)

func TestNewRoomTariff_Valid(t *testing.T) {
	tariff, err := domain.NewRoomTariff(
		"tariff-1",
		"room-1",
		"rate-1",
		true,
		domain.RoomTariffStatusActive,
		"admin",
		time.Now().UTC(),
	)
	if err != nil {
		t.Fatalf("expected valid room tariff, got %v", err)
	}
	if !tariff.IsDefault {
		t.Fatal("expected is_default true")
	}
	if tariff.Status != domain.RoomTariffStatusActive {
		t.Fatalf("expected active status, got %q", tariff.Status)
	}
}

func TestNewRoomTariff_Invariants(t *testing.T) {
	now := time.Now().UTC()

	tests := []struct {
		name string
		in   func() (domain.RoomTariff, error)
		want error
	}{
		{
			name: "empty id",
			in: func() (domain.RoomTariff, error) {
				return domain.NewRoomTariff("", "room-1", "rate-1", false, domain.RoomTariffStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRoomTariffID,
		},
		{
			name: "missing room",
			in: func() (domain.RoomTariff, error) {
				return domain.NewRoomTariff("tariff-1", "", "rate-1", false, domain.RoomTariffStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRoomTariffRoomID,
		},
		{
			name: "missing rate",
			in: func() (domain.RoomTariff, error) {
				return domain.NewRoomTariff("tariff-1", "room-1", "", false, domain.RoomTariffStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRoomTariffRateID,
		},
		{
			name: "invalid status",
			in: func() (domain.RoomTariff, error) {
				return domain.NewRoomTariff("tariff-1", "room-1", "rate-1", false, "archived", "admin", now)
			},
			want: domain.ErrInvalidRoomTariffStatus,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := tt.in()
			if !errors.Is(err, tt.want) {
				t.Fatalf("expected %v, got %v", tt.want, err)
			}
		})
	}
}

func TestParseRoomTariffStatus(t *testing.T) {
	tests := []struct {
		raw  string
		want domain.RoomTariffStatus
		err  bool
	}{
		{raw: "active", want: domain.RoomTariffStatusActive},
		{raw: "Active", want: domain.RoomTariffStatusActive},
		{raw: "  ACTIVE  ", want: domain.RoomTariffStatusActive},
		{raw: "inactive", want: domain.RoomTariffStatusInactive},
		{raw: "archived", err: true},
		{raw: "", err: true},
	}

	for _, tt := range tests {
		got, err := domain.ParseRoomTariffStatus(tt.raw)
		if tt.err {
			if err == nil {
				t.Fatalf("expected error for %q, got %q", tt.raw, got)
			}
			continue
		}
		if err != nil {
			t.Fatalf("unexpected error for %q: %v", tt.raw, err)
		}
		if got != tt.want {
			t.Fatalf("expected %q for %q, got %q", tt.want, tt.raw, got)
		}
	}
}
