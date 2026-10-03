package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// RoomRepository is the Postgres adapter of domain.RoomRepository.
type RoomRepository struct {
	conn *pgxpool.Pool
}

func NewRoomRepository(conn *pgxpool.Pool) *RoomRepository {
	return &RoomRepository{conn: conn}
}

var _ domain.RoomRepository = (*RoomRepository)(nil)

const roomColumns = "id, number, floor, room_types_id, building_id, price_override, status, has_reception, created_by, created_at, updated_at"

func scanRoom(row pgx.Row) (domain.Room, error) {
	var room domain.Room
	// price_override is nullable: NULL yields nil, a value a pointer.
	var priceOverride *float64
	err := row.Scan(
		&room.ID, &room.Number, &room.Floor, &room.RoomTypeID, &room.BuildingID,
		&priceOverride,
		&room.Status, &room.HasReception, &room.CreatedBy, &room.CreatedAt, &room.UpdatedAt,
	)
	if err != nil {
		return domain.Room{}, err
	}
	if priceOverride != nil {
		price := domain.BasePrice(*priceOverride)
		room.PriceOverride = &price
	}
	return room, nil
}

// nullablePrice adapts a domain price pointer to an SQL *float64.
func nullablePrice(price *domain.BasePrice) *float64 {
	if price == nil {
		return nil
	}
	v := float64(*price)
	return &v
}

func (r *RoomRepository) FindAll(ctx context.Context) ([]domain.Room, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+roomColumns+" FROM rooms")
	if err != nil {
		return nil, fmt.Errorf("query rooms: %w", err)
	}
	defer rows.Close()

	var rooms []domain.Room
	for rows.Next() {
		room, err := scanRoom(rows)
		if err != nil {
			return nil, fmt.Errorf("scan room: %w", err)
		}
		rooms = append(rooms, room)
	}
	return rooms, rows.Err()
}

func (r *RoomRepository) FindByID(ctx context.Context, id domain.RoomID) (domain.Room, error) {
	room, err := scanRoom(r.conn.QueryRow(ctx, "SELECT "+roomColumns+" FROM rooms WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Room{}, domain.ErrRoomNotFound
		}
		return domain.Room{}, fmt.Errorf("query room by id: %w", err)
	}
	return room, nil
}

func (r *RoomRepository) FindByNumberAndBuilding(ctx context.Context, number string, buildingID domain.BuildingID) (domain.Room, error) {
	room, err := scanRoom(r.conn.QueryRow(ctx, "SELECT "+roomColumns+" FROM rooms WHERE number = $1 AND building_id = $2", number, buildingID))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Room{}, domain.ErrRoomNotFound
		}
		return domain.Room{}, fmt.Errorf("query room by number and building: %w", err)
	}
	return room, nil
}

// resolveBuildingHeadquarter returns the headquarter that owns the room's
// building. The rooms table carries a denormalized headquarters_id (legacy
// NOT NULL constraint), so it is derived here instead of being accepted from
// the client, keeping the API contract anchored on building_id.
func (r *RoomRepository) resolveBuildingHeadquarter(ctx context.Context, buildingID domain.BuildingID) (domain.HeadquarterID, error) {
	var headquarterID domain.HeadquarterID
	err := r.conn.QueryRow(ctx, "SELECT headquarters_id FROM buildings WHERE id = $1", buildingID).Scan(&headquarterID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", domain.ErrInvalidBuildingID
		}
		return "", fmt.Errorf("resolve building headquarter: %w", err)
	}
	return headquarterID, nil
}

// Save inserts the room and returns it with the database-assigned timestamps
// (single round trip via RETURNING).
func (r *RoomRepository) Save(ctx context.Context, room domain.Room) (domain.Room, error) {
	headquarterID, err := r.resolveBuildingHeadquarter(ctx, room.BuildingID)
	if err != nil {
		return domain.Room{}, err
	}

	saved := room
	err = r.conn.QueryRow(ctx,
		"INSERT INTO rooms (id, number, floor, room_types_id, building_id, headquarters_id, price_override, status, has_reception, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now()) RETURNING created_at, updated_at",
		room.ID, room.Number, room.Floor, room.RoomTypeID, room.BuildingID, headquarterID,
		nullablePrice(room.PriceOverride), room.Status, room.HasReception, room.CreatedBy,
	).Scan(&saved.CreatedAt, &saved.UpdatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.Room{}, domain.ErrRoomDuplicated
		}
		return domain.Room{}, fmt.Errorf("insert room: %w", err)
	}
	return saved, nil
}

// Update persists the room and returns it with the refreshed database
// timestamp (single round trip via RETURNING).
func (r *RoomRepository) Update(ctx context.Context, room domain.Room) (domain.Room, error) {
	headquarterID, err := r.resolveBuildingHeadquarter(ctx, room.BuildingID)
	if err != nil {
		return domain.Room{}, err
	}

	saved := room
	err = r.conn.QueryRow(ctx,
		"UPDATE rooms SET number = $2, floor = $3, room_types_id = $4, building_id = $5, headquarters_id = $6, price_override = $7, status = $8, has_reception = $9, updated_at = now() WHERE id = $1 RETURNING created_at, updated_at",
		room.ID, room.Number, room.Floor, room.RoomTypeID, room.BuildingID, headquarterID,
		nullablePrice(room.PriceOverride), room.Status, room.HasReception,
	).Scan(&saved.CreatedAt, &saved.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.Room{}, domain.ErrRoomNotFound
		}
		if isUniqueViolation(err) {
			return domain.Room{}, domain.ErrRoomDuplicated
		}
		return domain.Room{}, fmt.Errorf("update room: %w", err)
	}
	return saved, nil
}

func (r *RoomRepository) Delete(ctx context.Context, id domain.RoomID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM rooms WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete room: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoomNotFound
	}
	return nil
}
