package rate

import (
	"nexora-api-rest/internal/domain"
)

// normalizeModality validates the requested billing frequency. The modality has
// no default: a rate without a frequency cannot be priced.
func normalizeModality(raw string) (domain.RateModality, error) {
	return domain.ParseRateModality(raw)
}

// normalizeStatus defaults an empty status to active so a rate is usable right
// after creation unless the operator explicitly disables it.
func normalizeStatus(raw string) (domain.RateStatus, error) {
	if raw == "" {
		return domain.RateStatusActive, nil
	}
	return domain.ParseRateStatus(raw)
}

// normalizePrice enforces the fail-safe monetary invariant: a rate is never
// stored with a zero or negative price.
func normalizePrice(raw float64) (domain.BasePrice, error) {
	if raw <= 0 {
		return 0, domain.ErrInvalidRatePrice
	}
	return domain.NewBasePrice(raw)
}

// normalizeClock validates an optional wall-clock boundary and returns nil
// when the boundary is not applicable to the rate.
func normalizeClock(value *string) (*string, error) {
	if value == nil {
		return nil, nil
	}
	if *value == "" {
		return nil, nil
	}
	normalized, err := domain.ParseRateClock(*value)
	if err != nil {
		return nil, err
	}
	return &normalized, nil
}

// normalizeDaysOfWeek applies the default selector when none is provided.
func normalizeDaysOfWeek(raw string) (string, error) {
	return domain.ParseRateDaysOfWeek(raw)
}

// normalizeDurationUnits applies the documented default of a single unit.
func normalizeDurationUnits(raw int) int {
	if raw <= 0 {
		return 1
	}
	return raw
}
