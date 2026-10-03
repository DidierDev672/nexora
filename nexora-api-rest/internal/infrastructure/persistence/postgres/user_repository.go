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

// UserRepository is the Postgres adapter of domain.UserRepository.
type UserRepository struct {
	conn *pgxpool.Pool
}

func NewUserRepository(conn *pgxpool.Pool) *UserRepository {
	return &UserRepository{conn: conn}
}

var _ domain.UserRepository = (*UserRepository)(nil)

const userColumns = "id, name, email, password_hash, role_id, headquarters_id, sub_headquarters_id, status, created_by, created_at, updated_at"

// scanUser reads a row. headquarters_id and sub_headquarters_id are nullable,
// so they are scanned into *string first and converted into domain pointers.
func scanUser(row pgx.Row) (domain.User, error) {
	var (
		user             domain.User
		headquarterID    *string
		subHeadquarterID *string
	)
	err := row.Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash, &user.RoleID,
		&headquarterID, &subHeadquarterID,
		&user.Status, &user.CreatedBy, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return domain.User{}, err
	}
	if headquarterID != nil {
		id := domain.HeadquarterID(*headquarterID)
		user.HeadquartersID = &id
	}
	if subHeadquarterID != nil {
		id := domain.SubHeadquarterID(*subHeadquarterID)
		user.SubHeadquartersID = &id
	}
	return user, nil
}

func (r *UserRepository) FindAll(ctx context.Context) ([]domain.User, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+userColumns+" FROM users")
	if err != nil {
		return nil, fmt.Errorf("query users: %w", err)
	}
	defer rows.Close()

	var users []domain.User
	for rows.Next() {
		user, err := scanUser(rows)
		if err != nil {
			return nil, fmt.Errorf("scan user: %w", err)
		}
		users = append(users, user)
	}
	return users, rows.Err()
}

func (r *UserRepository) FindByID(ctx context.Context, id domain.UserID) (domain.User, error) {
	user, err := scanUser(r.conn.QueryRow(ctx, "SELECT "+userColumns+" FROM users WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.User{}, domain.ErrUserNotFound
		}
		return domain.User{}, fmt.Errorf("query user by id: %w", err)
	}
	return user, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (domain.User, error) {
	user, err := scanUser(r.conn.QueryRow(ctx, "SELECT "+userColumns+" FROM users WHERE email = $1", email))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.User{}, domain.ErrUserNotFound
		}
		return domain.User{}, fmt.Errorf("query user by email: %w", err)
	}
	return user, nil
}

func (r *UserRepository) Save(ctx context.Context, user domain.User) error {
	_, err := r.conn.Exec(ctx,
		"INSERT INTO users (id, name, email, password_hash, role_id, headquarters_id, sub_headquarters_id, status, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now())",
		user.ID, user.Name, user.Email, user.PasswordHash, user.RoleID,
		optionalID(user.HeadquartersID), optionalID(user.SubHeadquartersID),
		user.Status, user.CreatedBy,
	)
	if err != nil {
		switch {
		case isUniqueViolation(err):
			return domain.ErrUserDuplicated
		case isForeignKeyViolation(err):
			return mapFKViolation(err)
		default:
			return fmt.Errorf("insert user: %w", err)
		}
	}
	return nil
}

func (r *UserRepository) Update(ctx context.Context, user domain.User) error {
	tag, err := r.conn.Exec(ctx,
		"UPDATE users SET name = $2, email = $3, password_hash = $4, role_id = $5, headquarters_id = $6, sub_headquarters_id = $7, status = $8, updated_at = now() WHERE id = $1",
		user.ID, user.Name, user.Email, user.PasswordHash, user.RoleID,
		optionalID(user.HeadquartersID), optionalID(user.SubHeadquartersID),
		user.Status,
	)
	if err != nil {
		switch {
		case isUniqueViolation(err):
			return domain.ErrUserDuplicated
		case isForeignKeyViolation(err):
			return mapFKViolation(err)
		default:
			return fmt.Errorf("update user: %w", err)
		}
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrUserNotFound
	}
	return nil
}

func (r *UserRepository) Delete(ctx context.Context, id domain.UserID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM users WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete user: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrUserNotFound
	}
	return nil
}

// optionalID renders a domain ID pointer as a scalar for pgx: nil -> NULL.
func optionalID[T ~string](id *T) any {
	if id == nil {
		return nil
	}
	return string(*id)
}

func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23503"
	}
	return false
}

// mapFKViolation translates a foreign-key violation into the specific domain
// invariant it represents, so the API can tell which reference is invalid.
func mapFKViolation(err error) error {
	var pgErr *pgconn.PgError
	if !errors.As(err, &pgErr) {
		return domain.ErrInvalidUserReference
	}
	switch {
	case strings.Contains(pgErr.ConstraintName, "role_id"):
		return domain.ErrInvalidUserRoleRef
	case strings.Contains(pgErr.ConstraintName, "sub_headquarters_id"):
		return domain.ErrInvalidUserSubHeadquarterRef
	case strings.Contains(pgErr.ConstraintName, "headquarters_id"):
		return domain.ErrInvalidUserHeadquarterRef
	default:
		return domain.ErrInvalidUserReference
	}
}
