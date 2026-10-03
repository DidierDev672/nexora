package stay

import (
	"context"
	"strings"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput encapsulates fields that can be updated on an existing stay.
type UpdateInput struct {
	ID              domain.StayID
	RoomID          domain.RoomID
	ReservationID   domain.ReserveID
	PersonIDs       []domain.PersonID
	CheckInDate     time.Time
	CheckOutDate    time.Time
	PaymentMethod   string
	SecurityDeposit float64
	Remarks         string
	Status          string
}

// UpdateStayUseCase handles updates to an existing stay (SRP).
type UpdateStayUseCase struct {
	repo domain.StayRepository
}

// NewUpdateStayUseCase builds the use case.
func NewUpdateStayUseCase(repo domain.StayRepository) *UpdateStayUseCase {
	return &UpdateStayUseCase{repo: repo}
}

// Update modifies and persists changes to an existing stay.
func (uc *UpdateStayUseCase) Update(ctx context.Context, in UpdateInput) (domain.Stay, error) {
	existing, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Stay{}, err
	}

	if in.RoomID != "" {
		existing.RoomID = in.RoomID
	}
	if in.ReservationID != "" {
		existing.ReservationID = in.ReservationID
	}
	if len(in.PersonIDs) > 0 {
		existing.PersonIDs = in.PersonIDs
	}
	if !in.CheckInDate.IsZero() {
		existing.CheckInDate = in.CheckInDate
	}
	if !in.CheckOutDate.IsZero() {
		existing.CheckOutDate = in.CheckOutDate
	}
	if strings.TrimSpace(in.PaymentMethod) != "" {
		pm, err := domain.ParsePaymentMethod(in.PaymentMethod)
		if err != nil {
			return domain.Stay{}, err
		}
		existing.PaymentMethod = pm
	}
	existing.SecurityDeposit = in.SecurityDeposit
	if in.Remarks != "" {
		existing.Remarks = strings.TrimSpace(in.Remarks)
	}
	if strings.TrimSpace(in.Status) != "" {
		st, err := domain.ParseStayStatus(in.Status)
		if err != nil {
			return domain.Stay{}, err
		}
		existing.Status = st
	}

	existing.UpdatedAt = time.Now().UTC()

	if err := existing.Validate(); err != nil {
		return domain.Stay{}, err
	}

	return uc.repo.Update(ctx, existing)
}
