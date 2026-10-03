package person

import (
	"context"

	"nexora-api-rest/internal/domain"
)

// IDProvider generates unique identifiers for newly created persons.
type IDProvider interface {
	NewPersonID() domain.PersonID
}

// PersonCreator is the narrow port used by the HTTP layer (ISP).
type PersonCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Person, error)
}

// PersonLister returns all existing persons.
type PersonLister interface {
	List(ctx context.Context) ([]domain.Person, error)
}

// PersonGetter returns a single person by id.
type PersonGetter interface {
	GetByID(ctx context.Context, id domain.PersonID) (domain.Person, error)
}

// PersonUpdater edits an existing person.
type PersonUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Person, error)
}

// PersonDeleter removes a person by id.
type PersonDeleter interface {
	Delete(ctx context.Context, id domain.PersonID) error
}
