package menucategory

import (
	"context"
)

// ListFilter encapsula los criterios de filtrado para listar categorías de menú.
type ListFilter struct {
	HeadquarterID    string
	SubHeadquarterID *string
	BuildingID       *string
}

// Repository define el puerto de persistencia secundario para MenuCategory (DIP).
// Es agnóstico a cualquier base de datos o tecnología subyacente.
type Repository interface {
	// EnsureTable crea de forma idempotente la tabla en la base de datos si no existe.
	EnsureTable(ctx context.Context) error
	Create(ctx context.Context, category MenuCategory) error
	GetByID(ctx context.Context, id ID) (MenuCategory, error)
	List(ctx context.Context, filter ListFilter) ([]MenuCategory, error)
	Update(ctx context.Context, category MenuCategory) error
	Delete(ctx context.Context, id ID) error
}
