package menucategory

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// MenuCategorySchemaDDL define la estructura de la tabla menu_categories en PostgreSQL.
// Incluye índices para optimizar consultas por sede y orden del menú.
const MenuCategorySchemaDDL = `
CREATE TABLE IF NOT EXISTS menu_categories (
    id                  VARCHAR(36) PRIMARY KEY,
    headquarters_id     VARCHAR(36) NOT NULL,
    sub_headquarters_id VARCHAR(36),
    building_id         VARCHAR(36),
    name                VARCHAR(150) NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    "order"             INTEGER NOT NULL DEFAULT 0 CHECK ("order" >= 0),
    asset               TEXT NOT NULL DEFAULT '',
    created_by          VARCHAR(100) NOT NULL DEFAULT '',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_categories_hq ON menu_categories(headquarters_id);
CREATE INDEX IF NOT EXISTS idx_menu_categories_order ON menu_categories("order");
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

// EnsureTable crea automáticamente la tabla menu_categories y sus índices en Postgres
// la primera vez que se invoca, garantizando concurrencia segura con sync.Once.
func (r *PostgresRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.pool.Exec(ctx, MenuCategorySchemaDDL)
	})
	return r.initError
}

const menuCategoryColumns = `id, headquarters_id, sub_headquarters_id, building_id, name, description, "order", asset, created_by, created_at, updated_at`

func scanMenuCategory(row pgx.Row) (MenuCategory, error) {
	var c MenuCategory
	var idStr string
	var subHQ, bld *string

	err := row.Scan(
		&idStr,
		&c.HeadquarterID,
		&subHQ,
		&bld,
		&c.Name,
		&c.Description,
		&c.Order,
		&c.Asset,
		&c.CreatedBy,
		&c.CreatedAt,
		&c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return MenuCategory{}, ErrNotFound
		}
		return MenuCategory{}, err
	}

	c.ID = ID(idStr)
	c.SubHeadquarterID = subHQ
	c.BuildingID = bld
	return c, nil
}

// Create inserta una nueva categoría.
// Al ejecutarse por primera vez (método POST), crea la tabla automáticamente si no existe.
func (r *PostgresRepository) Create(ctx context.Context, category MenuCategory) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table on post: %w", err)
	}

	query := fmt.Sprintf(`
	INSERT INTO menu_categories (%s)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, menuCategoryColumns)

	_, err := r.pool.Exec(ctx, query,
		string(category.ID),
		category.HeadquarterID,
		category.SubHeadquarterID,
		category.BuildingID,
		category.Name,
		category.Description,
		category.Order,
		category.Asset,
		category.CreatedBy,
		category.CreatedAt,
		category.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("postgres insert menu_category: %w", err)
	}
	return nil
}

// GetByID consulta una categoría por su identificador único.
func (r *PostgresRepository) GetByID(ctx context.Context, id ID) (MenuCategory, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return MenuCategory{}, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
	SELECT %s
	FROM menu_categories
	WHERE id = $1
	`, menuCategoryColumns)

	row := r.pool.QueryRow(ctx, query, string(id))
	return scanMenuCategory(row)
}

// List retorna las categorías aplicando filtros opcionales por sede, subsede o edificio.
func (r *PostgresRepository) List(ctx context.Context, filter ListFilter) ([]MenuCategory, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
	SELECT %s
	FROM menu_categories
	WHERE ($1 = '' OR headquarters_id = $1)
	  AND ($2::text IS NULL OR sub_headquarters_id = $2)
	  AND ($3::text IS NULL OR building_id = $3)
	ORDER BY "order" ASC, name ASC
	`, menuCategoryColumns)

	rows, err := r.pool.Query(ctx, query, filter.HeadquarterID, filter.SubHeadquarterID, filter.BuildingID)
	if err != nil {
		return nil, fmt.Errorf("postgres query menu_categories: %w", err)
	}
	defer rows.Close()

	items := make([]MenuCategory, 0)
	for rows.Next() {
		item, err := scanMenuCategory(rows)
		if err != nil {
			return nil, fmt.Errorf("postgres scan menu_category: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("postgres iterate menu_categories: %w", err)
	}
	return items, nil
}

// Update actualiza los campos permitidos de una categoría.
func (r *PostgresRepository) Update(ctx context.Context, category MenuCategory) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	query := `
	UPDATE menu_categories
	SET sub_headquarters_id = $2,
	    building_id = $3,
	    name = $4,
	    description = $5,
	    "order" = $6,
	    asset = $7,
	    updated_at = $8
	WHERE id = $1
	`

	cmd, err := r.pool.Exec(ctx, query,
		string(category.ID),
		category.SubHeadquarterID,
		category.BuildingID,
		category.Name,
		category.Description,
		category.Order,
		category.Asset,
		category.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("postgres update menu_category: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

// Delete elimina una categoría por su ID.
func (r *PostgresRepository) Delete(ctx context.Context, id ID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	query := `DELETE FROM menu_categories WHERE id = $1`
	cmd, err := r.pool.Exec(ctx, query, string(id))
	if err != nil {
		return fmt.Errorf("postgres delete menu_category: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}
