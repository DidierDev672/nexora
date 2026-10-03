package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	externaldomain "nexora-api-rest/domain"
)

// ResourceRepository is the Postgres adapter of domain.ResourceRepository.
type ResourceRepository struct {
	conn *pgxpool.Pool
}

func NewResourceRepository(conn *pgxpool.Pool) *ResourceRepository {
	return &ResourceRepository{conn: conn}
}

var _ externaldomain.ResourceRepository = (*ResourceRepository)(nil)

func (r *ResourceRepository) Save(res *externaldomain.Resource) (int, error) {
	ctx := context.Background()
	if res.ID() <= 0 {
		var id int
		err := r.conn.QueryRow(ctx,
			"INSERT INTO resources (component, name, module_id) VALUES ($1, $2, $3) RETURNING id",
			res.Component().String(), res.Name().String(), res.ModuleID(),
		).Scan(&id)
		if err != nil {
			return 0, fmt.Errorf("insert resource: %w", err)
		}
		return id, nil
	}
	_, err := r.conn.Exec(ctx,
		`INSERT INTO resources (id, component, name, module_id) VALUES ($1, $2, $3, $4)
		 ON CONFLICT (id) DO UPDATE SET component = EXCLUDED.component, name = EXCLUDED.name, module_id = EXCLUDED.module_id`,
		res.ID(), res.Component().String(), res.Name().String(), res.ModuleID(),
	)
	if err != nil {
		return 0, fmt.Errorf("upsert resource: %w", err)
	}
	return res.ID(), nil
}

func (r *ResourceRepository) FindByID(id int) (*externaldomain.Resource, error) {
	var dbID, moduleID int
	var component, name string
	err := r.conn.QueryRow(context.Background(),
		"SELECT id, component, name, module_id FROM resources WHERE id = $1", id,
	).Scan(&dbID, &component, &name, &moduleID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("recurso con ID %d no encontrado", id)
		}
		return nil, fmt.Errorf("query resource by id: %w", err)
	}
	res, _ := externaldomain.NewResource(dbID, externaldomain.Component(component), externaldomain.ResourceName(name), moduleID)
	return res, nil
}

func (r *ResourceRepository) FindByModuleID(moduleID int) ([]*externaldomain.Resource, error) {
	rows, err := r.conn.Query(context.Background(),
		"SELECT id, component, name, module_id FROM resources WHERE module_id = $1 ORDER BY id", moduleID)
	if err != nil {
		return nil, fmt.Errorf("query resources by module: %w", err)
	}
	defer rows.Close()

	var resources []*externaldomain.Resource
	for rows.Next() {
		var dbID int
		var component, name string
		if err := rows.Scan(&dbID, &component, &name, &moduleID); err != nil {
			return nil, fmt.Errorf("scan resource: %w", err)
		}
		res, _ := externaldomain.NewResource(dbID, externaldomain.Component(component), externaldomain.ResourceName(name), moduleID)
		resources = append(resources, res)
	}
	return resources, rows.Err()
}

func (r *ResourceRepository) FindAll() ([]*externaldomain.Resource, error) {
	rows, err := r.conn.Query(context.Background(), "SELECT id, component, name, module_id FROM resources ORDER BY id")
	if err != nil {
		return nil, fmt.Errorf("query resources: %w", err)
	}
	defer rows.Close()

	var resources []*externaldomain.Resource
	for rows.Next() {
		var dbID, moduleID int
		var component, name string
		if err := rows.Scan(&dbID, &component, &name, &moduleID); err != nil {
			return nil, fmt.Errorf("scan resource: %w", err)
		}
		res, _ := externaldomain.NewResource(dbID, externaldomain.Component(component), externaldomain.ResourceName(name), moduleID)
		resources = append(resources, res)
	}
	return resources, rows.Err()
}

func (r *ResourceRepository) Delete(id int) error {
	tag, err := r.conn.Exec(context.Background(), "DELETE FROM resources WHERE id = $1", id)
	if err != nil {
		return fmt.Errorf("delete resource: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("recurso con ID %d no encontrado", id)
	}
	return nil
}
