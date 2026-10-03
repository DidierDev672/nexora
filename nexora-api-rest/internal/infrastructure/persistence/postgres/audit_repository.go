package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// AuditRepository is the read-only Postgres adapter of domain.AuditRepository.
// It never writes: it aggregates evidence from the operational tables so an
// auditor can contrast the digital state with the physical inspection. The
// rates and room_tariffs tables are provisioned at boot by Migrate, and the
// delegated RateRepository also lazily ensures its own table.
type AuditRepository struct {
	conn *pgxpool.Pool
}

// NewAuditRepository instantiates a new AuditRepository.
func NewAuditRepository(conn *pgxpool.Pool) *AuditRepository {
	return &AuditRepository{conn: conn}
}

var _ domain.AuditRepository = (*AuditRepository)(nil)

const auditBuildingCountsSQL = `
SELECT
	COUNT(*),
	COUNT(*) FILTER (WHERE status = 'available'),
	COUNT(*) FILTER (WHERE status = 'busy'),
	COUNT(*) FILTER (WHERE status = 'maintenance'),
	COUNT(*) FILTER (WHERE status = 'cleaning'),
	COUNT(*) FILTER (WHERE status = 'inactive'),
	COUNT(*) FILTER (WHERE status = 'occupied')
FROM buildings;
`

const auditRoomCountsSQL = `
SELECT
	COUNT(*),
	COUNT(*) FILTER (WHERE status = 'available'),
	COUNT(*) FILTER (WHERE status = 'busy'),
	COUNT(*) FILTER (WHERE status = 'maintenance'),
	COUNT(*) FILTER (WHERE status = 'cleaning'),
	COUNT(*) FILTER (WHERE status = 'inactive')
FROM rooms;
`

const auditHeadquarterCountsSQL = `
SELECT
	COUNT(*),
	COUNT(*) FILTER (WHERE status = 'active'),
	COUNT(*) FILTER (WHERE status = 'inactive')
FROM headquarters;
`

const auditSubHeadquarterCountsSQL = `
SELECT
	COUNT(*),
	COUNT(*) FILTER (WHERE status = 'active'),
	COUNT(*) FILTER (WHERE status = 'inactive')
FROM sub_headquarters;
`

const auditBedTypeCountsSQL = `
SELECT COUNT(*)
FROM bed_types;
`

const auditRateCountsSQL = `
SELECT
	COUNT(*),
	COUNT(*) FILTER (WHERE status = 'active'),
	COUNT(*) FILTER (WHERE status = 'inactive')
FROM rates;
`

const auditRoomTariffCountsSQL = `
SELECT
	COUNT(*),
	COUNT(*) FILTER (WHERE status = 'active'),
	COUNT(*) FILTER (WHERE status = 'inactive'),
	COUNT(*) FILTER (WHERE is_default)
FROM room_tariffs;
`

// Summary aggregates the dashboard totals for every auditable entity.
func (r *AuditRepository) Summary(ctx context.Context) (domain.AuditSummary, error) {
	var summary domain.AuditSummary

	if err := r.conn.QueryRow(ctx, auditBuildingCountsSQL).Scan(
		&summary.Buildings.Total,
		&summary.Buildings.Available,
		&summary.Buildings.Busy,
		&summary.Buildings.Maintenance,
		&summary.Buildings.Cleaning,
		&summary.Buildings.Inactive,
		&summary.Buildings.Occupied,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary buildings: %w", err)
	}

	if err := r.conn.QueryRow(ctx, auditRoomCountsSQL).Scan(
		&summary.Rooms.Total,
		&summary.Rooms.Available,
		&summary.Rooms.Busy,
		&summary.Rooms.Maintenance,
		&summary.Rooms.Cleaning,
		&summary.Rooms.Inactive,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary rooms: %w", err)
	}

	if err := r.conn.QueryRow(ctx, auditBedTypeCountsSQL).Scan(
		&summary.BedTypes.Total,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary bed types: %w", err)
	}

	if err := r.conn.QueryRow(ctx, auditHeadquarterCountsSQL).Scan(
		&summary.Headquarters.Total,
		&summary.Headquarters.Active,
		&summary.Headquarters.Inactive,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary headquarters: %w", err)
	}

	if err := r.conn.QueryRow(ctx, auditSubHeadquarterCountsSQL).Scan(
		&summary.SubHeadquarters.Total,
		&summary.SubHeadquarters.Active,
		&summary.SubHeadquarters.Inactive,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary sub headquarters: %w", err)
	}

	if err := r.conn.QueryRow(ctx, auditRateCountsSQL).Scan(
		&summary.Rates.Total,
		&summary.Rates.Active,
		&summary.Rates.Inactive,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary rates: %w", err)
	}

	if err := r.conn.QueryRow(ctx, auditRoomTariffCountsSQL).Scan(
		&summary.RoomTariffs.Total,
		&summary.RoomTariffs.Active,
		&summary.RoomTariffs.Inactive,
		&summary.RoomTariffs.Defaults,
	); err != nil {
		return domain.AuditSummary{}, fmt.Errorf("audit summary room tariffs: %w", err)
	}

	return summary, nil
}

const auditRoomColumns = `
	r.id, r.number, r.floor, r.room_types_id, r.building_id, r.headquarters_id, r.status,
	rt.id, rt.rate_id, rate.price
`

