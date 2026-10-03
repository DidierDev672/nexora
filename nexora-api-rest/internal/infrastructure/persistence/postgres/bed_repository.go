package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// BedRepository is the Postgres adapter of domain.BedRepository.
type BedRepository struct {
	conn *pgxpool.Pool
}

func NewBedRepository(conn *pgxpool.Pool) *BedRepository {
	return &BedRepository{conn: conn}
}

var _ domain.BedRepository = (*BedRepository)(nil)

// bedSelect returns a bed row with its TypesBedID reconstructed from the N:N
// pivot table via array_agg (empty array when the bed has no bed types yet).
// It must be followed by a GROUP BY over every non-aggregated bed column.
const bedSelect = `SELECT b.id, b.room_id,
	COALESCE(ARRAY_AGG(bbt.bed_type_id) FILTER (WHERE bbt.bed_type_id IS NOT NULL), ARRAY[]::VARCHAR[]) AS types_bed_id,
	b.etiquette, b.status, b.created_by, b.created_at, b.updated_at
	FROM beds b
	LEFT JOIN beds_bed_types bbt ON bbt.bed_id = b.id`

const bedGroupBy = `GROUP BY b.id, b.room_id, b.etiquette, b.status, b.created_by, b.created_at, b.updated_at`

func scanBed(row pgx.Row) (domain.Bed, error) {
	var bed domain.Bed
	var typesBedID []string
	err := row.Scan(
		&bed.ID, &bed.RoomID, &typesBedID, &bed.Etiquette,
		&bed.Status, &bed.CreatedBy, &bed.CreatedAt, &bed.UpdatedAt,
	)
	if err != nil {
		return domain.Bed{}, err
	}
	bed.TypesBedID = make([]domain.BedTypeID, len(typesBedID))
	for i, v := range typesBedID {
		bed.TypesBedID[i] = domain.BedTypeID(v)
	}
	return bed, nil
}

// firstBedTypeID returns the anchor bed type id that remains persisted in the
// legacy beds.types_bed_id column (NOT NULL legacy anchor). When the slice is
// empty it returns the zero value, which the caller must guard against.
func firstBedTypeID(typesBedID []domain.BedTypeID) domain.BedTypeID {
	if len(typesBedID) == 0 {
		return ""
	}
	return typesBedID[0]
}

func (r *BedRepository) FindAll(ctx context.Context) ([]domain.Bed, error) {
	rows, err := r.conn.Query(ctx, bedSelect+" "+bedGroupBy)
	if err != nil {
		return nil, fmt.Errorf("query beds: %w", err)
	}
	defer rows.Close()

	var beds []domain.Bed
	for rows.Next() {
		bed, err := scanBed(rows)
		if err != nil {
			return nil, fmt.Errorf("scan bed: %w", err)
		}
		beds = append(beds, bed)
	}
	return beds, rows.Err()
}

func (r *BedRepository) FindByID(ctx context.Context, id domain.BedID) (domain.Bed, error) {
	bed, err := scanBed(r.conn.QueryRow(ctx, bedSelect+" WHERE b.id = $1 "+bedGroupBy, id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Bed{}, domain.ErrBedNotFound
		}
		return domain.Bed{}, fmt.Errorf("query bed by id: %w", err)
	}
	return bed, nil
}

func (r *BedRepository) FindByEtiquetteAndRoom(ctx context.Context, etiquette string, roomID domain.RoomID) (domain.Bed, error) {
	bed, err := scanBed(r.conn.QueryRow(ctx, bedSelect+" WHERE b.etiquette = $1 AND b.room_id = $2 "+bedGroupBy, etiquette, roomID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Bed{}, domain.ErrBedNotFound
		}
		return domain.Bed{}, fmt.Errorf("query bed by etiquette and room: %w", err)
	}
	return bed, nil
}

func (r *BedRepository) Save(ctx context.Context, bed domain.Bed) error {
	tx, err := r.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin save bed: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx,
		"INSERT INTO beds (id, room_id, types_bed_id, etiquette, status, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, now(), now())",
		bed.ID, bed.RoomID, firstBedTypeID(bed.TypesBedID), bed.Etiquette, bed.Status, bed.CreatedBy,
	); err != nil {
		if isUniqueViolation(err) {
			return domain.ErrBedDuplicated
		}
		return fmt.Errorf("insert bed: %w", err)
	}

	if err := r.upsertBedTypes(ctx, tx, bed.ID, bed.TypesBedID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *BedRepository) Update(ctx context.Context, bed domain.Bed) error {
	tx, err := r.conn.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin update bed: %w", err)
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx,
		"UPDATE beds SET room_id = $2, types_bed_id = $3, etiquette = $4, status = $5, updated_at = now() WHERE id = $1",
		bed.ID, bed.RoomID, firstBedTypeID(bed.TypesBedID), bed.Etiquette, bed.Status,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrBedDuplicated
		}
		return fmt.Errorf("update bed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrBedNotFound
	}

	if _, err := tx.Exec(ctx, "DELETE FROM beds_bed_types WHERE bed_id = $1", bed.ID); err != nil {
		return fmt.Errorf("clear bed types: %w", err)
	}
	if err := r.upsertBedTypes(ctx, tx, bed.ID, bed.TypesBedID); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// upsertBedTypes writes the N:N pivot rows inside the active transaction
// (uses ON CONFLICT DO NOTHING because the pivot has a composite PK).
func (r *BedRepository) upsertBedTypes(ctx context.Context, tx pgx.Tx, bedID domain.BedID, typesBedID []domain.BedTypeID) error {
	for _, t := range typesBedID {
		if _, err := tx.Exec(ctx,
			"INSERT INTO beds_bed_types (bed_id, bed_type_id) VALUES ($1, $2) ON CONFLICT (bed_id, bed_type_id) DO NOTHING",
			bedID, t,
		); err != nil {
			return fmt.Errorf("insert bed type pivot: %w", err)
		}
	}
	return nil
}

func (r *BedRepository) Delete(ctx context.Context, id domain.BedID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM beds WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete bed: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrBedNotFound
	}
	return nil
}
