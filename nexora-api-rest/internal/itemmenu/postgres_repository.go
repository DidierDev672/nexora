package itemmenu

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ItemMenuSchemaDDL define la estructura de la tabla item_menus en PostgreSQL.
// Incluye índices para búsquedas optimizadas por categoría y disponibilidad.
const ItemMenuSchemaDDL = `
CREATE TABLE IF NOT EXISTS item_menus (
    id             VARCHAR(36) PRIMARY KEY,
    category_id    VARCHAR(36) NOT NULL,
    name           VARCHAR(150) NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    price          NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    tax_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (tax_percentage >= 0),
    prep_time      INTEGER CHECK (prep_time IS NULL OR prep_time >= 0),
    is_vegetarian  BOOLEAN NOT NULL DEFAULT false,
    is_vegan       BOOLEAN NOT NULL DEFAULT false,
    image_url      TEXT NOT NULL DEFAULT '',
    start_time     VARCHAR(15) NOT NULL DEFAULT '',
    end_time       VARCHAR(15) NOT NULL DEFAULT '',
    available      BOOLEAN NOT NULL DEFAULT true,
    created_by     VARCHAR(100) NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_item_menus_category_id ON item_menus(category_id);
CREATE INDEX IF NOT EXISTS idx_item_menus_available ON item_menus(available);
`

// PostgresRepository es el adaptador de persistencia para PostgreSQL utilizando pgxpool (LSP).
type PostgresRepository struct {
	pool      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

// NewPostgresRepository instancia el repositorio de PostgreSQL.
func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

var _ Repository = (*PostgresRepository)(nil)

// EnsureTable crea automáticamente la tabla item_menus y sus índices en Postgres
// la primera vez que se invoca, garantizando concurrencia segura con sync.Once.
func (r *PostgresRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.pool.Exec(ctx, ItemMenuSchemaDDL)
	})
	return r.initError
}

const itemMenuColumns = `id, category_id, name, description, price, tax_percentage, prep_time, is_vegetarian, is_vegan, image_url, start_time, end_time, available, created_by, created_at, updated_at`

func scanItemMenu(row pgx.Row) (ItemMenu, error) {
	var item ItemMenu
	var idStr string
	var prepTime *int

	err := row.Scan(
		&idStr,
		&item.CategoryID,
		&item.Name,
		&item.Description,
		&item.Price,
		&item.TaxPercentage,
		&prepTime,
		&item.IsVegetarian,
		&item.IsVegan,
		&item.ImageURL,
		&item.StartTime,
		&item.EndTime,
		&item.Available,
		&item.CreatedBy,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ItemMenu{}, ErrNotFound
		}
		return ItemMenu{}, err
	}

	item.ID = ID(idStr)
	item.PrepTime = prepTime
	return item, nil
}

// Create inserta un nuevo ítem de menú.
// Al ejecutarse por primera vez (método POST), crea la tabla automáticamente si no existe.
func (r *PostgresRepository) Create(ctx context.Context, item ItemMenu) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table on post: %w", err)
	}

	query := fmt.Sprintf(`
	INSERT INTO item_menus (%s)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
	`, itemMenuColumns)

	_, err := r.pool.Exec(ctx, query,
		string(item.ID),
		item.CategoryID,
		item.Name,
		item.Description,
		item.Price,
		item.TaxPercentage,
		item.PrepTime,
		item.IsVegetarian,
		item.IsVegan,
		item.ImageURL,
		item.StartTime,
		item.EndTime,
		item.Available,
		item.CreatedBy,
		item.CreatedAt,
		item.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("postgres insert item_menu: %w", err)
	}
	return nil
}

// GetByID consulta un ítem de menú por su ID.
func (r *PostgresRepository) GetByID(ctx context.Context, id ID) (ItemMenu, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return ItemMenu{}, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
	SELECT %s
	FROM item_menus
	WHERE id = $1
	`, itemMenuColumns)

	row := r.pool.QueryRow(ctx, query, string(id))
	return scanItemMenu(row)
}

// List retorna los ítems aplicando filtros opcionales.
func (r *PostgresRepository) List(ctx context.Context, filter ListFilter) ([]ItemMenu, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
	SELECT %s
	FROM item_menus
	WHERE ($1 = '' OR category_id = $1)
	  AND ($2::boolean IS NULL OR available = $2)
	  AND ($3::boolean IS NULL OR is_vegetarian = $3)
	  AND ($4::boolean IS NULL OR is_vegan = $4)
	ORDER BY name ASC
	`, itemMenuColumns)

	rows, err := r.pool.Query(ctx, query, filter.CategoryID, filter.Available, filter.IsVegetarian, filter.IsVegan)
	if err != nil {
		return nil, fmt.Errorf("postgres query item_menus: %w", err)
	}
	defer rows.Close()

	items := make([]ItemMenu, 0)
	for rows.Next() {
		item, err := scanItemMenu(rows)
		if err != nil {
			return nil, fmt.Errorf("postgres scan item_menu: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("postgres iterate item_menus: %w", err)
	}
	return items, nil
}

// Update actualiza los campos permitidos de un ítem de menú.
func (r *PostgresRepository) Update(ctx context.Context, item ItemMenu) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	query := `
	UPDATE item_menus
	SET name = $2,
	    description = $3,
	    price = $4,
	    tax_percentage = $5,
	    prep_time = $6,
	    is_vegetarian = $7,
	    is_vegan = $8,
	    image_url = $9,
	    start_time = $10,
	    end_time = $11,
	    available = $12,
	    updated_at = $13
	WHERE id = $1
	`

	cmd, err := r.pool.Exec(ctx, query,
		string(item.ID),
		item.Name,
		item.Description,
		item.Price,
		item.TaxPercentage,
		item.PrepTime,
		item.IsVegetarian,
		item.IsVegan,
		item.ImageURL,
		item.StartTime,
		item.EndTime,
		item.Available,
		item.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("postgres update item_menu: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// Delete elimina un ítem de menú por su ID.
func (r *PostgresRepository) Delete(ctx context.Context, id ID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	query := `DELETE FROM item_menus WHERE id = $1`
	cmd, err := r.pool.Exec(ctx, query, string(id))
	if err != nil {
		return fmt.Errorf("postgres delete item_menu: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
