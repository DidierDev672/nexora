package stay

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// ListStayPersonsUseCase lists the guests of a stay through the stays_persons
// pivot (SRP), so a client can see who is lodged in a given stay.
type ListStayPersonsUseCase struct {
	repo domain.StayRepository
}

func NewListStayPersonsUseCase(repo domain.StayRepository) *ListStayPersonsUseCase {
	return &ListStayPersonsUseCase{repo: repo}
}

// ListByStay returns every person linked to the stay.
func (uc *ListStayPersonsUseCase) ListByStay(ctx context.Context, stayID domain.StayID) ([]domain.Person, error) {
	return uc.repo.FindPersonsByStayID(ctx, stayID)
}
