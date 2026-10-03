package servicerequest

import (
	"errors"
	"net/http"
	"strings"
	"time"

	"nexora-api-rest/internal/api/httpjson"
)

// Handler expone las operaciones HTTP para el vertical slice service-request (Delivery layer).
type Handler struct {
	uc *UseCase
}

// NewHandler construye el handler HTTP inyectando el caso de uso (DIP).
func NewHandler(uc *UseCase) *Handler {
	return &Handler{uc: uc}
}

// Register asocia las rutas HTTP soportadas al multiplexor de Go stdlib.
func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("POST /service-request", h.Create)
	mux.HandleFunc("POST /service-requests", h.Create)

	mux.HandleFunc("GET /service-request", h.List)
	mux.HandleFunc("GET /service-requests", h.List)

	mux.HandleFunc("GET /service-request/{id}", h.Get)
	mux.HandleFunc("GET /service-requests/{id}", h.Get)

	mux.HandleFunc("PUT /service-request/{id}", h.Update)
	mux.HandleFunc("PUT /service-request", h.Update)
	mux.HandleFunc("PUT /service-requests/{id}", h.Update)
	mux.HandleFunc("PUT /service-requests", h.Update)

	mux.HandleFunc("DELETE /service-request/{id}", h.Delete)
	mux.HandleFunc("DELETE /service-request", h.Delete)
	mux.HandleFunc("DELETE /service-requests/{id}", h.Delete)
	mux.HandleFunc("DELETE /service-requests", h.Delete)
}

// CreateItemRequest representa la entrada para un ítem dentro de la solicitud.
type CreateItemRequest struct {
	ItemMenuID   string  `json:"item_menu_id"`
	NameSnapshot string  `json:"name_snapshot"`
	PriceUnit    float64 `json:"price_unit"`
	TaxRate      float64 `json:"tax_rate"`
	Amount       int     `json:"amount"`
	Note         string  `json:"note"`
}

// CreateRequest representa el payload recibido en POST /service-request.
type CreateRequest struct {
	OrderNumber          string              `json:"order_number"`
	StayID               string              `json:"stay_id"`
	RoomID               string              `json:"room_id"`
	PersonID             string              `json:"person_id"`
	Channel              string              `json:"channel"`
	PaymentMethod        string              `json:"payment_method"`
	GeneralNotes         string              `json:"general_notes"`
	DeliveryInstructions string              `json:"delivery_instructions"`
	ScheduledFor         *time.Time          `json:"scheduled_for"`
	Currency             string              `json:"currency"`
	Tip                  *float64            `json:"tip"`
	Items                []CreateItemRequest `json:"items"`
	CreatedBy            string              `json:"created_by"`
	CreatedByAlt         string              `json:"creadted_by"`
}

// UpdateRequest representa el payload recibido en PUT /service-request.
type UpdateRequest struct {
	ID                   string  `json:"id"`
	Status               *string `json:"status"`
	ActorType            string  `json:"actor_type"`
	ActorID              string  `json:"actor_id"`
	StatusComment        string  `json:"status_comment"`
	Grade                *int    `json:"grade"`
	GuestComment         *string `json:"guest_comment"`
	GeneralNotes         *string `json:"general_notes"`
	DeliveryInstructions *string `json:"delivery_instructions"`
}

// DeleteRequest representa el payload opcional en DELETE /service-request.
type DeleteRequest struct {
	ID string `json:"id"`
}

