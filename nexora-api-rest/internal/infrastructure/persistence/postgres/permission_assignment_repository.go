package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// PermissionAssignmentRepository is the Postgres adapter of domain.PermissionAssignmentRepository.
type PermissionAssignmentRepository struct {
	conn *pgxpool.Pool
}

func NewPermissionAssignmentRepository(conn *pgxpool.Pool) *PermissionAssignmentRepository {
	return &PermissionAssignmentRepository{conn: conn}
}

var _ domain.PermissionAssignmentRepository = (*PermissionAssignmentRepository)(nil)

const permissionAssignmentColumns = "id, user_id, headquarters_id, sub_headquarters_id, resource_id, permission_resource_id, created_at, updated_at"

// scanPermissionAssignment reads a row. sub_headquarters_id, resource_id and
// permission_resource_id are nullable, so they are scanned into *string first
// and converted into domain pointers.
func scanPermissionAssignment(row pgx.Row) (domain.PermissionAssignment, error) {
	var (
		pa                   domain.PermissionAssignment
		subHeadquarterID     *string
		resourceID           *string
		permissionResourceID *string
	)
	err := row.Scan(
		&pa.ID, &pa.UserID, &pa.HeadquartersID,
		&subHeadquarterID, &resourceID, &permissionResourceID,
		&pa.CreatedAt, &pa.UpdatedAt,
	)
	if err != nil {
		return domain.PermissionAssignment{}, err
	}
	if subHeadquarterID != nil {
		id := domain.SubHeadquarterID(*subHeadquarterID)
		pa.SubHeadquartersID = &id
	}
	if resourceID != nil {
		id := domain.ResourceID(*resourceID)
		pa.ResourceID = &id
	}
	if permissionResourceID != nil {
		id := domain.PermissionResourceID(*permissionResourceID)
		pa.PermissionResourceID = &id
	}
	return pa, nil
}

func (r *PermissionAssignmentRepository) FindAll(ctx context.Context) ([]domain.PermissionAssignment, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+permissionAssignmentColumns+" FROM permission_assignments")
	if err != nil {
		return nil, fmt.Errorf("query permission assignments: %w", err)
	}
	defer rows.Close()

	var assignments []domain.PermissionAssignment
	for rows.Next() {
		assignment, err := scanPermissionAssignment(rows)
		if err != nil {
			return nil, fmt.Errorf("scan permission assignment: %w", err)
		}
		assignments = append(assignments, assignment)
	}
	return assignments, rows.Err()
}

func (r *PermissionAssignmentRepository) FindByID(ctx context.Context, id domain.PermissionAssignmentID) (domain.PermissionAssignment, error) {
	assignment, err := scanPermissionAssignment(r.conn.QueryRow(ctx, "SELECT "+permissionAssignmentColumns+" FROM permission_assignments WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.PermissionAssignment{}, domain.ErrPermissionAssignmentNotFound
		}
		return domain.PermissionAssignment{}, fmt.Errorf("query permission assignment by id: %w", err)
	}
	return assignment, nil
}

func (r *PermissionAssignmentRepository) FindByUser(ctx context.Context, userID domain.UserID) ([]domain.PermissionAssignment, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+permissionAssignmentColumns+" FROM permission_assignments WHERE user_id = $1", userID)
	if err != nil {
		return nil, fmt.Errorf("query permission assignments by user: %w", err)
	}
	defer rows.Close()

	var assignments []domain.PermissionAssignment
	for rows.Next() {
		assignment, err := scanPermissionAssignment(rows)
		if err != nil {
			return nil, fmt.Errorf("scan permission assignment: %w", err)
		}
		assignments = append(assignments, assignment)
	}
	return assignments, rows.Err()
}

func (r *PermissionAssignmentRepository) FindByHeadquarter(ctx context.Context, headquarterID domain.HeadquarterID) ([]domain.PermissionAssignment, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+permissionAssignmentColumns+" FROM permission_assignments WHERE headquarters_id = $1", headquarterID)
	if err != nil {
		return nil, fmt.Errorf("query permission assignments by headquarter: %w", err)
	}
	defer rows.Close()

	var assignments []domain.PermissionAssignment
	for rows.Next() {
		assignment, err := scanPermissionAssignment(rows)
		if err != nil {
			return nil, fmt.Errorf("scan permission assignment: %w", err)
		}
		assignments = append(assignments, assignment)
	}
	return assignments, rows.Err()
}

func (r *PermissionAssignmentRepository) Save(ctx context.Context, assignment domain.PermissionAssignment) error {
	_, err := r.conn.Exec(ctx,
		"INSERT INTO permission_assignments (id, user_id, headquarters_id, sub_headquarters_id, resource_id, permission_resource_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now(), now())",
		assignment.ID, assignment.UserID, assignment.HeadquartersID,
		optionalID(assignment.SubHeadquartersID),
		optionalID(assignment.ResourceID),
		optionalID(assignment.PermissionResourceID),
	)
	if err != nil {
		if isForeignKeyViolation(err) {
			return mapAssignmentFKViolation(err)
		}
		return fmt.Errorf("insert permission assignment: %w", err)
	}
	return nil
}

func (r *PermissionAssignmentRepository) Update(ctx context.Context, assignment domain.PermissionAssignment) error {
	tag, err := r.conn.Exec(ctx,
		"UPDATE permission_assignments SET user_id = $2, headquarters_id = $3, sub_headquarters_id = $4, resource_id = $5, permission_resource_id = $6, updated_at = now() WHERE id = $1",
		assignment.ID, assignment.UserID, assignment.HeadquartersID,
		optionalID(assignment.SubHeadquartersID),
		optionalID(assignment.ResourceID),
		optionalID(assignment.PermissionResourceID),
	)
	if err != nil {
		if isForeignKeyViolation(err) {
			return mapAssignmentFKViolation(err)
		}
		return fmt.Errorf("update permission assignment: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrPermissionAssignmentNotFound
	}
	return nil
}

func (r *PermissionAssignmentRepository) Delete(ctx context.Context, id domain.PermissionAssignmentID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM permission_assignments WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete permission assignment: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrPermissionAssignmentNotFound
	}
	return nil
}

// mapAssignmentFKViolation translates a foreign-key violation into the specific
// domain invariant it represents.
func mapAssignmentFKViolation(err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return domain.ErrInvalidPermissionAssignmentID
	}
	switch {
	case strings.Contains(pgErr.ConstraintName, "user_id"):
		return domain.ErrInvalidPermissionAssignmentUser
	case strings.Contains(pgErr.ConstraintName, "headquarters_id"):
		return domain.ErrInvalidPermissionAssignmentHQ
	default:
		return domain.ErrInvalidPermissionAssignmentUser
	}
}
