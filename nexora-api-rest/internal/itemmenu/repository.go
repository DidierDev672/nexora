package itemmenu

import (
	"context"
)

// ListFilter encapsula los criterios de filtrado para listar ítems de menú.
type ListFilter struct {
	CategoryID   string
	Available    *bool
	IsVegetarian *bool
	IsVegan      *bool
}

// Repository define el puerto secundario de persistencia para ItemMenu (DIP).
// Es agnóstico a cualquier base de datos o tecnología subyacente.
type Repository interface {
	// EnsureTable crea de forma idempotente la tabla en la base de datos si no existe.
	EnsureTable(ctx context.Context) error
	Create(ctx context.Context, item ItemMenu) error
	GetByID(ctx context.Context, id ID) (ItemMenu, error)
	List(ctx context.Context, filter ListFilter) ([]ItemMenu, error)
	Update(ctx context.Context, item ItemMenu) error
	Delete(ctx context.Context, id ID) error
}
