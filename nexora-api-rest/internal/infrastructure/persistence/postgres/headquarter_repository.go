package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// HeadquarterRepository is the Postgres adapter of domain.HeadquarterRepository.
type HeadquarterRepository struct {
	conn *pgxpool.Pool
}

func NewHeadquarterRepository(conn *pgxpool.Pool) *HeadquarterRepository {
	return &HeadquarterRepository{conn: conn}
}

var _ domain.HeadquarterRepository = (*HeadquarterRepository)(nil)

const headquarterColumns = "id, name, address, city, phone, status, created_by, created_at, updated_at"

func scanHeadquarter(row pgx.Row) (domain.Headquarter, error) {
	var hq domain.Headquarter
	err := row.Scan(
		&hq.ID, &hq.Name, &hq.Address, &hq.City, &hq.Phone,
		&hq.Status, &hq.CreatedBy, &hq.CreatedAt, &hq.UpdatedAt,
	)
	return hq, err
}

func (r *HeadquarterRepository) FindAll(ctx context.Context) ([]domain.Headquarter, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+headquarterColumns+" FROM headquarters")
	if err != nil {
		return nil, fmt.Errorf("query headquarters: %w", err)
	}
	defer rows.Close()

	var headquarters []domain.Headquarter
	for rows.Next() {
		hq, err := scanHeadquarter(rows)
		if err != nil {
			return nil, fmt.Errorf("scan headquarter: %w", err)
		}
		headquarters = append(headquarters, hq)
	}
	return headquarters, rows.Err()
}

func (r *HeadquarterRepository) FindByID(ctx context.Context, id domain.HeadquarterID) (domain.Headquarter, error) {
	hq, err := scanHeadquarter(r.conn.QueryRow(ctx, "SELECT "+headquarterColumns+" FROM headquarters WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Headquarter{}, domain.ErrHeadquarterNotFound
		}
		return domain.Headquarter{}, fmt.Errorf("query headquarter by id: %w", err)
	}
	return hq, nil
}

func (r *HeadquarterRepository) FindByName(ctx context.Context, name string) (domain.Headquarter, error) {
	hq, err := scanHeadquarter(r.conn.QueryRow(ctx, "SELECT "+headquarterColumns+" FROM headquarters WHERE name = $1", name))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Headquarter{}, domain.ErrHeadquarterNotFound
		}
		return domain.Headquarter{}, fmt.Errorf("query headquarter by name: %w", err)
	}
	return hq, nil
}

func (r *HeadquarterRepository) Save(ctx context.Context, hq domain.Headquarter) error {
	_, err := r.conn.Exec(ctx,
		"INSERT INTO headquarters (id, name, address, city, phone, status, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())",
		hq.ID, hq.Name, hq.Address, hq.City, hq.Phone, hq.Status, hq.CreatedBy,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrHeadquarterDuplicated
		}
		return fmt.Errorf("insert headquarter: %w", err)
	}
	return nil
}

func (r *HeadquarterRepository) Update(ctx context.Context, hq domain.Headquarter) error {
	tag, err := r.conn.Exec(ctx,
		"UPDATE headquarters SET name = $2, address = $3, city = $4, phone = $5, status = $6, updated_at = now() WHERE id = $1",
		hq.ID, hq.Name, hq.Address, hq.City, hq.Phone, hq.Status,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrHeadquarterDuplicated
		}
		return fmt.Errorf("update headquarter: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrHeadquarterNotFound
	}
	return nil
}

func (r *HeadquarterRepository) Delete(ctx context.Context, id domain.HeadquarterID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM headquarters WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete headquarter: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrHeadquarterNotFound
	}
	return nil
}
