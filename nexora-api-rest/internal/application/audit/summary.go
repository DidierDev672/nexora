package audit

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// SummaryUseCase aggregates the audit dashboard counts (SRP).
type SummaryUseCase struct {
	repo domain.AuditRepository
}

// NewSummaryUseCase builds the use case.
func NewSummaryUseCase(repo domain.AuditRepository) *SummaryUseCase {
	return &SummaryUseCase{repo: repo}
}

// Summary returns the per-entity totals used by the audit dashboard.
func (uc *SummaryUseCase) Summary(ctx context.Context) (domain.AuditSummary, error) {
	return uc.repo.Summary(ctx)
}