// ItemResponse es la proyección JSON de un ítem de orden.
type ItemResponse struct {
	ID           string    `json:"id"`
	OrderID      string    `json:"order_id"`
	ItemMenuID   string    `json:"item_menu_id"`
	NameSnapshot string    `json:"name_snapshot"`
	PriceUnit    float64   `json:"price_unit"`
	TaxRate      float64   `json:"tax_rate"`
	Amount       int       `json:"amount"`
	Note         string    `json:"note"`
	CreatedBy    string    `json:"created_by"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// HistoryResponse es la proyección JSON del historial de estados.
type HistoryResponse struct {
	ID            string    `json:"id"`
	OrderID       string    `json:"order_id"`
	PreviousState string    `json:"previous_state"`
	StatusNew     string    `json:"status_new"`
	ActorType     string    `json:"actor_type"`
	ActorID       string    `json:"actor_id"`
	Comment       string    `json:"comment"`
	CreatedBy     string    `json:"created_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// Response es la proyección JSON completa de una solicitud de servicio.
type Response struct {
	ID                    string            `json:"id"`
	OrderNumber           string            `json:"order_number"`
	StayID                string            `json:"stay_id"`
	RoomID                string            `json:"room_id"`
	PersonID              string            `json:"person_id"`
	Status                string            `json:"status"`
	Channel               string            `json:"channel"`
	PaymentMethod         string            `json:"payment_method"`
	GeneralNotes          string            `json:"general_notes"`
	DeliveryInstructions  string            `json:"delivery_instructions"`
	ScheduledFor          *time.Time        `json:"scheduled_for,omitempty"`
	Currency              string            `json:"currency"`
	Subtotal              float64           `json:"subtotal"`
	Taxes                 float64           `json:"taxes"`
	Tip                   *float64          `json:"tip,omitempty"`
	Total                 float64           `json:"total"`
	Grade                 *int              `json:"grade,omitempty"`
	GuestComment          *string           `json:"guest_comment,omitempty"`
	ReasonForCancellation string            `json:"reason_for_cancellation,omitempty"`
	CreatedBy             string            `json:"created_by"`
	ConfirmedAt           *time.Time        `json:"confirmed_at,omitempty"`
	DeliveredAt           *time.Time        `json:"delivered_at,omitempty"`
	CanceledAt            *time.Time        `json:"canceled_at,omitempty"`
	Items                 []ItemResponse    `json:"items"`
	History               []HistoryResponse `json:"history"`
	CreatedAt             time.Time         `json:"created_at"`
	UpdatedAt             time.Time         `json:"updated_at"`
}

func newResponse(s ServiceRequest) Response {
	items := make([]ItemResponse, len(s.Items))
	for i, it := range s.Items {
		items[i] = ItemResponse{
			ID:           string(it.ID),
			OrderID:      string(it.OrderID),
			ItemMenuID:   it.ItemMenuID,
			NameSnapshot: it.NameSnapshot,
			PriceUnit:    it.PriceUnit,
			TaxRate:      it.TaxRate,
			Amount:       it.Amount,
			Note:         it.Note,
			CreatedBy:    it.CreatedBy,
			CreatedAt:    it.CreatedAt,
			UpdatedAt:    it.UpdatedAt,
		}
	}

	hist := make([]HistoryResponse, len(s.History))
	for i, h := range s.History {
		hist[i] = HistoryResponse{
			ID:            string(h.ID),
			OrderID:       string(h.OrderID),
			PreviousState: string(h.PreviousState),
			StatusNew:     string(h.StatusNew),
			ActorType:     string(h.ActorType),
			ActorID:       h.ActorID,
			Comment:       h.Comment,
			CreatedBy:     h.CreatedBy,
			CreatedAt:     h.CreatedAt,
			UpdatedAt:     h.UpdatedAt,
		}
	}

	return Response{
		ID:                    string(s.ID),
		OrderNumber:           s.OrderNumber,
		StayID:                s.StayID,
		RoomID:                s.RoomID,
		PersonID:              s.PersonID,
		Status:                string(s.Status),
		Channel:               string(s.Channel),
		PaymentMethod:         string(s.PaymentMethod),
		GeneralNotes:          s.GeneralNotes,
		DeliveryInstructions:  s.DeliveryInstructions,
		ScheduledFor:          s.ScheduledFor,
		Currency:              s.Currency,
		Subtotal:              s.Subtotal,
		Taxes:                 s.Taxes,
		Tip:                   s.Tip,
		Total:                 s.Total,
		Grade:                 s.Grade,
		GuestComment:          s.GuestComment,
		ReasonForCancellation: s.ReasonForCancellation,
		CreatedBy:             s.CreatedBy,
		ConfirmedAt:           s.ConfirmedAt,
		DeliveredAt:           s.DeliveredAt,
		CanceledAt:            s.CanceledAt,
		Items:                 items,
		History:               hist,
		CreatedAt:             s.CreatedAt,
		UpdatedAt:             s.UpdatedAt,
	}
}

// Create maneja POST /service-request.
// Dispara la creación automática de las 3 tablas en Postgres si no existen.
func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	createdBy := req.CreatedBy
	if createdBy == "" {
		createdBy = req.CreatedByAlt
	}

	items := make([]CreateItemInput, len(req.Items))
	for i, it := range req.Items {
		items[i] = CreateItemInput{
			ItemMenuID:   it.ItemMenuID,
			NameSnapshot: it.NameSnapshot,
			PriceUnit:    it.PriceUnit,
			TaxRate:      it.TaxRate,
			Amount:       it.Amount,
			Note:         it.Note,
		}
	}

	channel := Channel(req.Channel)
	if channel == "" {
		channel = ChannelRoomTablet
	}

	paymentMethod := PaymentMethod(req.PaymentMethod)
	if paymentMethod == "" {
		paymentMethod = PaymentMethodRoomCharge
	}

	created, err := h.uc.Create(r.Context(), CreateInput{
		OrderNumber:          req.OrderNumber,
		StayID:               req.StayID,
		RoomID:               req.RoomID,
		PersonID:             req.PersonID,
		Channel:              channel,
		PaymentMethod:        paymentMethod,
		GeneralNotes:         req.GeneralNotes,
		DeliveryInstructions: req.DeliveryInstructions,
		ScheduledFor:         req.ScheduledFor,
		Currency:             req.Currency,
		Tip:                  req.Tip,
		Items:                items,
		CreatedBy:            createdBy,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusCreated, newResponse(created))
}

// Get maneja GET /service-request/{id}.
func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id := ID(strings.TrimSpace(r.PathValue("id")))
	if id == "" {
		id = ID(strings.TrimSpace(r.URL.Query().Get("id")))
	}

	item, err := h.uc.GetByID(r.Context(), id)
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newResponse(item))
}

