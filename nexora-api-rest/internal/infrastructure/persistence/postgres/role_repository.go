package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

type RoleRepository struct {
	conn *pgxpool.Pool
}

func NewRoleRepository(conn *pgxpool.Pool) *RoleRepository {
	return &RoleRepository{conn: conn}
}

var _ domain.RoleRepository = (*RoleRepository)(nil)

func (r *RoleRepository) FindAll(ctx context.Context) ([]domain.Role, error) {
	rows, err := r.conn.Query(ctx, "SELECT id, name, description FROM roles")
	if err != nil {
		return nil, fmt.Errorf("query roles: %w", err)
	}
	defer rows.Close()

	var roles []domain.Role
	for rows.Next() {
		var role domain.Role
		if err := rows.Scan(&role.ID, &role.Name, &role.Description); err != nil {
			return nil, fmt.Errorf("scan role: %w", err)
		}
		roles = append(roles, role)
	}
	return roles, rows.Err()
}

func (r *RoleRepository) FindByID(ctx context.Context, id domain.RoleID) (domain.Role, error) {
	var role domain.Role
	err := r.conn.QueryRow(ctx, "SELECT id, name, description FROM roles WHERE id = $1", id).
		Scan(&role.ID, &role.Name, &role.Description)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Role{}, domain.ErrRoleNotFound
		}
		return domain.Role{}, fmt.Errorf("query role by id: %w", err)
	}
	return role, nil
}

func (r *RoleRepository) FindByName(ctx context.Context, name string) (domain.Role, error) {
	var role domain.Role
	err := r.conn.QueryRow(ctx, "SELECT id, name, description FROM roles WHERE name = $1", name).
		Scan(&role.ID, &role.Name, &role.Description)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Role{}, domain.ErrRoleNotFound
		}
		return domain.Role{}, fmt.Errorf("query role by name: %w", err)
	}
	return role, nil
}

func (r *RoleRepository) Save(ctx context.Context, role domain.Role) error {
	_, err := r.conn.Exec(ctx,
		"INSERT INTO roles (id, name, description) VALUES ($1, $2, $3)",
		role.ID, role.Name, role.Description,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrRoleDuplicated
		}
		return fmt.Errorf("insert role: %w", err)
	}
	return nil
}

func (r *RoleRepository) Update(ctx context.Context, role domain.Role) error {
	tag, err := r.conn.Exec(ctx,
		"UPDATE roles SET name = $2, description = $3 WHERE id = $1",
		role.ID, role.Name, role.Description,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrRoleDuplicated
		}
		return fmt.Errorf("update role: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoleNotFound
	}
	return nil
}

func (r *RoleRepository) Delete(ctx context.Context, id domain.RoleID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM roles WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete role: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoleNotFound
	}
	return nil
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}
