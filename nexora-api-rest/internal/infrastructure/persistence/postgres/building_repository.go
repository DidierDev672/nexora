package postgres

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// buildingSchema is derived 1:1 from domain.Building: same columns, the
// status enum as a CHECK constraint, and per-headquarter name uniqueness.
// It runs both as a boot migration (before rooms, which reference buildings
// on delete cascade) and on demand via ensureTable: CREATE TABLE IF NOT EXISTS
// keeps the second execution a no-op, so lazy creation still covers databases
// that predate the migration list.
const buildingSchema = `
CREATE TABLE IF NOT EXISTS buildings (
    id                   VARCHAR(36) PRIMARY KEY,
    name                 VARCHAR(150) NOT NULL,
    floor_number         INTEGER NOT NULL CHECK (floor_number >= 1),
    headquarters_id      VARCHAR(36) NOT NULL REFERENCES headquarters(id) ON DELETE CASCADE,
    sub_headquarters_id  VARCHAR(36) REFERENCES sub_headquarters(id) ON DELETE SET NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'available',
    created_by           VARCHAR(100) NOT NULL DEFAULT '',
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (headquarters_id, name),
    CHECK (status IN ('available', 'busy', 'maintenance', 'cleaning', 'inactive', 'occupied'))
);
`

// BuildingRepository is the Postgres adapter of domain.BuildingRepository.
type BuildingRepository struct {
	conn *pgxpool.Pool
	once sync.Once
	err  error
}

func NewBuildingRepository(conn *pgxpool.Pool) *BuildingRepository {
	return &BuildingRepository{conn: conn}
}

var _ domain.BuildingRepository = (*BuildingRepository)(nil)

// ensureTable guarantees the buildings table exists before any operation. The
// DDL runs once per repository instance (sync.Once).
func (r *BuildingRepository) ensureTable(ctx context.Context) error {
	r.once.Do(func() {
		_, r.err = r.conn.Exec(ctx, buildingSchema)
	})
	return r.err
}

const buildingColumns = "id, name, floor_number, headquarters_id, sub_headquarters_id, status, created_by, created_at, updated_at"

func scanBuilding(row pgx.Row) (domain.Building, error) {
	var building domain.Building
	// sub_headquarters_id is nullable: NULL yields nil, a value a pointer.
	var subHeadquartersID *string
	err := row.Scan(
		&building.ID, &building.Name, &building.FloorNumber, &building.HeadquartersID,
		&subHeadquartersID,
		&building.Status, &building.CreatedBy, &building.CreatedAt, &building.UpdatedAt,
	)
	if err != nil {
		return domain.Building{}, err
	}
	if subHeadquartersID != nil {
		id := domain.SubHeadquarterID(*subHeadquartersID)
		building.SubHeadquartersID = &id
	}
	return building, nil
}

func nullableSubHeadquarterForBuilding(id *domain.SubHeadquarterID) *string {
	if id == nil {
		return nil
	}
	v := string(*id)
	return &v
}

func (r *BuildingRepository) FindAll(ctx context.Context) ([]domain.Building, error) {
	if err := r.ensureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure buildings table: %w", err)
	}
	rows, err := r.conn.Query(ctx, "SELECT "+buildingColumns+" FROM buildings")
	if err != nil {
		return nil, fmt.Errorf("query buildings: %w", err)
	}
	defer rows.Close()

	var buildings []domain.Building
	for rows.Next() {
		building, err := scanBuilding(rows)
		if err != nil {
			return nil, fmt.Errorf("scan building: %w", err)
		}
		buildings = append(buildings, building)
	}
	return buildings, rows.Err()
}

func (r *BuildingRepository) FindByID(ctx context.Context, id domain.BuildingID) (domain.Building, error) {
	if err := r.ensureTable(ctx); err != nil {
		return domain.Building{}, fmt.Errorf("ensure buildings table: %w", err)
	}
	building, err := scanBuilding(r.conn.QueryRow(ctx, "SELECT "+buildingColumns+" FROM buildings WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Building{}, domain.ErrBuildingNotFound
		}
		return domain.Building{}, fmt.Errorf("query building by id: %w", err)
	}
	return building, nil
}

func (r *BuildingRepository) FindByNameAndHeadquarter(ctx context.Context, name string, headquartersID domain.HeadquarterID) (domain.Building, error) {
	if err := r.ensureTable(ctx); err != nil {
		return domain.Building{}, fmt.Errorf("ensure buildings table: %w", err)
	}
	building, err := scanBuilding(r.conn.QueryRow(ctx, "SELECT "+buildingColumns+" FROM buildings WHERE name = $1 AND headquarters_id = $2", name, headquartersID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Building{}, domain.ErrBuildingNotFound
		}
		return domain.Building{}, fmt.Errorf("query building by name and headquarter: %w", err)
	}
	return building, nil
}

func (r *BuildingRepository) Save(ctx context.Context, building domain.Building) error {
	if err := r.ensureTable(ctx); err != nil {
		return fmt.Errorf("ensure buildings table: %w", err)
	}
	_, err := r.conn.Exec(ctx,
		"INSERT INTO buildings (id, name, floor_number, headquarters_id, sub_headquarters_id, status, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, now(), now())",
		building.ID, building.Name, building.FloorNumber, building.HeadquartersID,
		nullableSubHeadquarterForBuilding(building.SubHeadquartersID),
		building.Status, building.CreatedBy,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrBuildingDuplicated
		}
		return fmt.Errorf("insert building: %w", err)
	}
	return nil
}

func (r *BuildingRepository) Update(ctx context.Context, building domain.Building) error {
	if err := r.ensureTable(ctx); err != nil {
		return fmt.Errorf("ensure buildings table: %w", err)
	}
	tag, err := r.conn.Exec(ctx,
		"UPDATE buildings SET name = $2, floor_number = $3, headquarters_id = $4, sub_headquarters_id = $5, status = $6, updated_at = now() WHERE id = $1",
		building.ID, building.Name, building.FloorNumber, building.HeadquartersID,
		nullableSubHeadquarterForBuilding(building.SubHeadquartersID),
		building.Status,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrBuildingDuplicated
		}
		return fmt.Errorf("update building: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrBuildingNotFound
	}
	return nil
}

func (r *BuildingRepository) Delete(ctx context.Context, id domain.BuildingID) error {
	if err := r.ensureTable(ctx); err != nil {
		return fmt.Errorf("ensure buildings table: %w", err)
	}
	tag, err := r.conn.Exec(ctx, "DELETE FROM buildings WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete building: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrBuildingNotFound
	}
	return nil
}
