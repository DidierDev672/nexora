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

// StaySchemaDDL is the schema definition derived 1:1 from domain.Stay. A stay
// can host several guests, so the N:N pivots stays_persons is created here too;
// it is the canonical source for domain.Stay.PersonIDs.
const StaySchemaDDL = `
CREATE TABLE IF NOT EXISTS stays (
    id               VARCHAR(36) PRIMARY KEY,
    room_id          VARCHAR(36) NOT NULL,
    reservation_id   VARCHAR(36) NOT NULL,
    check_in_date    TIMESTAMPTZ NOT NULL,
    check_out_date   TIMESTAMPTZ NOT NULL,
    payment_method   VARCHAR(30) NOT NULL,
    security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    remarks          TEXT NOT NULL DEFAULT '',
    status           VARCHAR(30) NOT NULL DEFAULT 'progress',
    created_by       VARCHAR(100) NOT NULL DEFAULT '',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (payment_method IN ('cash', 'card', 'bank transfer')),
    CHECK (status IN ('progress', 'completed', 'canceled')),
    CHECK (security_deposit >= 0),
    CHECK (check_out_date > check_in_date)
);
CREATE TABLE IF NOT EXISTS stays_persons (
    stay_id   VARCHAR(36) NOT NULL REFERENCES stays(id) ON DELETE CASCADE,
    person_id VARCHAR(36) NOT NULL REFERENCES persons(id) ON DELETE RESTRICT,
    PRIMARY KEY (stay_id, person_id)
);
CREATE INDEX IF NOT EXISTS idx_stays_room_id ON stays(room_id);
CREATE INDEX IF NOT EXISTS idx_stays_reservation_id ON stays(reservation_id);
CREATE INDEX IF NOT EXISTS idx_stays_dates ON stays(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_stays_status ON stays(status);
CREATE INDEX IF NOT EXISTS idx_stays_persons_person_id ON stays_persons(person_id);
`

// StayRepository is the Postgres adapter for domain.StayRepository.
type StayRepository struct {
	conn      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

// NewStayRepository instantiates a new StayRepository.
func NewStayRepository(conn *pgxpool.Pool) *StayRepository {
	return &StayRepository{conn: conn}
}

var _ domain.StayRepository = (*StayRepository)(nil)

// staySelect returns a stay row with its PersonIDs reconstructed from the N:N
// pivot table via array_agg (empty array when the stay has no guests). It must
// be followed by a GROUP BY over every non-aggregated stay column.
const staySelect = `SELECT s.id, s.room_id, s.reservation_id,
	COALESCE(ARRAY_AGG(sp.person_id) FILTER (WHERE sp.person_id IS NOT NULL), ARRAY[]::VARCHAR[]) AS person_ids,
	s.check_in_date, s.check_out_date, s.payment_method, s.security_deposit, s.remarks,
	s.status, s.created_by, s.created_at, s.updated_at
	FROM stays s
	LEFT JOIN stays_persons sp ON sp.stay_id = s.id`

const stayGroupBy = `GROUP BY s.id, s.room_id, s.reservation_id, s.check_in_date, s.check_out_date,
	s.payment_method, s.security_deposit, s.remarks, s.status, s.created_by, s.created_at, s.updated_at`

// EnsureTable creates the stays table idempotently based on the model if it doesn't exist.
func (r *StayRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.conn.Exec(ctx, StaySchemaDDL)
	})
	return r.initError
}

func scanStay(row pgx.Row) (domain.Stay, error) {
	var stay domain.Stay
	var personIDs []string
	var pmStr, statusStr string

	err := row.Scan(
		&stay.ID,
		&stay.RoomID,
		&stay.ReservationID,
		&personIDs,
		&stay.CheckInDate,
		&stay.CheckOutDate,
		&pmStr,
		&stay.SecurityDeposit,
		&stay.Remarks,
		&statusStr,
		&stay.CreatedBy,
		&stay.CreatedAt,
		&stay.UpdatedAt,
	)
	if err != nil {
		return domain.Stay{}, err
	}

	stay.PaymentMethod = domain.PaymentMethod(pmStr)
	stay.Status = domain.StayStatus(statusStr)
	stay.PersonIDs = make([]domain.PersonID, len(personIDs))
	for i, v := range personIDs {
		stay.PersonIDs[i] = domain.PersonID(v)
	}
	return stay, nil
}

// FindAll queries all stays.
func (r *StayRepository) FindAll(ctx context.Context) ([]domain.Stay, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure stays table: %w", err)
	}

	rows, err := r.conn.Query(ctx, staySelect+" "+stayGroupBy+" ORDER BY s.created_at DESC")
	if err != nil {
		return nil, fmt.Errorf("query stays: %w", err)
	}
	defer rows.Close()

	var stays []domain.Stay
	for rows.Next() {
		s, err := scanStay(rows)
		if err != nil {
			return nil, fmt.Errorf("scan stay: %w", err)
		}
		stays = append(stays, s)
	}

	return stays, rows.Err()
}

// FindByID retrieves a single stay by ID.
func (r *StayRepository) FindByID(ctx context.Context, id domain.StayID) (domain.Stay, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Stay{}, fmt.Errorf("ensure stays table: %w", err)
	}

	res, err := scanStay(r.conn.QueryRow(ctx, staySelect+" WHERE s.id = $1 "+stayGroupBy, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Stay{}, domain.ErrStayNotFound
		}
		return domain.Stay{}, fmt.Errorf("query stay by id: %w", err)
	}

	return res, nil
}

