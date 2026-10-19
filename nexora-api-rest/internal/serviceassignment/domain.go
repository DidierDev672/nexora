package serviceassignment

import (
	"errors"
	"strings"
	"time"
)

// ID identifica de forma unívoca a una asignación de solicitud de servicio.
type ID string

func (id ID) String() string {
	return string(id)
}

// Sentinel errors para violaciones de invariantes de negocio del dominio.
var (
	ErrNotFound                = errors.New("service assignment not found")
	ErrInvalidID               = errors.New("id is required")
	ErrInvalidServiceRequestID = errors.New("service_request_id is required")
	ErrInvalidStayID           = errors.New("stay_id is required")
	ErrInvalidPersonID         = errors.New("person_id is required")
)

// ServiceAssignment representa la entidad central del dominio para asignaciones de solicitudes.
type ServiceAssignment struct {
	ID               ID        `json:"id"`
	ServiceRequestID string    `json:"service_request_id"`
	StayID           string    `json:"stay_id"`
	PersonID         string    `json:"person_id"`
	IsActive         bool      `json:"is_active"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// NewServiceAssignment construye y asegura la validez de invariantes del agregado.
func NewServiceAssignment(
	id ID,
	serviceRequestID string,
	stayID string,
	personID string,
	isActive bool,
	now time.Time,
) (ServiceAssignment, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ServiceAssignment{}, ErrInvalidID
	}

	trimmedSR := strings.TrimSpace(serviceRequestID)
	if trimmedSR == "" {
		return ServiceAssignment{}, ErrInvalidServiceRequestID
	}

	trimmedStay := strings.TrimSpace(stayID)
	if trimmedStay == "" {
		return ServiceAssignment{}, ErrInvalidStayID
	}

	trimmedPerson := strings.TrimSpace(personID)
	if trimmedPerson == "" {
		return ServiceAssignment{}, ErrInvalidPersonID
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	return ServiceAssignment{
		ID:               trimmedID,
		ServiceRequestID: trimmedSR,
		StayID:           trimmedStay,
		PersonID:         trimmedPerson,
		IsActive:         isActive,
		CreatedAt:        now,
		UpdatedAt:        now,
	}, nil
}
