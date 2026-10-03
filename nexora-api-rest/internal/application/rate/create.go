package rate

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput contains the parameters needed to create a new rate.
type CreateInput struct {
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
	CreatedBy        string
}

// CreateRateUseCase handles the creation of a rate (SRP).
type CreateRateUseCase struct {
	repo       domain.RateRepository
	idProvider IDProvider
}

// NewCreateRateUseCase builds the use case.
func NewCreateRateUseCase(repo domain.RateRepository, idProvider IDProvider) *CreateRateUseCase {
	return &CreateRateUseCase{repo: repo, idProvider: idProvider}
}

// Create normalizes the input, builds the aggregate through the domain
// constructor and persists it.
func (uc *CreateRateUseCase) Create(ctx context.Context, in CreateInput) (domain.Rate, error) {
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

	rate, err := domain.NewRate(
		uc.idProvider.NewRateID(),
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
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Rate{}, err
	}

	return uc.repo.Save(ctx, rate)
}
