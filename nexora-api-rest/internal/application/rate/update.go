package rate

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the full representation of a rate: a PUT replaces the
// editable attributes, so the optional references are applied as sent and a
// nil reference clears the previous scope.
type UpdateInput struct {
	ID               domain.RateID
	Name             string
	HeadquarterID    domain.HeadquarterID
	SubHeadquarterID *domain.SubHeadquarterID
	RoomTypeID       *domain.RoomTypeID
	Modality         string
	Price            float64
	DurationUnits    int
	StartTime        *string
	EndTime          *string
	DaysOfWeek       string
	Status           string
}

// UpdateRateUseCase handles updates to an existing rate (SRP).
type UpdateRateUseCase struct {
	repo domain.RateRepository
}

// NewUpdateRateUseCase builds the use case.
func NewUpdateRateUseCase(repo domain.RateRepository) *UpdateRateUseCase {
	return &UpdateRateUseCase{repo: repo}
}

// Update reloads the rate, applies the new representation and persists it.
func (uc *UpdateRateUseCase) Update(ctx context.Context, in UpdateInput) (domain.Rate, error) {
	existing, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Rate{}, err
	}

	modality, err := normalizeModality(in.Modality)
	if err != nil {
		return domain.Rate{}, err
	}

	price, err := normalizePrice(in.Price)
	if err != nil {
		return domain.Rate{}, err
	}

	status, err := normalizeStatus(in.Status)
	if err != nil {
		return domain.Rate{}, err
	}

	startTime, err := normalizeClock(in.StartTime)
	if err != nil {
		return domain.Rate{}, err
	}

	endTime, err := normalizeClock(in.EndTime)
	if err != nil {
		return domain.Rate{}, err
	}

	daysOfWeek, err := normalizeDaysOfWeek(in.DaysOfWeek)
	if err != nil {
		return domain.Rate{}, err
	}

	updated, err := domain.NewRate(
		existing.ID,
		in.Name,
		in.HeadquarterID,
		in.SubHeadquarterID,
		in.RoomTypeID,
		modality,
		price,
		normalizeDurationUnits(in.DurationUnits),
		startTime,
		endTime,
		daysOfWeek,
		status,
		existing.CreatedBy,
		existing.CreatedAt,
	)
	if err != nil {
		return domain.Rate{}, err
	}

	updated.UpdatedAt = time.Now().UTC()

	return uc.repo.Update(ctx, updated)
}
