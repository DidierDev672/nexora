package domain

import (
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"
)

// RateID identifies a hotel rate within the system.
type RateID string

// RateModality represents the billing frequency or time slot of a rate.
type RateModality string

const (
	RateModalityMorning   RateModality = "morning"
	RateModalityAfternoon RateModality = "afternoon"
	RateModalityNight     RateModality = "night"
	RateModalityDaily     RateModality = "daily"
	RateModalityWeekly    RateModality = "weekly"
	RateModalityHourly    RateModality = "hourly"
)

// ValidRateModalities lists every accepted rate modality.
var ValidRateModalities = []RateModality{
	RateModalityMorning,
	RateModalityAfternoon,
	RateModalityNight,
	RateModalityDaily,
	RateModalityWeekly,
	RateModalityHourly,
}

var validRateModalitySet = func() map[RateModality]struct{} {
	set := make(map[RateModality]struct{}, len(ValidRateModalities))
	for _, m := range ValidRateModalities {
		set[m] = struct{}{}
	}
	return set
}()

// ParseRateModality normalizes and validates a raw modality string.
func ParseRateModality(raw string) (RateModality, error) {
	normalized := RateModality(strings.ToLower(strings.TrimSpace(raw)))
	if _, ok := validRateModalitySet[normalized]; !ok {
		return "", ErrInvalidRateModality
	}
	return normalized, nil
}

// RateStatus represents the operational state of a rate.
type RateStatus string

const (
	RateStatusActive   RateStatus = "active"
	RateStatusInactive RateStatus = "inactive"
)

// ValidRateStatuses lists every accepted rate status.
var ValidRateStatuses = []RateStatus{
	RateStatusActive,
	RateStatusInactive,
}

var validRateStatusSet = func() map[RateStatus]struct{} {
	set := make(map[RateStatus]struct{}, len(ValidRateStatuses))
	for _, s := range ValidRateStatuses {
		set[s] = struct{}{}
	}
	return set
}()

// ParseRateStatus normalizes and validates a raw status string.
func ParseRateStatus(raw string) (RateStatus, error) {
	normalized := RateStatus(strings.ToLower(strings.TrimSpace(raw)))
	if _, ok := validRateStatusSet[normalized]; !ok {
		return "", ErrInvalidRateStatus
	}
	return normalized, nil
}

// Days of week selectors accepted by a rate.
const (
	RateDaysOfWeekAll      = "all"
	RateDaysOfWeekWeekdays = "weekdays"
	RateDaysOfWeekWeekend  = "weekend"
)

// ParseRateDaysOfWeek normalizes a days-of-week selector. Accepted values are
// the named selectors (all, weekdays, weekend) or a comma separated list of
// ISO weekday numbers between 1 and 7, which is returned sorted and deduped.
func ParseRateDaysOfWeek(raw string) (string, error) {
	trimmed := strings.ToLower(strings.TrimSpace(raw))
	switch trimmed {
	case "":
		return RateDaysOfWeekAll, nil
	case RateDaysOfWeekAll, RateDaysOfWeekWeekdays, RateDaysOfWeekWeekend:
		return trimmed, nil
	}

	seen := make(map[int]struct{}, 7)
	days := make([]int, 0, 7)
	for _, part := range strings.Split(trimmed, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			return "", ErrInvalidRateDaysOfWeek
		}
		day, err := strconv.Atoi(part)
		if err != nil || day < 1 || day > 7 {
			return "", ErrInvalidRateDaysOfWeek
		}
		if _, ok := seen[day]; ok {
			continue
		}
		seen[day] = struct{}{}
		days = append(days, day)
	}
	if len(days) == 0 {
		return "", ErrInvalidRateDaysOfWeek
	}

	sort.Ints(days)
	normalized := make([]string, 0, len(days))
	for _, day := range days {
		normalized = append(normalized, strconv.Itoa(day))
	}
	return strings.Join(normalized, ","), nil
}

// ParseRateClock validates a wall-clock time and normalizes it to HH:MM:SS so
// it can be stored safely in a PostgreSQL TIME column.
func ParseRateClock(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", ErrInvalidRateTimeFormat
	}

	for _, layout := range []string{"15:04:05", "15:04"} {
		parsed, err := time.Parse(layout, trimmed)
		if err == nil {
			return parsed.Format("15:04:05"), nil
		}
	}
	return "", ErrInvalidRateTimeFormat
}