// List maneja GET /service-request con filtros.
func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()

	items, err := h.uc.List(r.Context(), ListFilter{
		StayID:   query.Get("stay_id"),
		RoomID:   query.Get("room_id"),
		PersonID: query.Get("person_id"),
		Status:   query.Get("status"),
		Channel:  query.Get("channel"),
	})
	if err != nil {
		httpjson.WriteInternalError(w, err)
		return
	}

	responses := make([]Response, len(items))
	for i, item := range items {
		responses[i] = newResponse(item)
	}

	httpjson.WriteJSON(w, http.StatusOK, responses)
}

// Update maneja PUT /service-request/{id} o PUT /service-request.
func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	var req UpdateRequest
	if err := httpjson.DecodeJSON(r, &req); err != nil {
		httpjson.WriteError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	idStr := strings.TrimSpace(r.PathValue("id"))
	if idStr == "" {
		idStr = strings.TrimSpace(req.ID)
	}
	if idStr == "" {
		idStr = strings.TrimSpace(r.URL.Query().Get("id"))
	}

	var st *Status
	if req.Status != nil && *req.Status != "" {
		s := Status(*req.Status)
		st = &s
	}

	actorType := ActorType(req.ActorType)
	if actorType == "" {
		actorType = ActorTypeStaff
	}

	updated, err := h.uc.Update(r.Context(), UpdateInput{
		ID:                   ID(idStr),
		Status:               st,
		ActorType:            actorType,
		ActorID:              req.ActorID,
		StatusComment:        req.StatusComment,
		Grade:                req.Grade,
		GuestComment:         req.GuestComment,
		GeneralNotes:         req.GeneralNotes,
		DeliveryInstructions: req.DeliveryInstructions,
	})
	if err != nil {
		h.handleDomainError(w, err)
		return
	}

	httpjson.WriteJSON(w, http.StatusOK, newResponse(updated))
}

// Delete maneja DELETE /service-request/{id} o DELETE /service-request.
func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimSpace(r.PathValue("id"))
	if idStr == "" {
		idStr = strings.TrimSpace(r.URL.Query().Get("id"))
	}
	if idStr == "" && r.Body != nil {
		var req DeleteRequest
		_ = httpjson.DecodeJSON(r, &req)
		idStr = strings.TrimSpace(req.ID)
	}

	if err := h.uc.Delete(r.Context(), ID(idStr)); err != nil {
		h.handleDomainError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) handleDomainError(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, ErrNotFound):
		httpjson.WriteError(w, http.StatusNotFound, err.Error())
	case errors.Is(err, ErrInvalidID),
		errors.Is(err, ErrInvalidStayID),
		errors.Is(err, ErrInvalidRoomID),
		errors.Is(err, ErrInvalidPersonID),
		errors.Is(err, ErrInvalidOrderNumber),
		errors.Is(err, ErrEmptyItems),
		errors.Is(err, ErrInvalidItemAmount),
		errors.Is(err, ErrInvalidPriceUnit),
		errors.Is(err, ErrInvalidGrade),
		errors.Is(err, ErrInvalidStatus),
		errors.Is(err, ErrAlreadyCanceled),
		errors.Is(err, ErrAlreadyDelivered):
		httpjson.WriteError(w, http.StatusUnprocessableEntity, err.Error())
	default:
		httpjson.WriteInternalError(w, err)
	}
}
