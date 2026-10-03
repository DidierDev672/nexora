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

// RoomTariffSchemaDDL is the schema definition derived 1:1 from domain.RoomTariff.
const RoomTariffSchemaDDL = `
CREATE TABLE IF NOT EXISTS room_tariffs (
    id          VARCHAR(36) PRIMARY KEY,
    room_id     VARCHAR(36) NOT NULL,
    rate_id     VARCHAR(36) NOT NULL,
    is_default  BOOLEAN NOT NULL DEFAULT false,
    status      VARCHAR(30) NOT NULL DEFAULT 'active',
    created_by  VARCHAR(100) NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (status IN ('active', 'inactive'))
);
CREATE INDEX IF NOT EXISTS idx_room_tariffs_room_id ON room_tariffs(room_id);
CREATE INDEX IF NOT EXISTS idx_room_tariffs_rate_id ON room_tariffs(rate_id);
CREATE INDEX IF NOT EXISTS idx_room_tariffs_status ON room_tariffs(status);
`

// RoomTariffRepository is the Postgres adapter for domain.RoomTariffRepository.
type RoomTariffRepository struct {
	conn      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

// NewRoomTariffRepository instantiates a new RoomTariffRepository.
func NewRoomTariffRepository(conn *pgxpool.Pool) *RoomTariffRepository {
	return &RoomTariffRepository{conn: conn}
}

var _ domain.RoomTariffRepository = (*RoomTariffRepository)(nil)

const roomTariffColumns = "id, room_id, rate_id, is_default, status, created_by, created_at, updated_at"

// EnsureTable creates the room_tariffs table and its indexes idempotently the
// first time the repository needs it, mirroring the domain model.
func (r *RoomTariffRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.conn.Exec(ctx, RoomTariffSchemaDDL)
	})
	return r.initError
}

func scanRoomTariff(row pgx.Row) (domain.RoomTariff, error) {
	var tariff domain.RoomTariff
	var status string

	err := row.Scan(
		&tariff.ID,
		&tariff.RoomID,
		&tariff.RateID,
		&tariff.IsDefault,
		&status,
		&tariff.CreatedBy,
		&tariff.CreatedAt,
		&tariff.UpdatedAt,
	)
	if err != nil {
		return domain.RoomTariff{}, err
	}

	tariff.Status = domain.RoomTariffStatus(status)
	return tariff, nil
}

// FindAll queries all room tariffs, ordered by creation date.
func (r *RoomTariffRepository) FindAll(ctx context.Context) ([]domain.RoomTariff, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure room_tariffs table: %w", err)
	}

	rows, err := r.conn.Query(ctx, "SELECT "+roomTariffColumns+" FROM room_tariffs ORDER BY created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("query room_tariffs: %w", err)
	}
	defer rows.Close()

	var tariffs []domain.RoomTariff
	for rows.Next() {
		tariff, err := scanRoomTariff(rows)
		if err != nil {
			return nil, fmt.Errorf("scan room tariff: %w", err)
		}
		tariffs = append(tariffs, tariff)
	}

	return tariffs, rows.Err()
}

// FindByID retrieves a single room tariff by ID.
func (r *RoomTariffRepository) FindByID(ctx context.Context, id domain.RoomTariffID) (domain.RoomTariff, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.RoomTariff{}, fmt.Errorf("ensure room_tariffs table: %w", err)
	}

	res, err := scanRoomTariff(r.conn.QueryRow(ctx, "SELECT "+roomTariffColumns+" FROM room_tariffs WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.RoomTariff{}, domain.ErrRoomTariffNotFound
		}
		return domain.RoomTariff{}, fmt.Errorf("query room tariff by id: %w", err)
	}

	return res, nil
}

// FindByRoom queries the tariffs applied to a single room, the default one
// first so a client can render the prevailing rate without extra sorting.
func (r *RoomTariffRepository) FindByRoom(ctx context.Context, roomID domain.RoomID) ([]domain.RoomTariff, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure room_tariffs table: %w", err)
	}

	rows, err := r.conn.Query(ctx,
		"SELECT "+roomTariffColumns+" FROM room_tariffs WHERE room_id = $1 ORDER BY is_default DESC, created_at DESC",
		roomID)
	if err != nil {
		return nil, fmt.Errorf("query room_tariffs by room: %w", err)
	}
	defer rows.Close()

	var tariffs []domain.RoomTariff
	for rows.Next() {
		tariff, err := scanRoomTariff(rows)
		if err != nil {
			return nil, fmt.Errorf("scan room tariff: %w", err)
		}
		tariffs = append(tariffs, tariff)
	}

	return tariffs, rows.Err()
}

// Save inserts a new room tariff. The first POST provisions the table from the
// domain model through EnsureTable.
func (r *RoomTariffRepository) Save(ctx context.Context, tariff domain.RoomTariff) (domain.RoomTariff, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.RoomTariff{}, fmt.Errorf("ensure room_tariffs table: %w", err)
	}

	saved := tariff
	query := `
		INSERT INTO room_tariffs (
			id, room_id, rate_id, is_default, status, created_by
		) VALUES (
			$1, $2, $3, $4, $5, $6
		)
		RETURNING created_at, updated_at
	`

	err := r.conn.QueryRow(
		ctx,
		query,
		tariff.ID,
		tariff.RoomID,
		tariff.RateID,
		tariff.IsDefault,
		string(tariff.Status),
		tariff.CreatedBy,
	).Scan(&saved.CreatedAt, &saved.UpdatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.RoomTariff{}, domain.ErrRoomTariffDuplicated
		}
		return domain.RoomTariff{}, fmt.Errorf("insert room tariff: %w", err)
	}

	return saved, nil
}

// Update modifies an existing room tariff in Postgres.
func (r *RoomTariffRepository) Update(ctx context.Context, tariff domain.RoomTariff) (domain.RoomTariff, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.RoomTariff{}, fmt.Errorf("ensure room_tariffs table: %w", err)
	}

	query := `
		UPDATE room_tariffs
		SET room_id = $2,
		    rate_id = $3,
		    is_default = $4,
		    status = $5,
		    updated_at = now()
		WHERE id = $1
		RETURNING created_at, updated_at
	`

	updated := tariff
	err := r.conn.QueryRow(
		ctx,
		query,
		tariff.ID,
		tariff.RoomID,
		tariff.RateID,
		tariff.IsDefault,
		string(tariff.Status),
	).Scan(&updated.CreatedAt, &updated.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.RoomTariff{}, domain.ErrRoomTariffNotFound
		}
		if isUniqueViolation(err) {
			return domain.RoomTariff{}, domain.ErrRoomTariffDuplicated
		}
		return domain.RoomTariff{}, fmt.Errorf("update room tariff: %w", err)
	}

	return updated, nil
}

// Delete removes a room tariff by ID.
func (r *RoomTariffRepository) Delete(ctx context.Context, id domain.RoomTariffID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure room_tariffs table: %w", err)
	}

	cmdTag, err := r.conn.Exec(ctx, "DELETE FROM room_tariffs WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete room tariff: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return domain.ErrRoomTariffNotFound
	}

	return nil
}
