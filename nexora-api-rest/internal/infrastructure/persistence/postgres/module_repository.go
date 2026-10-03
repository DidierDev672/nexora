package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	externaldomain "nexora-api-rest/domain"
)

// ModuleRepository is the Postgres adapter of domain.ModuleRepository.
type ModuleRepository struct {
	conn *pgxpool.Pool
}

func NewModuleRepository(conn *pgxpool.Pool) *ModuleRepository {
	return &ModuleRepository{conn: conn}
}

var _ externaldomain.ModuleRepository = (*ModuleRepository)(nil)

func (r *ModuleRepository) Save(m *externaldomain.Module) (int, error) {
	ctx := context.Background()
	if m.ID() <= 0 {
		var id int
		err := r.conn.QueryRow(ctx,
			"INSERT INTO modules (type_path, type_component) VALUES ($1, $2) RETURNING id",
			m.TypePath().String(), m.TypeComponent().String(),
		).Scan(&id)
		if err != nil {
			return 0, fmt.Errorf("insert module: %w", err)
		}
		return id, nil
	}
	_, err := r.conn.Exec(ctx,
		`INSERT INTO modules (id, type_path, type_component) VALUES ($1, $2, $3)
		 ON CONFLICT (id) DO UPDATE SET type_path = EXCLUDED.type_path, type_component = EXCLUDED.type_component`,
		m.ID(), m.TypePath().String(), m.TypeComponent().String(),
	)
	if err != nil {
		return 0, fmt.Errorf("upsert module: %w", err)
	}
	return m.ID(), nil
}

func (r *ModuleRepository) FindByID(id int) (*externaldomain.Module, error) {
	var dbID int
	var typePath, typeComponent string
	err := r.conn.QueryRow(context.Background(),
		"SELECT id, type_path, type_component FROM modules WHERE id = $1", id,
	).Scan(&dbID, &typePath, &typeComponent)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("módulo con ID %d no encontrado", id)
		}
		return nil, fmt.Errorf("query module by id: %w", err)
	}
	mod, _ := externaldomain.NewModule(dbID, externaldomain.TypePath(typePath), externaldomain.TypeComponent(typeComponent))
	return mod, nil
}

func (r *ModuleRepository) FindAll() ([]*externaldomain.Module, error) {
	rows, err := r.conn.Query(context.Background(), "SELECT id, type_path, type_component FROM modules ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("query modules: %w", err)
	}
	defer rows.Close()

	var modules []*externaldomain.Module
	for rows.Next() {
		var dbID int
		var typePath, typeComponent string
		if err := rows.Scan(&dbID, &typePath, &typeComponent); err != nil {
			return nil, fmt.Errorf("scan module: %w", err)
		}
		mod, _ := externaldomain.NewModule(dbID, externaldomain.TypePath(typePath), externaldomain.TypeComponent(typeComponent))
		modules = append(modules, mod)
	}
	return modules, rows.Err()
}

func (r *ModuleRepository) Delete(id int) error {
	tag, err := r.conn.Exec(context.Background(), "DELETE FROM modules WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete module: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("módulo con ID %d no encontrado", id)
	}
	return nil
}
