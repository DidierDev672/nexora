package roomtariff

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput carries the full representation of a room tariff: a PUT replaces
// the editable attributes.
type UpdateInput struct {
	ID        domain.RoomTariffID
	RoomID    domain.RoomID
	RateID    domain.RateID
	IsDefault bool
	Status    string
}

// UpdateRoomTariffUseCase handles updates to an existing room tariff (SRP).
type UpdateRoomTariffUseCase struct {
	repo domain.RoomTariffRepository
}

// NewUpdateRoomTariffUseCase builds the use case.
func NewUpdateRoomTariffUseCase(repo domain.RoomTariffRepository) *UpdateRoomTariffUseCase {
	return &UpdateRoomTariffUseCase{repo: repo}
}

// Update reloads the room tariff, applies the new representation and persists it.
func (uc *UpdateRoomTariffUseCase) Update(ctx context.Context, in UpdateInput) (domain.RoomTariff, error) {
	existing, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.RoomTariff{}, err
	}

	status, err := normalizeStatus(in.Status)
	if err != nil {
		return domain.RoomTariff{}, err
	}

	updated, err := domain.NewRoomTariff(
		existing.ID,
		in.RoomID,
		in.RateID,
		in.IsDefault,
		status,
		existing.CreatedBy,
		existing.CreatedAt,
	)
	if err != nil {
		return domain.RoomTariff{}, err
	}

	updated.UpdatedAt = time.Now().UTC()

	return uc.repo.Update(ctx, updated)
}