// scanAuditRoom interprets one row of the room audit projection. The tariff
// columns are nullable: a room without an active default tariff yields nil.
func scanAuditRoom(row pgx.Row) (domain.AuditRoom, error) {
	var room domain.AuditRoom
	var tariffID, rateID *string
	var price *float64

	err := row.Scan(
		&room.ID, &room.Number, &room.Floor, &room.RoomTypeID, &room.BuildingID,
		&room.HeadquartersID, &room.Status,
		&tariffID, &rateID, &price,
	)
	if err != nil {
		return domain.AuditRoom{}, err
	}

	if tariffID != nil {
		id := domain.RoomTariffID(*tariffID)
		room.DefaultTariffID = &id
	}
	if rateID != nil {
		id := domain.RateID(*rateID)
		room.RateID = &id
	}
	if price != nil {
		price := domain.BasePrice(*price)
		room.Price = &price
	}

	return room, nil
}

// queryRooms runs the shared room audit projection with an optional WHERE
// clause (e.g. status filtering) and stable ordering for reproducible audits.
func (r *AuditRepository) queryRooms(ctx context.Context, where string, args ...any) ([]domain.AuditRoom, error) {
	query := `
		SELECT ` + auditRoomColumns + `
		FROM rooms r
		LEFT JOIN room_tariffs rt
			ON rt.room_id = r.id AND rt.is_default = true AND rt.status = 'active'
		LEFT JOIN rates rate ON rate.id = rt.rate_id`
	if where != "" {
		query += " " + where
	}
	query += `
		ORDER BY r.floor, r.number, r.id`

	rows, err := r.conn.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query audit rooms: %w", err)
	}
	defer rows.Close()

	var rooms []domain.AuditRoom
	for rows.Next() {
		room, err := scanAuditRoom(rows)
		if err != nil {
			return nil, fmt.Errorf("scan audit room: %w", err)
		}
		rooms = append(rooms, room)
	}

	return rooms, rows.Err()
}

// Rooms returns the whole auditable room inventory with its prevailing tariff.
func (r *AuditRepository) Rooms(ctx context.Context) ([]domain.AuditRoom, error) {
	return r.queryRooms(ctx, "")
}

// RoomsByStatus filters the auditable room inventory by lifecycle state.
func (r *AuditRepository) RoomsByStatus(ctx context.Context, status domain.RoomStatus) ([]domain.AuditRoom, error) {
	return r.queryRooms(ctx, "WHERE r.status = $1", status)
}

// Rates delegates to the existing rate adapter so the audit module reuses the
// proven catalog query (and its lazy table provisioning) instead of duplicating
// the scanning logic.
func (r *AuditRepository) Rates(ctx context.Context) ([]domain.Rate, error) {
	rateRepo := NewRateRepository(r.conn)
	return rateRepo.FindAll(ctx, domain.RateFilter{})
}

// RoomsWithoutTariff returns the rooms with no active room tariff assigned,
// i.e. the coverage gaps that leave a room unpriced when sold.
func (r *AuditRepository) RoomsWithoutTariff(ctx context.Context) ([]domain.AuditRoomGap, error) {
	const query = `
		SELECT r.id, r.number, r.floor, r.room_types_id, r.building_id, r.headquarters_id, r.status
		FROM rooms r
		WHERE NOT EXISTS (
			SELECT 1 FROM room_tariffs rt
			WHERE rt.room_id = r.id AND rt.status = 'active'
		)
		ORDER BY r.floor, r.number, r.id`

	rows, err := r.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query audit rooms without tariff: %w", err)
	}
	defer rows.Close()

	var gaps []domain.AuditRoomGap
	for rows.Next() {
		var gap domain.AuditRoomGap
		if err := rows.Scan(
			&gap.ID, &gap.Number, &gap.Floor, &gap.RoomTypeID, &gap.BuildingID,
			&gap.HeadquartersID, &gap.Status,
		); err != nil {
			return nil, fmt.Errorf("scan audit room gap: %w", err)
		}
		gaps = append(gaps, gap)
	}

	return gaps, rows.Err()
}

// InactiveTariffsInUse returns the active room-rate assignments that point at
// an inactive rate from the catalog (pricing consistency breach).
func (r *AuditRepository) InactiveTariffsInUse(ctx context.Context) ([]domain.InactiveTariffInUse, error) {
	const query = `
		SELECT rt.id, rt.room_id, rt.rate_id, rate.name, rate.price, rt.is_default
		FROM room_tariffs rt
		JOIN rates rate ON rate.id = rt.rate_id
		WHERE rt.status = 'active' AND rate.status = 'inactive'
		ORDER BY rt.created_at DESC`

	rows, err := r.conn.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query audit inactive tariffs in use: %w", err)
	}
	defer rows.Close()

	var breaches []domain.InactiveTariffInUse
	for rows.Next() {
		var breach domain.InactiveTariffInUse
		var price float64
		if err := rows.Scan(
			&breach.ID, &breach.RoomID, &breach.RateID, &breach.RateName, &price, &breach.IsDefault,
		); err != nil {
			return nil, fmt.Errorf("scan audit inactive tariff in use: %w", err)
		}
		breach.RatePrice = domain.BasePrice(price)
		breaches = append(breaches, breach)
	}

	return breaches, rows.Err()
}
