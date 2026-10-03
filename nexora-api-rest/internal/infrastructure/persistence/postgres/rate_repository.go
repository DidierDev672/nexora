package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// RateSchemaDDL is the schema definition derived 1:1 from domain.Rate.
const RateSchemaDDL = `
CREATE TABLE IF NOT EXISTS rates (
    id                 VARCHAR(36) PRIMARY KEY,
    name               VARCHAR(150) NOT NULL,
    headquarter_id     VARCHAR(36) NOT NULL,
    subheadquarter_id  VARCHAR(36),
    room_type_id       VARCHAR(36),
    modality           VARCHAR(30) NOT NULL,
    price              NUMERIC(12, 2) NOT NULL,
    duration_units     INTEGER NOT NULL DEFAULT 1,
    start_time         TIME,
    end_time           TIME,
    days_of_week       VARCHAR(50) NOT NULL DEFAULT 'all',
    status             VARCHAR(30) NOT NULL DEFAULT 'active',
    created_by         VARCHAR(100) NOT NULL DEFAULT '',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (modality IN ('morning', 'afternoon', 'night', 'daily', 'weekly', 'hourly')),
    CHECK (status IN ('active', 'inactive')),
    CHECK (price > 0),
    CHECK (duration_units >= 1)
);
CREATE INDEX IF NOT EXISTS idx_rates_headquarter_id ON rates(headquarter_id);
CREATE INDEX IF NOT EXISTS idx_rates_subheadquarter_id ON rates(subheadquarter_id);
CREATE INDEX IF NOT EXISTS idx_rates_room_type_id ON rates(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rates_modality ON rates(modality);
CREATE INDEX IF NOT EXISTS idx_rates_status ON rates(status);
CREATE INDEX IF NOT EXISTS idx_rates_query_lookup ON rates(headquarter_id, subheadquarter_id, room_type_id, modality, status);
`

// RateRepository is the Postgres adapter for domain.RateRepository.
type RateRepository struct {
	conn      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

// NewRateRepository instantiates a new RateRepository.
func NewRateRepository(conn *pgxpool.Pool) *RateRepository {
	return &RateRepository{conn: conn}
}

var _ domain.RateRepository = (*RateRepository)(nil)

const rateColumns = "id, name, headquarter_id, subheadquarter_id, room_type_id, modality, price, duration_units, start_time, end_time, days_of_week, status, created_by, created_at, updated_at"

// EnsureTable creates the rates table and its indexes idempotently the first
// time the repository needs it, mirroring the domain model.
func (r *RateRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.conn.Exec(ctx, RateSchemaDDL)
	})
	return r.initError
}

func scanRate(row pgx.Row) (domain.Rate, error) {
	var rate domain.Rate
	var subHeadquarterID, roomTypeID, startTime, endTime *string
	var modality, status string

	err := row.Scan(
		&rate.ID,
		&rate.Name,
		&rate.HeadquarterID,
		&subHeadquarterID,
		&roomTypeID,
		&modality,
		&rate.Price,
		&rate.DurationUnits,
		&startTime,
		&endTime,
		&rate.DaysOfWeek,
		&status,
		&rate.CreatedBy,
		&rate.CreatedAt,
		&rate.UpdatedAt,
	)
	if err != nil {
		return domain.Rate{}, err
	}

	if subHeadquarterID != nil {
		id := domain.SubHeadquarterID(*subHeadquarterID)
		rate.SubHeadquarterID = &id
	}
	if roomTypeID != nil {
		id := domain.RoomTypeID(*roomTypeID)
		rate.RoomTypeID = &id
	}
	rate.StartTime = startTime
	rate.EndTime = endTime
	rate.Modality = domain.RateModality(modality)
	rate.Status = domain.RateStatus(status)

	return rate, nil
}

// nullableID adapts the optional scope references to SQL nullable parameters.
func nullableID[T ~string](value *T) *string {
	if value == nil {
		return nil
	}
	v := string(*value)
	return &v
}

