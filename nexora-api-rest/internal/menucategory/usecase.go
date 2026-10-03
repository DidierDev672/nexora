package menucategory

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

// CreateInput transporta los datos requeridos para registrar una categoría.
type CreateInput struct {
	HeadquarterID    string
	SubHeadquarterID *string
	BuildingID       *string
	Name             string
	Description      string
	Order            int
	Asset            string
	CreatedBy        string
}

// UpdateInput transporta los datos permitidos para modificar una categoría.
type UpdateInput struct {
	ID               ID
	SubHeadquarterID *string
	BuildingID       *string
	Name             string
	Description      string
	Order            int
	Asset            string
}

// UseCase implementa las operaciones del caso de uso para MenuCategory.
type UseCase struct {
	repo  Repository
	idGen IDGenerator
	clock Clock
}

// NewUseCase construye el orquestador de lógica de negocio inyectando sus puertos.
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

// Create valida las reglas de negocio, genera el ID y persiste la entidad.
// En el primer POST, el repositorio creará automáticamente la tabla en la base de datos.
func (uc *UseCase) Create(ctx context.Context, in CreateInput) (MenuCategory, error) {
	id := uc.idGen.NewID()
	now := uc.clock.Now()

	category, err := NewMenuCategory(
		id,
		in.HeadquarterID,
		in.SubHeadquarterID,
		in.BuildingID,
		in.Name,
		in.Description,
		in.Order,
		in.Asset,
		in.CreatedBy,
		now,
	)
	if err != nil {
		return MenuCategory{}, err
	}

	if err := uc.repo.Create(ctx, category); err != nil {
		return MenuCategory{}, fmt.Errorf("usecase create menu category: %w", err)
	}

	return category, nil
}

// GetByID obtiene una categoría específica verificando el identificador.
func (uc *UseCase) GetByID(ctx context.Context, id ID) (MenuCategory, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return MenuCategory{}, ErrInvalidID
	}
	return uc.repo.GetByID(ctx, trimmedID)
}

// List recupera las categorías aplicando los filtros suministrados.
func (uc *UseCase) List(ctx context.Context, filter ListFilter) ([]MenuCategory, error) {
	return uc.repo.List(ctx, filter)
}

// Update valida las reglas de negocio y actualiza una categoría existente.
func (uc *UseCase) Update(ctx context.Context, in UpdateInput) (MenuCategory, error) {
	trimmedID := ID(strings.TrimSpace(string(in.ID)))
	if trimmedID == "" {
		return MenuCategory{}, ErrInvalidID
	}

	existing, err := uc.repo.GetByID(ctx, trimmedID)
	if err != nil {
		return MenuCategory{}, err
	}

	now := uc.clock.Now()
	if err := existing.Update(
		in.Name,
		in.Description,
		in.Order,
		in.Asset,
		in.SubHeadquarterID,
		in.BuildingID,
		now,
	); err != nil {
		return MenuCategory{}, err
	}

	if err := uc.repo.Update(ctx, existing); err != nil {
		return MenuCategory{}, fmt.Errorf("usecase update menu category: %w", err)
	}

	return existing, nil
}

// Delete elimina una categoría tras verificar su existencia previa.
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
