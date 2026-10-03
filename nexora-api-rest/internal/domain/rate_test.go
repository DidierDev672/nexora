package domain_test

import (
	"errors"
	"testing"
	"time"

	"nexora-api-rest/internal/domain"
)

func TestNewRate_Valid(t *testing.T) {
	rate, err := domain.NewRate(
		"rate-1",
		"  Tarifa Noche  ",
		"hq-1",
		nil,
		nil,
		domain.RateModalityNight,
		120,
		0,
		nil,
		nil,
		"",
		domain.RateStatusActive,
		"admin",
		time.Now().UTC(),
	)
	if err != nil {
		t.Fatalf("expected valid rate, got %v", err)
	}
	if rate.Name != "Tarifa Noche" {
		t.Fatalf("expected trimmed name, got %q", rate.Name)
	}
	if rate.DurationUnits != 1 {
		t.Fatalf("expected default duration 1, got %d", rate.DurationUnits)
	}
	if rate.DaysOfWeek != domain.RateDaysOfWeekAll {
		t.Fatalf("expected default days all, got %q", rate.DaysOfWeek)
	}
}

func TestNewRate_Invariants(t *testing.T) {
	now := time.Now().UTC()

	tests := []struct {
		name string
		in   func() (domain.Rate, error)
		want error
	}{
		{
			name: "empty name",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "  ", "hq-1", nil, nil, domain.RateModalityDaily, 10, 1, nil, nil, "all", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRateName,
		},
		{
			name: "missing headquarter",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "Tarifa", "", nil, nil, domain.RateModalityDaily, 10, 1, nil, nil, "all", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRateHeadquarterID,
		},
		{
			name: "zero price",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, domain.RateModalityDaily, 0, 1, nil, nil, "all", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRatePrice,
		},
		{
			name: "negative price",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, domain.RateModalityDaily, -5, 1, nil, nil, "all", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRatePrice,
		},
		{
			name: "invalid modality",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, "yearly", 10, 1, nil, nil, "all", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRateModality,
		},
		{
			name: "invalid status",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, domain.RateModalityDaily, 10, 1, nil, nil, "all", "archived", "admin", now)
			},
			want: domain.ErrInvalidRateStatus,
		},
		{
			name: "invalid days of week",
			in: func() (domain.Rate, error) {
				return domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, domain.RateModalityDaily, 10, 1, nil, nil, "someday", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRateDaysOfWeek,
		},
		{
			name: "invalid start time",
			in: func() (domain.Rate, error) {
				start := "25:99"
				return domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, domain.RateModalityDaily, 10, 1, &start, nil, "all", domain.RateStatusActive, "admin", now)
			},
			want: domain.ErrInvalidRateTimeFormat,
		},
		{
			name: "negative duration units",
			in: func() (domain.Rate, error) {
				rate, err := domain.NewRate("rate-1", "Tarifa", "hq-1", nil, nil, domain.RateModalityHourly, 10, 1, nil, nil, "all", domain.RateStatusActive, "admin", now)
				if err != nil {
					return domain.Rate{}, err
				}
				rate.DurationUnits = -1
				return rate, rate.Validate()
			},
			want: domain.ErrInvalidRateDurationUnits,
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

func TestParseRateDaysOfWeek(t *testing.T) {
	tests := []struct {
		raw  string
		want string
		err  bool
	}{
		{raw: "", want: "all"},
		{raw: "WeekEnd", want: "weekend"},
		{raw: "weekdays", want: "weekdays"},
		{raw: "6,7", want: "6,7"},
		{raw: "7, 6 ,7", want: "6,7"},
		{raw: "1,2,3,4,5,6,7", want: "1,2,3,4,5,6,7"},
		{raw: "0", err: true},
		{raw: "8", err: true},
		{raw: "1,", err: true},
		{raw: "weekend,6", err: true},
	}

	for _, tt := range tests {
		got, err := domain.ParseRateDaysOfWeek(tt.raw)
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

func TestParseRateClock(t *testing.T) {
	if got, err := domain.ParseRateClock("20:00"); err != nil || got != "20:00:00" {
		t.Fatalf("expected 20:00:00, got %q err %v", got, err)
	}
	if got, err := domain.ParseRateClock("08:00:00"); err != nil || got != "08:00:00" {
		t.Fatalf("expected 08:00:00, got %q err %v", got, err)
	}
	if _, err := domain.ParseRateClock("24:00"); err != domain.ErrInvalidRateTimeFormat {
		t.Fatalf("expected ErrInvalidRateTimeFormat, got %v", err)
	}
	if _, err := domain.ParseRateClock(""); err != domain.ErrInvalidRateTimeFormat {
		t.Fatalf("expected ErrInvalidRateTimeFormat, got %v", err)
	}
}