// FindAll returns the rates matching the filter, ordered by creation date.
func (r *RateRepository) FindAll(ctx context.Context, filter domain.RateFilter) ([]domain.Rate, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure rates table: %w", err)
	}

	query := "SELECT " + rateColumns + " FROM rates"
	var conditions []string
	var args []any

	appendCondition := func(column string, value any) {
		args = append(args, value)
		conditions = append(conditions, fmt.Sprintf("%s = $%d", column, len(args)))
	}

	if filter.HeadquarterID != nil {
		appendCondition("headquarter_id", string(*filter.HeadquarterID))
	}
	if filter.SubHeadquarterID != nil {
		appendCondition("subheadquarter_id", string(*filter.SubHeadquarterID))
	}
	if filter.RoomTypeID != nil {
		appendCondition("room_type_id", string(*filter.RoomTypeID))
	}
	if filter.Modality != nil {
		appendCondition("modality", string(*filter.Modality))
	}
	if filter.Status != nil {
		appendCondition("status", string(*filter.Status))
	}

	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query rates: %w", err)
	}
	defer rows.Close()

	var rates []domain.Rate
	for rows.Next() {
		rate, err := scanRate(rows)
		if err != nil {
			return nil, fmt.Errorf("scan rate: %w", err)
		}
		rates = append(rates, rate)
	}

	return rates, rows.Err()
}

// FindByID retrieves a single rate by ID.
func (r *RateRepository) FindByID(ctx context.Context, id domain.RateID) (domain.Rate, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Rate{}, fmt.Errorf("ensure rates table: %w", err)
	}

	res, err := scanRate(r.conn.QueryRow(ctx, "SELECT "+rateColumns+" FROM rates WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Rate{}, domain.ErrRateNotFound
		}
		return domain.Rate{}, fmt.Errorf("query rate by id: %w", err)
	}

	return res, nil
}

// Save inserts a new rate. The first POST provisions the table from the domain
// model through EnsureTable.
func (r *RateRepository) Save(ctx context.Context, rate domain.Rate) (domain.Rate, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Rate{}, fmt.Errorf("ensure rates table: %w", err)
	}

	saved := rate
	query := `
		INSERT INTO rates (
			id, name, headquarter_id, subheadquarter_id, room_type_id,
			modality, price, duration_units, start_time, end_time,
			days_of_week, status, created_by
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			$11, $12, $13
		)
		RETURNING created_at, updated_at
	`

	err := r.conn.QueryRow(
		ctx,
		query,
		rate.ID,
		rate.Name,
		rate.HeadquarterID,
		nullableID(rate.SubHeadquarterID),
		nullableID(rate.RoomTypeID),
		string(rate.Modality),
		float64(rate.Price),
		rate.DurationUnits,
		rate.StartTime,
		rate.EndTime,
		rate.DaysOfWeek,
		string(rate.Status),
		rate.CreatedBy,
	).Scan(&saved.CreatedAt, &saved.UpdatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.Rate{}, domain.ErrRateDuplicated
		}
		return domain.Rate{}, fmt.Errorf("insert rate: %w", err)
	}

	return saved, nil
}

// Update modifies an existing rate in Postgres.
func (r *RateRepository) Update(ctx context.Context, rate domain.Rate) (domain.Rate, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Rate{}, fmt.Errorf("ensure rates table: %w", err)
	}

	query := `
		UPDATE rates
		SET name = $2,
		    headquarter_id = $3,
		    subheadquarter_id = $4,
		    room_type_id = $5,
		    modality = $6,
		    price = $7,
		    duration_units = $8,
		    start_time = $9,
		    end_time = $10,
		    days_of_week = $11,
		    status = $12,
		    updated_at = now()
		WHERE id = $1
		RETURNING created_at, updated_at
	`

	updated := rate
	err := r.conn.QueryRow(
		ctx,
		query,
		rate.ID,
		rate.Name,
		rate.HeadquarterID,
		nullableID(rate.SubHeadquarterID),
		nullableID(rate.RoomTypeID),
		string(rate.Modality),
		float64(rate.Price),
		rate.DurationUnits,
		rate.StartTime,
		rate.EndTime,
		rate.DaysOfWeek,
		string(rate.Status),
	).Scan(&updated.CreatedAt, &updated.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Rate{}, domain.ErrRateNotFound
		}
		if isUniqueViolation(err) {
			return domain.Rate{}, domain.ErrRateDuplicated
		}
		return domain.Rate{}, fmt.Errorf("update rate: %w", err)
	}

	return updated, nil
}

// Delete removes a rate by ID.
func (r *RateRepository) Delete(ctx context.Context, id domain.RateID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure rates table: %w", err)
	}

	cmdTag, err := r.conn.Exec(ctx, "DELETE FROM rates WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete rate: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return domain.ErrRateNotFound
	}

	return nil
}