// Sentinel errors represent the invariant violations of the rate aggregate.
var (
	ErrRateNotFound             = errors.New("rate not found")
	ErrRateDuplicated           = errors.New("a rate with these parameters already exists")
	ErrInvalidRateID            = errors.New("rate id must not be empty")
	ErrInvalidRateName          = errors.New("rate name must not be empty")
	ErrInvalidRateHeadquarterID = errors.New("headquarter id is required")
	ErrInvalidRateModality      = errors.New("modality must be one of: morning, afternoon, night, daily, weekly, hourly")
	ErrInvalidRatePrice         = errors.New("rate price must be strictly greater than zero")
	ErrInvalidRateDurationUnits = errors.New("duration units must be at least 1")
	ErrInvalidRateStatus        = errors.New("status must be active or inactive")
	ErrInvalidRateTimeFormat    = errors.New("start_time and end_time must be in valid format (HH:MM or HH:MM:SS)")
	ErrInvalidRateDaysOfWeek    = errors.New("days_of_week must be all, weekdays, weekend or a comma separated list of days between 1 and 7")
)

// Rate is the root aggregate of the hotel rate catalog. A rate always belongs
// to a headquarter and optionally narrows to a sub headquarter and a room type,
// so a rate without those optional references applies as the general price for
// the whole location.
type Rate struct {
	ID               RateID
	Name             string
	HeadquarterID    HeadquarterID
	SubHeadquarterID *SubHeadquarterID
	RoomTypeID       *RoomTypeID
	Modality         RateModality
	Price            BasePrice
	DurationUnits    int
	StartTime        *string
	EndTime          *string
	DaysOfWeek       string
	Status           RateStatus
	CreatedBy        string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// cloneString deep-copies the optional scalar references so callers cannot
// mutate an entity through the pointer they handed over.
func cloneString(value *string) *string {
	if value == nil {
		return nil
	}
	copied := *value
	return &copied
}

// NewRate is the sanctioned constructor: it normalizes the optional inputs and
// enforces the business invariants before the entity can exist.
func NewRate(
	id RateID,
	name string,
	headquarterID HeadquarterID,
	subHeadquarterID *SubHeadquarterID,
	roomTypeID *RoomTypeID,
	modality RateModality,
	price BasePrice,
	durationUnits int,
	startTime *string,
	endTime *string,
	daysOfWeek string,
	status RateStatus,
	createdBy string,
	createdAt time.Time,
) (Rate, error) {
	if durationUnits <= 0 {
		durationUnits = 1
	}
	if strings.TrimSpace(daysOfWeek) == "" {
		daysOfWeek = RateDaysOfWeekAll
	}

	rate := Rate{
		ID:               id,
		Name:             strings.TrimSpace(name),
		HeadquarterID:    headquarterID,
		SubHeadquarterID: subHeadquarterID,
		RoomTypeID:       roomTypeID,
		Modality:         modality,
		Price:            price,
		DurationUnits:    durationUnits,
		StartTime:        cloneString(startTime),
		EndTime:          cloneString(endTime),
		DaysOfWeek:       daysOfWeek,
		Status:           status,
		CreatedBy:        strings.TrimSpace(createdBy),
		CreatedAt:        createdAt,
		UpdatedAt:        createdAt,
	}

	if err := rate.Validate(); err != nil {
		return Rate{}, err
	}
	return rate, nil
}

// Validate enforces the business invariants of the rate. Monetary values are
// fail-safe: an unusable price or temporal rule is rejected instead of stored.
func (r Rate) Validate() error {
	switch {
	case strings.TrimSpace(string(r.ID)) == "":
		return ErrInvalidRateID
	case strings.TrimSpace(r.Name) == "":
		return ErrInvalidRateName
	case strings.TrimSpace(string(r.HeadquarterID)) == "":
		return ErrInvalidRateHeadquarterID
	case r.Price <= 0:
		return ErrInvalidRatePrice
	case r.DurationUnits < 1:
		return ErrInvalidRateDurationUnits
	}

	if _, ok := validRateModalitySet[r.Modality]; !ok {
		return ErrInvalidRateModality
	}
	if _, ok := validRateStatusSet[r.Status]; !ok {
		return ErrInvalidRateStatus
	}
	if _, err := ParseRateDaysOfWeek(r.DaysOfWeek); err != nil {
		return err
	}
	if err := validateRateClock(r.StartTime); err != nil {
		return err
	}
	return validateRateClock(r.EndTime)
}

func validateRateClock(value *string) error {
	if value == nil {
		return nil
	}
	if _, err := ParseRateClock(*value); err != nil {
		return fmt.Errorf("%w: %s", err, *value)
	}
	return nil
}
