package domain

import "context"

// PersonRepository is the persistence port for the person aggregate (DIP:
// defined in domain, implemented by the infrastructure layer). Mirror of
// BedRepository: it keeps a single mutable row per person and externalises
// the N:N roles through the persons_roles pivot table.
type PersonRepository interface {
	FindAll(ctx context.Context) ([]Person, error)
	FindByID(ctx context.Context, id PersonID) (Person, error)
	// FindByDocumentTypeAndDocumentNumber locates a person by its natural key
	// (document_type + document_number) and is the primitive behind the
	// anti-duplication use case.
	FindByDocumentTypeAndDocumentNumber(ctx context.Context, documentType DocumentType, documentNumber string) (Person, error)
	Save(ctx context.Context, person Person) error
	Update(ctx context.Context, person Person) error
	Delete(ctx context.Context, id PersonID) error
}
