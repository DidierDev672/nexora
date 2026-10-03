package person

import (
	"context"
	"errors"

	"nexora-api-rest/internal/domain"
)

// assertUniqueDocument fails if another person already owns the given document
// type and document number. Shared by use cases that mutate natural identity.
func assertUniqueDocument(ctx context.Context, repo domain.PersonRepository, id domain.PersonID, docType domain.DocumentType, docNumber string) error {
	existing, err := repo.FindByDocumentTypeAndDocumentNumber(ctx, docType, docNumber)
	switch {
	case err == nil:
		if existing.ID != id {
			return domain.ErrPersonDuplicated
		}
		return nil
	case errors.Is(err, domain.ErrPersonNotFound):
		return nil
	default:
		return err
	}
}
