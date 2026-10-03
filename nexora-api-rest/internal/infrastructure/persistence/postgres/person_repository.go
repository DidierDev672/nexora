package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// PersonRepository is the Postgres adapter of domain.PersonRepository.
type PersonRepository struct {
	conn *pgxpool.Pool
}

func NewPersonRepository(conn *pgxpool.Pool) *PersonRepository {
	return &PersonRepository{conn: conn}
}

var _ domain.PersonRepository = (*PersonRepository)(nil)

const personSelect = `SELECT p.id, p.document_type, p.document_number, p.name, p.phone_number, p.email,
	p.date_of_birth, p.gender, p.nationality,
	COALESCE(ARRAY_AGG(pr.role_id) FILTER (WHERE pr.role_id IS NOT NULL), ARRAY[]::VARCHAR[]) AS roles,
	p.created_by, p.created_at, p.updated_at
	FROM persons p
	LEFT JOIN persons_roles pr ON pr.person_id = p.id`

const personGroupBy = `GROUP BY p.id, p.document_type, p.document_number, p.name, p.phone_number, p.email, p.date_of_birth, p.gender, p.nationality, p.created_by, p.created_at, p.updated_at`

func scanPerson(row pgx.Row) (domain.Person, error) {
	var p domain.Person
	var docType string
	var dob *time.Time
	var gender *string
	var roles []string
	err := row.Scan(
		&p.ID, &docType, &p.DocumentNumber, &p.Name,
		&p.PhoneNumber, &p.Email, &dob, &gender, &p.Nationality, &roles,
		&p.CreatedBy, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return domain.Person{}, err
	}
	p.DocumentType = domain.DocumentType(docType)
	if dob != nil {
		p.DateOfBirth = *dob
	}
	if gender != nil {
		p.Gender = domain.Gender(*gender)
	}
	p.Roles = make([]domain.RoleID, len(roles))
	for i, r := range roles {
		p.Roles[i] = domain.RoleID(r)
	}
	return p, nil
}

func (r *PersonRepository) FindAll(ctx context.Context) ([]domain.Person, error) {
	rows, err := r.conn.Query(ctx, personSelect+" "+personGroupBy)
	if err != nil {
		return nil, fmt.Errorf("query persons: %w", err)
	}
	defer rows.Close()

	var persons []domain.Person
	for rows.Next() {
		person, err := scanPerson(rows)
		if err != nil {
			return nil, fmt.Errorf("scan person: %w", err)
		}
		persons = append(persons, person)
	}
	return persons, rows.Err()
}

func (r *PersonRepository) FindByID(ctx context.Context, id domain.PersonID) (domain.Person, error) {
	person, err := scanPerson(r.conn.QueryRow(ctx, personSelect+" WHERE p.id = $1 "+personGroupBy, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Person{}, domain.ErrPersonNotFound
		}
		return domain.Person{}, fmt.Errorf("query person by id: %w", err)
	}
	return person, nil
}

func (r *PersonRepository) FindByDocumentTypeAndDocumentNumber(ctx context.Context, documentType domain.DocumentType, documentNumber string) (domain.Person, error) {
	person, err := scanPerson(r.conn.QueryRow(ctx, personSelect+" WHERE p.document_type = $1 AND p.document_number = $2 "+personGroupBy, documentType, documentNumber))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Person{}, domain.ErrPersonNotFound
		}
		return domain.Person{}, fmt.Errorf("query person by natural key: %w", err)
	}
	return person, nil
}

func (r *PersonRepository) Save(ctx context.Context, person domain.Person) error {
	tx, err := r.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin save person: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx,
		"INSERT INTO persons (id, document_type, document_number, name, phone_number, email, date_of_birth, gender, nationality, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())",
		person.ID, person.DocumentType, person.DocumentNumber, person.Name, person.PhoneNumber, person.Email, person.DateOfBirth, person.Gender, person.Nationality, person.CreatedBy,
	); err != nil {
		if isUniqueViolation(err) {
			return domain.ErrPersonDuplicated
		}
		return fmt.Errorf("insert person: %w", err)
	}

	if err := r.upsertPersonRoles(ctx, tx, person.ID, person.Roles); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *PersonRepository) Update(ctx context.Context, person domain.Person) error {
	tx, err := r.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update person: %w", err)
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx,
		"UPDATE persons SET document_type = $2, document_number = $3, name = $4, phone_number = $5, email = $6, date_of_birth = $7, gender = $8, nationality = $9, updated_at = now() WHERE id = $1",
		person.ID, person.DocumentType, person.DocumentNumber, person.Name, person.PhoneNumber, person.Email, person.DateOfBirth, person.Gender, person.Nationality,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrPersonDuplicated
		}
		return fmt.Errorf("update person: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrPersonNotFound
	}

	if _, err := tx.Exec(ctx, "DELETE FROM persons_roles WHERE person_id = $1", person.ID); err != nil {
		return fmt.Errorf("clear person roles: %w", err)
	}
	if err := r.upsertPersonRoles(ctx, tx, person.ID, person.Roles); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *PersonRepository) upsertPersonRoles(ctx context.Context, tx pgx.Tx, personID domain.PersonID, roles []domain.RoleID) error {
	for _, role := range roles {
		if _, err := tx.Exec(ctx,
			"INSERT INTO persons_roles (person_id, role_id) VALUES ($1, $2) ON CONFLICT (person_id, role_id) DO NOTHING",
			personID, role,
		); err != nil {
			return fmt.Errorf("insert person role pivot: %w", err)
		}
	}
	return nil
}

func (r *PersonRepository) Delete(ctx context.Context, id domain.PersonID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM persons WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete person: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrPersonNotFound
	}
	return nil
}
