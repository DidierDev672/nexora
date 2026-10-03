package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// RoomsByStatusUseCase lists the auditable room inventory filtered by a
// physical lifecycle state (SRP).
type RoomsByStatusUseCase struct {
	repo domain.AuditRepository
}

// NewRoomsByStatusUseCase builds the use case.
func NewRoomsByStatusUseCase(repo domain.AuditRepository) *RoomsByStatusUseCase {
	return &RoomsByStatusUseCase{repo: repo}
}

// RoomsByStatus parses and validates the requested state, then returns the
// matching rooms. An unknown state is rejected with the domain error so the
// HTTP layer can translate it into a client 4xx.
func (uc *RoomsByStatusUseCase) RoomsByStatus(ctx context.Context, raw string) ([]domain.AuditRoom, error) {
	status, err := domain.ParseRoomStatus(raw)
	if err != nil {
		return nil, err
	}
	return uc.repo.RoomsByStatus(ctx, status)
}
