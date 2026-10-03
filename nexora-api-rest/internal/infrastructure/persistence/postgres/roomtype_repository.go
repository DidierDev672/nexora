package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

// RoomTypeRepository is the Postgres adapter of domain.RoomTypeRepository.
type RoomTypeRepository struct {
	conn *pgxpool.Pool
}

func NewRoomTypeRepository(conn *pgxpool.Pool) *RoomTypeRepository {
	return &RoomTypeRepository{conn: conn}
}

var _ domain.RoomTypeRepository = (*RoomTypeRepository)(nil)

const roomTypeColumns = "id, name, capacity, base_price, created_by, created_at, updated_at"

func scanRoomType(row pgx.Row) (domain.RoomType, error) {
	var rt domain.RoomType
	err := row.Scan(
		&rt.ID, &rt.Name, &rt.Capacity, &rt.BasePrice,
		&rt.CreatedBy, &rt.CreatedAt, &rt.UpdatedAt,
	)
	return rt, err
}

func (r *RoomTypeRepository) FindAll(ctx context.Context) ([]domain.RoomType, error) {
	rows, err := r.conn.Query(ctx, "SELECT "+roomTypeColumns+" FROM room_types")
	if err != nil {
		return nil, fmt.Errorf("query room types: %w", err)
	}
	defer rows.Close()

	var roomTypes []domain.RoomType
	for rows.Next() {
		rt, err := scanRoomType(rows)
		if err != nil {
			return nil, fmt.Errorf("scan room type: %w", err)
		}
		roomTypes = append(roomTypes, rt)
	}
	return roomTypes, rows.Err()
}

func (r *RoomTypeRepository) FindByID(ctx context.Context, id domain.RoomTypeID) (domain.RoomType, error) {
	rt, err := scanRoomType(r.conn.QueryRow(ctx, "SELECT "+roomTypeColumns+" FROM room_types WHERE id = $1", id))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.RoomType{}, domain.ErrRoomTypeNotFound
		}
		return domain.RoomType{}, fmt.Errorf("query room type by id: %w", err)
	}
	return rt, nil
}

func (r *RoomTypeRepository) FindByName(ctx context.Context, name string) (domain.RoomType, error) {
	rt, err := scanRoomType(r.conn.QueryRow(ctx, "SELECT "+roomTypeColumns+" FROM room_types WHERE name = $1", name))
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domain.RoomType{}, domain.ErrRoomTypeNotFound
		}
		return domain.RoomType{}, fmt.Errorf("query room type by name: %w", err)
	}
	return rt, nil
}

func (r *RoomTypeRepository) Save(ctx context.Context, rt domain.RoomType) error {
	_, err := r.conn.Exec(ctx,
		"INSERT INTO room_types (id, name, capacity, base_price, created_by, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, now(), now())",
		rt.ID, rt.Name, rt.Capacity, rt.BasePrice, rt.CreatedBy,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrRoomTypeDuplicated
		}
		return fmt.Errorf("insert room type: %w", err)
	}
	return nil
}

func (r *RoomTypeRepository) Update(ctx context.Context, rt domain.RoomType) error {
	tag, err := r.conn.Exec(ctx,
		"UPDATE room_types SET name = $2, capacity = $3, base_price = $4, updated_at = now() WHERE id = $1",
		rt.ID, rt.Name, rt.Capacity, rt.BasePrice,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return domain.ErrRoomTypeDuplicated
		}
		return fmt.Errorf("update room type: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoomTypeNotFound
	}
	return nil
}

func (r *RoomTypeRepository) Delete(ctx context.Context, id domain.RoomTypeID) error {
	tag, err := r.conn.Exec(ctx, "DELETE FROM room_types WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete room type: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrRoomTypeNotFound
	}
	return nil
}
