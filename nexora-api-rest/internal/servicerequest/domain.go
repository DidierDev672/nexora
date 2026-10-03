package servicerequest

import (
	"errors"
	"strings"
	"time"
)

// ID identifica de forma unívoca a una orden de servicio.
type ID string

func (id ID) String() string {
	return string(id)
}

// OrderItemID identifica de forma unívoca a un ítem dentro de la orden.
type OrderItemID string

func (id OrderItemID) String() string {
	return string(id)
}

// HistoryID identifica a un registro en el historial de estados de la orden.
type HistoryID string

func (id HistoryID) String() string {
	return string(id)
}

// Status representa el estado de ciclo de vida de la orden de servicio.
type Status string

const (
	StatusPending       Status = "pending"
	StatusConfirmed     Status = "confirmed"
	StatusInPreparation Status = "in_preparation"
	StatusDelivering    Status = "delivering"
	StatusDelivered     Status = "delivered"
	StatusCanceled      Status = "canceled"
)

var validStatusSet = map[Status]struct{}{
	StatusPending:       {},
	StatusConfirmed:     {},
	StatusInPreparation: {},
	StatusDelivering:    {},
	StatusDelivered:     {},
	StatusCanceled:      {},
}

// Channel representa el canal por el cual se originó el pedido.
type Channel string

const (
	ChannelRoomTablet Channel = "room_tablet"
	ChannelMobileApp  Channel = "mobile_app"
	ChannelPhone      Channel = "phone"
	ChannelFrontDesk  Channel = "front_desk"
	ChannelQRCode     Channel = "qr_code"
)

// PaymentMethod representa el medio de pago acordado para el servicio.
type PaymentMethod string

const (
	PaymentMethodRoomCharge   PaymentMethod = "room_charge"
	PaymentMethodCash         PaymentMethod = "cash"
	PaymentMethodCard         PaymentMethod = "card"
	PaymentMethodBankTransfer PaymentMethod = "bank_transfer"
)

// ActorType identifica quién realizó una transición de estado en el historial.
type ActorType string

const (
	ActorTypeGuest  ActorType = "guest"
	ActorTypeStaff  ActorType = "staff"
	ActorTypeSystem ActorType = "system"
	ActorTypeAdmin  ActorType = "admin"
)

// Sentinel errors del dominio.
var (
	ErrNotFound           = errors.New("service request not found")
	ErrInvalidID          = errors.New("id is required")
	ErrInvalidStayID      = errors.New("stay_id is required")
	ErrInvalidRoomID      = errors.New("room_id is required")
	ErrInvalidPersonID    = errors.New("person_id is required")
	ErrInvalidOrderNumber = errors.New("order_number is required")
	ErrEmptyItems         = errors.New("service request must contain at least one item")
	ErrInvalidItemAmount  = errors.New("item amount must be greater than zero")
	ErrInvalidPriceUnit   = errors.New("price_unit cannot be negative")
	ErrInvalidGrade       = errors.New("grade must be between 1 and 5")
	ErrInvalidStatus      = errors.New("invalid status value")
	ErrAlreadyCanceled    = errors.New("service request is already canceled")
	ErrAlreadyDelivered   = errors.New("service request is already delivered")
)