// FindByRoomID returns the most recent stay of a room regardless of its status.
func (r *StayRepository) FindByRoomID(ctx context.Context, roomID domain.RoomID) (domain.Stay, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Stay{}, fmt.Errorf("ensure stays table: %w", err)
	}

	res, err := scanStay(r.conn.QueryRow(
		ctx,
		staySelect+" WHERE s.room_id = $1 "+stayGroupBy+" ORDER BY s.check_in_date DESC LIMIT 1",
		roomID,
	))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Stay{}, domain.ErrStayNotFound
		}
		return domain.Stay{}, fmt.Errorf("query stay by room id: %w", err)
	}

	return res, nil
}

// FindPersonsByStayID returns the guests linked to a stay via the N:N pivot,
// reusing the person projection so each guest carries its roles too.
func (r *StayRepository) FindPersonsByStayID(ctx context.Context, stayID domain.StayID) ([]domain.Person, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure stays table: %w", err)
	}

	rows, err := r.conn.Query(ctx, personSelect+" JOIN stays_persons sp ON sp.person_id = p.id WHERE sp.stay_id = $1 "+personGroupBy+" ORDER BY p.name", stayID)
	if err != nil {
		return nil, fmt.Errorf("query persons by stay id: %w", err)
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

// Save inserts a new stay into Postgres. If this is the first stay,
// EnsureTable automatically provisions the table based on the domain model.
func (r *StayRepository) Save(ctx context.Context, stay domain.Stay) (domain.Stay, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Stay{}, fmt.Errorf("ensure stays table: %w", err)
	}

	tx, err := r.conn.Begin(ctx)
	if err != nil {
		return domain.Stay{}, fmt.Errorf("begin save stay: %w", err)
	}
	defer tx.Rollback(ctx)

	saved := stay
	query := `
		INSERT INTO stays (
			id, room_id, reservation_id, check_in_date, check_out_date,
			payment_method, security_deposit, remarks, status, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now())
		RETURNING created_at, updated_at
	`

	err = tx.QueryRow(
		ctx,
		query,
		stay.ID,
		stay.RoomID,
		stay.ReservationID,
		stay.CheckInDate,
		stay.CheckOutDate,
		string(stay.PaymentMethod),
		stay.SecurityDeposit,
		stay.Remarks,
		string(stay.Status),
		stay.CreatedBy,
	).Scan(&saved.CreatedAt, &saved.UpdatedAt)
	if err != nil {
		return domain.Stay{}, fmt.Errorf("insert stay: %w", err)
	}

	if err := r.upsertStayPersons(ctx, tx, stay.ID, stay.PersonIDs); err != nil {
		return domain.Stay{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Stay{}, fmt.Errorf("commit save stay: %w", err)
	}

	return saved, nil
}

// Update modifies an existing stay in Postgres.
func (r *StayRepository) Update(ctx context.Context, stay domain.Stay) (domain.Stay, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Stay{}, fmt.Errorf("ensure stays table: %w", err)
	}

	tx, err := r.conn.Begin(ctx)
	if err != nil {
		return domain.Stay{}, fmt.Errorf("begin update stay: %w", err)
	}
	defer tx.Rollback(ctx)

	query := `
		UPDATE stays
		SET room_id = $2,
		    reservation_id = $3,
		    check_in_date = $4,
		    check_out_date = $5,
		    payment_method = $6,
		    security_deposit = $7,
		    remarks = $8,
		    status = $9,
		    updated_at = now()
		WHERE id = $1
		RETURNING updated_at
	`

	updated := stay
	err = tx.QueryRow(
		ctx,
		query,
		stay.ID,
		stay.RoomID,
		stay.ReservationID,
		stay.CheckInDate,
		stay.CheckOutDate,
		string(stay.PaymentMethod),
		stay.SecurityDeposit,
		stay.Remarks,
		string(stay.Status),
	).Scan(&updated.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Stay{}, domain.ErrStayNotFound
		}
		return domain.Stay{}, fmt.Errorf("update stay: %w", err)
	}

	if _, err := tx.Exec(ctx, "DELETE FROM stays_persons WHERE stay_id = $1", stay.ID); err != nil {
		return domain.Stay{}, fmt.Errorf("clear stay persons: %w", err)
	}
	if err := r.upsertStayPersons(ctx, tx, stay.ID, stay.PersonIDs); err != nil {
		return domain.Stay{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Stay{}, fmt.Errorf("commit update stay: %w", err)
	}

	return updated, nil
}

// upsertStayPersons writes the N:N pivot rows inside the active transaction
// (uses ON CONFLICT DO NOTHING because the pivot has a composite PK).
func (r *StayRepository) upsertStayPersons(ctx context.Context, tx pgx.Tx, stayID domain.StayID, personIDs []domain.PersonID) error {
	for _, p := range personIDs {
		if _, err := tx.Exec(ctx,
			"INSERT INTO stays_persons (stay_id, person_id) VALUES ($1, $2) ON CONFLICT (stay_id, person_id) DO NOTHING",
			stayID, p,
		); err != nil {
			return fmt.Errorf("insert stay person pivot: %w", err)
		}
	}
	return nil
}

// Delete removes a stay by ID.
func (r *StayRepository) Delete(ctx context.Context, id domain.StayID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure stays table: %w", err)
	}

	cmdTag, err := r.conn.Exec(ctx, "DELETE FROM stays WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete stay: %w", err)
	}
	if cmdTag.RowsAffected() == 0 {
		return domain.ErrStayNotFound
	}

	return nil
}
