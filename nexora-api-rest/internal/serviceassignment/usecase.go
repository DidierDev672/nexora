package serviceassignment

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// IDGenerator define el puerto para generar identificadores de dominio (ISP + DIP).
type IDGenerator interface {
	NewID() ID
}

// CryptoIDGenerator es la implementación por defecto de generación de IDs usando crypto/rand.
type CryptoIDGenerator struct{}

func (CryptoIDGenerator) NewID() ID {
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return ID(hex.EncodeToString(b))
}

// Clock define el puerto para la obtención del tiempo (ISP + DIP).
type Clock interface {
	Now() time.Time
}

// SystemClock es la implementación de Clock usando el reloj del sistema en UTC.
type SystemClock struct{}

func (SystemClock) Now() time.Time {
	return time.Now().UTC()
}

// CreateInput transporta los datos requeridos para registrar una asignación.
type CreateInput struct {
	ServiceRequestID string
	StayID           string
	PersonID         string
	IsActive         bool
}

// UpdateInput transporta los datos para modificar una asignación existente.
type UpdateInput struct {
	ID               ID
	ServiceRequestID string
	StayID           string
	PersonID         string
	IsActive         bool
}

// UseCase implementa las operaciones de orquestación de negocio para ServiceAssignment.
type UseCase struct {
	repo  Repository
	idGen IDGenerator
	clock Clock
}

// NewUseCase construye el orquestador inyectando sus dependencias.
func NewUseCase(repo Repository, idGen IDGenerator, clock Clock) *UseCase {
	if idGen == nil {
		idGen = CryptoIDGenerator{}
	}
	if clock == nil {
		clock = SystemClock{}
	}
	return &UseCase{
		repo:  repo,
		idGen: idGen,
		clock: clock,
	}
}

// Create valida las reglas de negocio, genera el identificador y persiste la asignación.
func (uc *UseCase) Create(ctx context.Context, in CreateInput) (ServiceAssignment, error) {
	id := uc.idGen.NewID()
	now := uc.clock.Now()

	assignment, err := NewServiceAssignment(
		id,
		in.ServiceRequestID,
		in.StayID,
		in.PersonID,
		in.IsActive,
		now,
	)
	if err != nil {
		return ServiceAssignment{}, err
	}

	if err := uc.repo.Create(ctx, assignment); err != nil {
		return ServiceAssignment{}, fmt.Errorf("usecase create service assignment: %w", err)
	}

	return assignment, nil
}

// GetByID consulta una asignación por su ID.
func (uc *UseCase) GetByID(ctx context.Context, id ID) (ServiceAssignment, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ServiceAssignment{}, ErrInvalidID
	}
	return uc.repo.GetByID(ctx, trimmedID)
}

// List retorna todas las asignaciones existentes.
func (uc *UseCase) List(ctx context.Context) ([]ServiceAssignment, error) {
	return uc.repo.List(ctx)
}

// Update actualiza los campos permitidos de una asignación.
func (uc *UseCase) Update(ctx context.Context, in UpdateInput) (ServiceAssignment, error) {
	existing, err := uc.GetByID(ctx, in.ID)
	if err != nil {
		return ServiceAssignment{}, err
	}

	now := uc.clock.Now()
	updated, err := NewServiceAssignment(
		existing.ID,
		in.ServiceRequestID,
		in.StayID,
		in.PersonID,
		in.IsActive,
		now,
	)
	if err != nil {
		return ServiceAssignment{}, err
	}
	updated.CreatedAt = existing.CreatedAt

	if err := uc.repo.Update(ctx, updated); err != nil {
		return ServiceAssignment{}, fmt.Errorf("usecase update service assignment: %w", err)
	}

	return updated, nil
}

// Delete elimina una asignación verificando su existencia previa.
func (uc *UseCase) Delete(ctx context.Context, id ID) error {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ErrInvalidID
	}
	if _, err := uc.repo.GetByID(ctx, trimmedID); err != nil {
		return err
	}
	return uc.repo.Delete(ctx, trimmedID)
}
