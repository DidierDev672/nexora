package roomtariff

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput contains the parameters needed to create a new room tariff.
// IsDefault defaults to false and Status to active when not provided.
type CreateInput struct {
	RoomID    domain.RoomID
	RateID    domain.RateID
	IsDefault bool
	Status    string
	CreatedBy string
}

// CreateRoomTariffUseCase handles the creation of a room tariff (SRP).
type CreateRoomTariffUseCase struct {
	repo       domain.RoomTariffRepository
	idProvider IDProvider
}

// NewCreateRoomTariffUseCase builds the use case.
func NewCreateRoomTariffUseCase(repo domain.RoomTariffRepository, idProvider IDProvider) *CreateRoomTariffUseCase {
	return &CreateRoomTariffUseCase{repo: repo, idProvider: idProvider}
}

// Create normalizes the input and persists a new room tariff.
func (uc *CreateRoomTariffUseCase) Create(ctx context.Context, in CreateInput) (domain.RoomTariff, error) {
	status, err := normalizeStatus(in.Status)
	if err != nil {
		return domain.RoomTariff{}, err
	}

	tariff, err := domain.NewRoomTariff(
		uc.idProvider.NewRoomTariffID(),
		in.RoomID,
		in.RateID,
		in.IsDefault,
		status,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.RoomTariff{}, err
	}

	return uc.repo.Save(ctx, tariff)
}
