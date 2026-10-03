package itemmenu

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

// CreateInput transporta los datos requeridos para registrar un ítem de menú.
type CreateInput struct {
	CategoryID    string
	Name          string
	Description   string
	Price         float64
	TaxPercentage float64
	PrepTime      *int
	IsVegetarian  bool
	IsVegan       bool
	ImageURL      string
	StartTime     string
	EndTime       string
	Available     bool
	CreatedBy     string
}

// UpdateInput transporta los datos permitidos para modificar un ítem de menú.
type UpdateInput struct {
	ID            ID
	Name          string
	Description   string
	Price         float64
	TaxPercentage float64
	PrepTime      *int
	IsVegetarian  bool
	IsVegan       bool
	ImageURL      string
	StartTime     string
	EndTime       string
	Available     bool
}

// UseCase orquesta la lógica y reglas de negocio para ItemMenu (SRP).
type UseCase struct {
	repo  Repository
	idGen IDGenerator
	clock Clock
}

// NewUseCase construye el orquestador de casos de uso inyectando sus puertos.
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

// Create valida las invariantes de negocio, asigna el ID y persiste el nuevo ítem.
// En el primer POST, el repositorio creará automáticamente la tabla en la base de datos.
func (uc *UseCase) Create(ctx context.Context, in CreateInput) (ItemMenu, error) {
	id := uc.idGen.NewID()
	now := uc.clock.Now()

	item, err := NewItemMenu(
		id,
		in.CategoryID,
		in.Name,
		in.Description,
		in.Price,
		in.TaxPercentage,
		in.PrepTime,
		in.IsVegetarian,
		in.IsVegan,
		in.ImageURL,
		in.StartTime,
		in.EndTime,
		in.Available,
		in.CreatedBy,
		now,
	)
	if err != nil {
		return ItemMenu{}, err
	}

	if err := uc.repo.Create(ctx, item); err != nil {
		return ItemMenu{}, fmt.Errorf("usecase create item menu: %w", err)
	}

	return item, nil
}

// GetByID consulta un ítem de menú por su ID.
func (uc *UseCase) GetByID(ctx context.Context, id ID) (ItemMenu, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ItemMenu{}, ErrInvalidID
	}
	return uc.repo.GetByID(ctx, trimmedID)
}

// List recupera los ítems de menú aplicando los filtros suministrados.
func (uc *UseCase) List(ctx context.Context, filter ListFilter) ([]ItemMenu, error) {
	return uc.repo.List(ctx, filter)
}

// Update valida las reglas de negocio y actualiza un ítem existente.
func (uc *UseCase) Update(ctx context.Context, in UpdateInput) (ItemMenu, error) {
	trimmedID := ID(strings.TrimSpace(string(in.ID)))
	if trimmedID == "" {
		return ItemMenu{}, ErrInvalidID
	}

	existing, err := uc.repo.GetByID(ctx, trimmedID)
	if err != nil {
		return ItemMenu{}, err
	}

	now := uc.clock.Now()
	if err := existing.Update(
		in.Name,
		in.Description,
		in.Price,
		in.TaxPercentage,
		in.PrepTime,
		in.IsVegetarian,
		in.IsVegan,
		in.ImageURL,
		in.StartTime,
		in.EndTime,
		in.Available,
		now,
	); err != nil {
		return ItemMenu{}, err
	}

	if err := uc.repo.Update(ctx, existing); err != nil {
		return ItemMenu{}, fmt.Errorf("usecase update item menu: %w", err)
	}

	return existing, nil
}

// Delete elimina un ítem de menú tras verificar su existencia previa.
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
