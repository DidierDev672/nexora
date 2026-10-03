package servicerequest

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
	NewOrderItemID() OrderItemID
	NewHistoryID() HistoryID
}

// CryptoIDGenerator es la implementación de generación de IDs usando crypto/rand.
type CryptoIDGenerator struct{}

func (CryptoIDGenerator) randomHex(bytesLen int) string {
	b := make([]byte, bytesLen)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return hex.EncodeToString(b)
}

func (c CryptoIDGenerator) NewID() ID {
	return ID(c.randomHex(8))
}

func (c CryptoIDGenerator) NewOrderItemID() OrderItemID {
	return OrderItemID(c.randomHex(8))
}

func (c CryptoIDGenerator) NewHistoryID() HistoryID {
	return HistoryID(c.randomHex(8))
}

// Clock define el puerto para la obtención de fecha y hora (ISP + DIP).
type Clock interface {
	Now() time.Time
}

// SystemClock implementa Clock utilizando el reloj del sistema en UTC.
type SystemClock struct{}

func (SystemClock) Now() time.Time {
	return time.Now().UTC()
}

// CreateItemInput representa los datos para registrar un ítem dentro de la orden.
type CreateItemInput struct {
	ItemMenuID   string
	NameSnapshot string
	PriceUnit    float64
	TaxRate      float64
	Amount       int
	Note         string
}

// CreateInput transporta los datos requeridos para registrar una orden de servicio.
type CreateInput struct {
	OrderNumber          string
	StayID               string
	RoomID               string
	PersonID             string
	Channel              Channel
	PaymentMethod        PaymentMethod
	GeneralNotes         string
	DeliveryInstructions string
	ScheduledFor         *time.Time
	Currency             string
	Tip                  *float64
	Items                []CreateItemInput
	CreatedBy            string
}

// UpdateInput transporta las modificaciones aplicables a una orden existente.
type UpdateInput struct {
	ID                   ID
	Status               *Status
	ActorType            ActorType
	ActorID              string
	StatusComment        string
	Grade                *int
	GuestComment         *string
	GeneralNotes         *string
	DeliveryInstructions *string
}

// UseCase implementa las operaciones del caso de uso para ServiceRequest (SRP).
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

// Create valida las invariantes de negocio, calcula subtotales/impuestos y persiste el pedido.
// En su primera invocación, el repositorio creará automáticamente las tablas en PostgreSQL.
func (uc *UseCase) Create(ctx context.Context, in CreateInput) (ServiceRequest, error) {
	id := uc.idGen.NewID()
	now := uc.clock.Now()

	orderNum := strings.TrimSpace(in.OrderNumber)
	if orderNum == "" {
		orderNum = fmt.Sprintf("SR-%d-%s", now.Unix(), uc.idGen.NewID()[:4])
	}

	items := make([]OrderItem, len(in.Items))
	for i, it := range in.Items {
		items[i] = OrderItem{
			ID:           uc.idGen.NewOrderItemID(),
			OrderID:      id,
			ItemMenuID:   it.ItemMenuID,
			NameSnapshot: it.NameSnapshot,
			PriceUnit:    it.PriceUnit,
			TaxRate:      it.TaxRate,
			Amount:       it.Amount,
			Note:         it.Note,
			CreatedBy:    in.CreatedBy,
			CreatedAt:    now,
			UpdatedAt:    now,
		}
	}

	req, err := NewServiceRequest(
		id,
		orderNum,
		in.StayID,
		in.RoomID,
		in.PersonID,
		in.Channel,
		in.PaymentMethod,
		in.GeneralNotes,
		in.DeliveryInstructions,
		in.ScheduledFor,
		in.Currency,
		in.Tip,
		items,
		in.CreatedBy,
		now,
	)
	if err != nil {
		return ServiceRequest{}, err
	}

	if len(req.History) > 0 {
		req.History[0].ID = uc.idGen.NewHistoryID()
	}

	if err := uc.repo.Create(ctx, req); err != nil {
		return ServiceRequest{}, fmt.Errorf("usecase create service request: %w", err)
	}

	return req, nil
}

// GetByID consulta una solicitud de servicio por su ID.
func (uc *UseCase) GetByID(ctx context.Context, id ID) (ServiceRequest, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ServiceRequest{}, ErrInvalidID
	}
	return uc.repo.GetByID(ctx, trimmedID)
}

// List recupera las órdenes de servicio aplicando los filtros especificados.
func (uc *UseCase) List(ctx context.Context, filter ListFilter) ([]ServiceRequest, error) {
	return uc.repo.List(ctx, filter)
}

// Update aplica actualizaciones de estado o calificaciones a una orden existente.
func (uc *UseCase) Update(ctx context.Context, in UpdateInput) (ServiceRequest, error) {
	trimmedID := ID(strings.TrimSpace(string(in.ID)))
	if trimmedID == "" {
		return ServiceRequest{}, ErrInvalidID
	}

	existing, err := uc.repo.GetByID(ctx, trimmedID)
	if err != nil {
		return ServiceRequest{}, err
	}

	now := uc.clock.Now()

	if in.GeneralNotes != nil {
		existing.GeneralNotes = strings.TrimSpace(*in.GeneralNotes)
		existing.UpdatedAt = now
	}
	if in.DeliveryInstructions != nil {
		existing.DeliveryInstructions = strings.TrimSpace(*in.DeliveryInstructions)
		existing.UpdatedAt = now
	}

	if in.Status != nil && *in.Status != existing.Status {
		actorType := in.ActorType
		if actorType == "" {
			actorType = ActorTypeStaff
		}
		actorID := in.ActorID
		if actorID == "" {
			actorID = "system"
		}
		if err := existing.TransitionStatus(*in.Status, actorType, actorID, in.StatusComment, now); err != nil {
			return ServiceRequest{}, err
		}
		// Asignar ID al nuevo registro de historial
		if len(existing.History) > 0 {
			lastIdx := len(existing.History) - 1
			if existing.History[lastIdx].ID == "" {
				existing.History[lastIdx].ID = uc.idGen.NewHistoryID()
			}
		}
	}

	if in.Grade != nil {
		if err := existing.Rate(*in.Grade, in.GuestComment, now); err != nil {
			return ServiceRequest{}, err
		}
	}

	if err := uc.repo.Update(ctx, existing); err != nil {
		return ServiceRequest{}, fmt.Errorf("usecase update service request: %w", err)
	}

	return existing, nil
}

// Delete elimina una solicitud de servicio por su ID.
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
