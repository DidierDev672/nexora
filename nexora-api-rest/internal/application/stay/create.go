package stay

import (
	"context"
	"strings"
	"time"

	"nexora-api-rest/internal/domain"
)

// CreateInput contains the parameters needed to create a new stay.
type CreateInput struct {
	RoomID          domain.RoomID
	ReservationID   domain.ReserveID
	PersonIDs       []domain.PersonID
	CheckInDate     time.Time
	CheckOutDate    time.Time
	PaymentMethod   string
	SecurityDeposit float64
	Remarks         string
	Status          string
	CreatedBy       string
}

// CreateStayUseCase handles the creation of a stay (Single Responsibility).
type CreateStayUseCase struct {
	repo       domain.StayRepository
	idProvider IDProvider
}

// NewCreateStayUseCase constructs the use case with its dependencies (DIP).
func NewCreateStayUseCase(repo domain.StayRepository, idProvider IDProvider) *CreateStayUseCase {
	return &CreateStayUseCase{
		repo:       repo,
		idProvider: idProvider,
	}
}

// Create creates and persists a new stay, enforcing domain validation.
func (uc *CreateStayUseCase) Create(ctx context.Context, in CreateInput) (domain.Stay, error) {
	paymentMethod, err := domain.ParsePaymentMethod(in.PaymentMethod)
	if err != nil {
		return domain.Stay{}, err
	}

	status := domain.StayStatusProgress
	if strings.TrimSpace(in.Status) != "" {
		parsedStatus, err := domain.ParseStayStatus(in.Status)
		if err != nil {
			return domain.Stay{}, err
		}
		status = parsedStatus
	}

	stay, err := domain.NewStay(
		uc.idProvider.NewStayID(),
		in.RoomID,
		in.ReservationID,
		in.PersonIDs,
		in.CheckInDate,
		in.CheckOutDate,
		paymentMethod,
		in.SecurityDeposit,
		in.Remarks,
		status,
		in.CreatedBy,
		time.Now().UTC(),
	)
	if err != nil {
		return domain.Stay{}, err
	}

	return uc.repo.Save(ctx, stay)
}
