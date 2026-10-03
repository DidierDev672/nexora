package reserve

import (
	"context"
	"strings"
	"time"

	"nexora-api-rest/internal/domain"
)

// UpdateInput contains the parameters to update an existing reservation.
type UpdateInput struct {
	ID             domain.ReserveID
	RoomID         domain.RoomID
	PersonID       domain.PersonID
	CheckInDate    time.Time
	CheckOutDate   time.Time
	NumberOfGuests int
	State          string
	TotalPrice     float64
}

// UpdateReserveUseCase handles modifying a reservation.
type UpdateReserveUseCase struct {
	repo domain.ReserveRepository
}

// NewUpdateReserveUseCase constructs the update use case.
func NewUpdateReserveUseCase(repo domain.ReserveRepository) *UpdateReserveUseCase {
	return &UpdateReserveUseCase{repo: repo}
}

// Update updates an existing reservation's details, enforcing domain rules.
func (uc *UpdateReserveUseCase) Update(ctx context.Context, in UpdateInput) (domain.Reserve, error) {
	reserve, err := uc.repo.FindByID(ctx, in.ID)
	if err != nil {
		return domain.Reserve{}, err
	}

	state := reserve.State
	if strings.TrimSpace(in.State) != "" {
		parsedState, err := domain.ParseReserveState(in.State)
		if err != nil {
			return domain.Reserve{}, err
		}
		state = parsedState
	}

	roomID := in.RoomID
	if strings.TrimSpace(string(roomID)) == "" {
		roomID = reserve.RoomID
	}

	personID := in.PersonID
	if strings.TrimSpace(string(personID)) == "" {
		personID = reserve.PersonID
	}

	checkIn := in.CheckInDate
	if checkIn.IsZero() {
		checkIn = reserve.CheckInDate
	}

	checkOut := in.CheckOutDate
	if checkOut.IsZero() {
		checkOut = reserve.CheckOutDate
	}

	guests := in.NumberOfGuests
	if guests <= 0 {
		guests = reserve.NumberOfGuests
	}

	if err := reserve.UpdateDetails(roomID, personID, checkIn, checkOut, guests, state, in.TotalPrice); err != nil {
		return domain.Reserve{}, err
	}

	return uc.repo.Update(ctx, reserve)
}
