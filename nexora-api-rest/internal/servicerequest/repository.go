package servicerequest

import (
	"context"
)

// ListFilter define los criterios de búsqueda para listar órdenes de servicio.
type ListFilter struct {
	StayID   string
	RoomID   string
	PersonID string
	Status   string
	Channel  string
}

// Repository define el puerto secundario de persistencia para ServiceRequest (DIP).
// Es agnóstico a cualquier base de datos o tecnología de almacenamiento.
type Repository interface {
	// EnsureTable crea de forma idempotente las tablas necesarias en la base de datos.
	EnsureTable(ctx context.Context) error
	Create(ctx context.Context, req ServiceRequest) error
	GetByID(ctx context.Context, id ID) (ServiceRequest, error)
	List(ctx context.Context, filter ListFilter) ([]ServiceRequest, error)
	Update(ctx context.Context, req ServiceRequest) error
	Delete(ctx context.Context, id ID) error
}