// OrderItem representa una línea de detalle dentro de la orden.
type OrderItem struct {
	ID           OrderItemID
	OrderID      ID
	ItemMenuID   string
	NameSnapshot string
	PriceUnit    float64
	TaxRate      float64
	Amount       int
	Note         string
	CreatedBy    string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// OrderStatusHistory representa un registro inmutable en la bitácora de estados.
type OrderStatusHistory struct {
	ID            HistoryID
	OrderID       ID
	PreviousState Status
	StatusNew     Status
	ActorType     ActorType
	ActorID       string
	Comment       string
	CreatedBy     string
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// ServiceRequest es el agregado raíz para solicitudes de servicio a la habitación / pedidos.
type ServiceRequest struct {
	ID                    ID
	OrderNumber           string
	StayID                string
	RoomID                string
	PersonID              string
	Status                Status
	Channel               Channel
	PaymentMethod         PaymentMethod
	GeneralNotes          string
	DeliveryInstructions  string
	ScheduledFor          *time.Time
	Currency              string
	Subtotal              float64
	Taxes                 float64
	Tip                   *float64
	Total                 float64
	Grade                 *int
	GuestComment          *string
	ReasonForCancellation string
	CreatedBy             string
	ConfirmedAt           *time.Time
	DeliveredAt           *time.Time
	CanceledAt            *time.Time
	Items                 []OrderItem
	History               []OrderStatusHistory
	CreatedAt             time.Time
	UpdatedAt             time.Time
}

// NewServiceRequest es el constructor que asegura la validez de invariantes del agregado.
func NewServiceRequest(
	id ID,
	orderNumber string,
	stayID string,
	roomID string,
	personID string,
	channel Channel,
	paymentMethod PaymentMethod,
	generalNotes string,
	deliveryInstructions string,
	scheduledFor *time.Time,
	currency string,
	tip *float64,
	items []OrderItem,
	createdBy string,
	now time.Time,
) (ServiceRequest, error) {
	trimmedID := ID(strings.TrimSpace(string(id)))
	if trimmedID == "" {
		return ServiceRequest{}, ErrInvalidID
	}

	trimmedOrderNum := strings.TrimSpace(orderNumber)
	if trimmedOrderNum == "" {
		return ServiceRequest{}, ErrInvalidOrderNumber
	}

	trimmedStayID := strings.TrimSpace(stayID)
	if trimmedStayID == "" {
		return ServiceRequest{}, ErrInvalidStayID
	}

	trimmedRoomID := strings.TrimSpace(roomID)
	if trimmedRoomID == "" {
		return ServiceRequest{}, ErrInvalidRoomID
	}

	trimmedPersonID := strings.TrimSpace(personID)
	if trimmedPersonID == "" {
		return ServiceRequest{}, ErrInvalidPersonID
	}

	if len(items) == 0 {
		return ServiceRequest{}, ErrEmptyItems
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	if currency == "" {
		currency = "USD"
	}

	// Cálculo y validación de ítems
	var subtotal float64
	var taxes float64
	validatedItems := make([]OrderItem, len(items))

	for i, it := range items {
		if it.Amount <= 0 {
			return ServiceRequest{}, ErrInvalidItemAmount
		}
		if it.PriceUnit < 0 {
			return ServiceRequest{}, ErrInvalidPriceUnit
		}

		itemSubtotal := it.PriceUnit * float64(it.Amount)
		itemTax := itemSubtotal * (it.TaxRate / 100.0)

		subtotal += itemSubtotal
		taxes += itemTax

		it.OrderID = trimmedID
		if it.CreatedAt.IsZero() {
			it.CreatedAt = now
		}
		if it.UpdatedAt.IsZero() {
			it.UpdatedAt = now
		}
		validatedItems[i] = it
	}

	var tipVal float64
	if tip != nil {
		if *tip < 0 {
			return ServiceRequest{}, errors.New("tip cannot be negative")
		}
		tipVal = *tip
	}
	total := subtotal + taxes + tipVal

	// Registro inicial en el historial
	initialHistory := []OrderStatusHistory{
		{
			OrderID:       trimmedID,
			PreviousState: "",
			StatusNew:     StatusPending,
			ActorType:     ActorTypeGuest,
			ActorID:       trimmedPersonID,
			Comment:       "Order created",
			CreatedBy:     strings.TrimSpace(createdBy),
			CreatedAt:     now,
			UpdatedAt:     now,
		},
	}

	return ServiceRequest{
		ID:                   trimmedID,
		OrderNumber:          trimmedOrderNum,
		StayID:               trimmedStayID,
		RoomID:               trimmedRoomID,
		PersonID:             trimmedPersonID,
		Status:               StatusPending,
		Channel:              channel,
		PaymentMethod:        paymentMethod,
		GeneralNotes:         strings.TrimSpace(generalNotes),
		DeliveryInstructions: strings.TrimSpace(deliveryInstructions),
		ScheduledFor:         scheduledFor,
		Currency:             strings.ToUpper(strings.TrimSpace(currency)),
		Subtotal:             subtotal,
		Taxes:                taxes,
		Tip:                  tip,
		Total:                total,
		CreatedBy:            strings.TrimSpace(createdBy),
		Items:                validatedItems,
		History:              initialHistory,
		CreatedAt:            now,
		UpdatedAt:            now,
	}, nil
}

// TransitionStatus efectúa un cambio de estado agregando la entrada al historial.
func (s *ServiceRequest) TransitionStatus(
	newStatus Status,
	actorType ActorType,
	actorID string,
	comment string,
	now time.Time,
) error {
	if _, ok := validStatusSet[newStatus]; !ok {
		return ErrInvalidStatus
	}

	if s.Status == StatusCanceled {
		return ErrAlreadyCanceled
	}

	if s.Status == StatusDelivered && newStatus != StatusDelivered {
		return ErrAlreadyDelivered
	}

	if now.IsZero() {
		now = time.Now().UTC()
	}

	prevState := s.Status
	s.Status = newStatus
	s.UpdatedAt = now

	switch newStatus {
	case StatusConfirmed:
		s.ConfirmedAt = &now
	case StatusDelivered:
		s.DeliveredAt = &now
	case StatusCanceled:
		s.CanceledAt = &now
		if comment != "" {
			s.ReasonForCancellation = comment
		}
	}

	s.History = append(s.History, OrderStatusHistory{
		OrderID:       s.ID,
		PreviousState: prevState,
		StatusNew:     newStatus,
		ActorType:     actorType,
		ActorID:       actorID,
		Comment:       comment,
		CreatedBy:     actorID,
		CreatedAt:     now,
		UpdatedAt:     now,
	})

	return nil
}

// Rate califica el servicio recibido.
func (s *ServiceRequest) Rate(grade int, comment *string, now time.Time) error {
	if grade < 1 || grade > 5 {
		return ErrInvalidGrade
	}
	s.Grade = &grade
	s.GuestComment = comment
	if now.IsZero() {
		now = time.Now().UTC()
	}
	s.UpdatedAt = now
	return nil
}
