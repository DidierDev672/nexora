package serviceassignment

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ServiceAssignmentSchemaDDL define la estructura de la tabla service_assignments en PostgreSQL.
const ServiceAssignmentSchemaDDL = `
CREATE TABLE IF NOT EXISTS service_assignments (
    id                  VARCHAR(36) PRIMARY KEY,
    service_request_id  VARCHAR(36) NOT NULL,
    stay_id             VARCHAR(36) NOT NULL,
    person_id           VARCHAR(36) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_assignments_sr ON service_assignments(service_request_id);
CREATE INDEX IF NOT EXISTS idx_service_assignments_stay ON service_assignments(stay_id);
CREATE INDEX IF NOT EXISTS idx_service_assignments_person ON service_assignments(person_id);
`

// PostgresRepository es el adaptador de persistencia para PostgreSQL utilizando pgxpool (LSP).
type PostgresRepository struct {
	pool      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

// NewPostgresRepository instancia el repositorio de PostgreSQL.
func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

var _ Repository = (*PostgresRepository)(nil)

// EnsureTable crea automáticamente la tabla e índices en Postgres la primera vez que se invoca.
func (r *PostgresRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.pool.Exec(ctx, ServiceAssignmentSchemaDDL)
	})
	return r.initError
}

const serviceAssignmentColumns = `id, service_request_id, stay_id, person_id, is_active, created_at, updated_at`

func scanServiceAssignment(row pgx.Row) (ServiceAssignment, error) {
	var a ServiceAssignment
	var idStr string
	err := row.Scan(
		&idStr,
		&a.ServiceRequestID,
		&a.StayID,
		&a.PersonID,
		&a.IsActive,
		&a.CreatedAt,
		&a.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ServiceAssignment{}, ErrNotFound
		}
		return ServiceAssignment{}, err
	}
	a.ID = ID(idStr)
	return a, nil
}

// Create inserta una nueva asignación.
func (r *PostgresRepository) Create(ctx context.Context, a ServiceAssignment) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table on post: %w", err)
	}

	query := fmt.Sprintf(`
	INSERT INTO service_assignments (%s)
	VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, serviceAssignmentColumns)

	_, err := r.pool.Exec(ctx, query,
		string(a.ID),
		a.ServiceRequestID,
		a.StayID,
		a.PersonID,
		a.IsActive,
		a.CreatedAt,
		a.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("postgres insert service_assignment: %w", err)
	}
	return nil
}

// GetByID consulta una asignación por su ID único.
func (r *PostgresRepository) GetByID(ctx context.Context, id ID) (ServiceAssignment, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return ServiceAssignment{}, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
	SELECT %s
	FROM service_assignments
	WHERE id = $1
	`, serviceAssignmentColumns)

	row := r.pool.QueryRow(ctx, query, string(id))
	return scanServiceAssignment(row)
}

// List retorna todas las asignaciones registradas.
func (r *PostgresRepository) List(ctx context.Context) ([]ServiceAssignment, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
	SELECT %s
	FROM service_assignments
	ORDER BY created_at DESC
	`, serviceAssignmentColumns)

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query service_assignments: %w", err)
	}
	defer rows.Close()

	list := make([]ServiceAssignment, 0)
	for rows.Next() {
		item, err := scanServiceAssignment(rows)
		if err != nil {
			return nil, fmt.Errorf("scan service_assignment: %w", err)
		}
		list = append(list, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate service_assignments: %w", err)
	}

	return list, nil
}

// Update modifica los datos de una asignación.
func (r *PostgresRepository) Update(ctx context.Context, a ServiceAssignment) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	query := `
	UPDATE service_assignments
	SET service_request_id = $2,
	    stay_id = $3,
	    person_id = $4,
	    is_active = $5,
	    updated_at = $6
	WHERE id = $1
	`

	cmd, err := r.pool.Exec(ctx, query,
		string(a.ID),
		a.ServiceRequestID,
		a.StayID,
		a.PersonID,
		a.IsActive,
		a.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("postgres update service_assignment: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// Delete elimina una asignación por ID.
func (r *PostgresRepository) Delete(ctx context.Context, id ID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	query := `DELETE FROM service_assignments WHERE id = $1`
	cmd, err := r.pool.Exec(ctx, query, string(id))
	if err != nil {
		return fmt.Errorf("postgres delete service_assignment: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
