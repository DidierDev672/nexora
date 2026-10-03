package servicerequest

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ServiceRequestSchemaDDL define las tablas e índices para solicitudes de servicio, ítems e historial.
const ServiceRequestSchemaDDL = `
CREATE TABLE IF NOT EXISTS service_requests (
    id                      VARCHAR(36) PRIMARY KEY,
    order_number            VARCHAR(50) NOT NULL UNIQUE,
    stay_id                 VARCHAR(36) NOT NULL,
    room_id                 VARCHAR(36) NOT NULL,
    person_id               VARCHAR(36) NOT NULL,
    status                  VARCHAR(30) NOT NULL DEFAULT 'pending',
    channel                 VARCHAR(30) NOT NULL DEFAULT 'room_tablet',
    payment_method          VARCHAR(30) NOT NULL DEFAULT 'room_charge',
    general_notes           TEXT NOT NULL DEFAULT '',
    delivery_instructions   TEXT NOT NULL DEFAULT '',
    scheduled_for           TIMESTAMPTZ,
    currency                VARCHAR(5) NOT NULL DEFAULT 'USD',
    subtotal                NUMERIC(12,2) NOT NULL DEFAULT 0.0 CHECK (subtotal >= 0),
    taxes                   NUMERIC(12,2) NOT NULL DEFAULT 0.0 CHECK (taxes >= 0),
    tip                     NUMERIC(12,2) CHECK (tip IS NULL OR tip >= 0),
    total                   NUMERIC(12,2) NOT NULL DEFAULT 0.0 CHECK (total >= 0),
    grade                   INTEGER CHECK (grade IS NULL OR (grade >= 1 AND grade <= 5)),
    guest_comment           TEXT,
    reason_for_cancellation TEXT NOT NULL DEFAULT '',
    created_by              VARCHAR(100) NOT NULL DEFAULT '',
    confirmed_at            TIMESTAMPTZ,
    delivered_at            TIMESTAMPTZ,
    canceled_at             TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_requests_stay_id ON service_requests(stay_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_room_id ON service_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

CREATE TABLE IF NOT EXISTS service_request_items (
    id            VARCHAR(36) PRIMARY KEY,
    order_id      VARCHAR(36) NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    item_menu_id  VARCHAR(36) NOT NULL,
    name_snapshot VARCHAR(150) NOT NULL,
    price_unit    NUMERIC(12,2) NOT NULL CHECK (price_unit >= 0),
    tax_rate      NUMERIC(5,2) NOT NULL DEFAULT 0.0 CHECK (tax_rate >= 0),
    amount        INTEGER NOT NULL CHECK (amount > 0),
    note          TEXT NOT NULL DEFAULT '',
    created_by    VARCHAR(100) NOT NULL DEFAULT '',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_request_items_order_id ON service_request_items(order_id);

CREATE TABLE IF NOT EXISTS service_request_status_histories (
    id             VARCHAR(36) PRIMARY KEY,
    order_id       VARCHAR(36) NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    previous_state VARCHAR(30) NOT NULL DEFAULT '',
    status_new     VARCHAR(30) NOT NULL,
    actor_type     VARCHAR(30) NOT NULL DEFAULT 'guest',
    actor_id       VARCHAR(36) NOT NULL DEFAULT '',
    comment        TEXT NOT NULL DEFAULT '',
    created_by     VARCHAR(100) NOT NULL DEFAULT '',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_service_request_history_order_id ON service_request_status_histories(order_id);
`

// PostgresRepository es el adaptador de persistencia para PostgreSQL usando pgxpool (LSP).
type PostgresRepository struct {
	pool      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

// NewPostgresRepository instancia el repositorio de PostgreSQL.
func NewPostgresRepository(pool *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{pool: pool}
}

var _ Repository = (*PostgresRepository)(nil)

// EnsureTable crea automáticamente las tablas e índices en Postgres
// la primera vez que se invoca (método POST), garantizando concurrencia segura con sync.Once.
func (r *PostgresRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.pool.Exec(ctx, ServiceRequestSchemaDDL)
	})
	return r.initError
}

const serviceRequestColumns = `
	id, order_number, stay_id, room_id, person_id, status, channel, payment_method,
	general_notes, delivery_instructions, scheduled_for, currency, subtotal, taxes, tip, total,
	grade, guest_comment, reason_for_cancellation, created_by, confirmed_at, delivered_at,
	canceled_at, created_at, updated_at
`

// Create inserta la orden con sus ítems e historial en una sola transacción atómica.
// En su primera ejecución en el servidor, dispara la creación automática de las tablas.
func (r *PostgresRepository) Create(ctx context.Context, req ServiceRequest) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table on post: %w", err)
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx create service request: %w", err)
	}
	defer tx.Rollback(ctx)

	insertHeader := fmt.Sprintf(`
		INSERT INTO service_requests (%s)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
	`, serviceRequestColumns)

	_, err = tx.Exec(ctx, insertHeader,
		string(req.ID),
		req.OrderNumber,
		req.StayID,
		req.RoomID,
		req.PersonID,
		string(req.Status),
		string(req.Channel),
		string(req.PaymentMethod),
		req.GeneralNotes,
		req.DeliveryInstructions,
		req.ScheduledFor,
		req.Currency,
		req.Subtotal,
		req.Taxes,
		req.Tip,
		req.Total,
		req.Grade,
		req.GuestComment,
		req.ReasonForCancellation,
		req.CreatedBy,
		req.ConfirmedAt,
		req.DeliveredAt,
		req.CanceledAt,
		req.CreatedAt,
		req.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert service_request: %w", err)
	}

	// Insertar ítems
	insertItem := `
		INSERT INTO service_request_items (
			id, order_id, item_menu_id, name_snapshot, price_unit, tax_rate, amount, note, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	for _, it := range req.Items {
		_, err := tx.Exec(ctx, insertItem,
			string(it.ID),
			string(req.ID),
			it.ItemMenuID,
			it.NameSnapshot,
			it.PriceUnit,
			it.TaxRate,
			it.Amount,
			it.Note,
			it.CreatedBy,
			it.CreatedAt,
			it.UpdatedAt,
		)
		if err != nil {
			return fmt.Errorf("insert service_request_item: %w", err)
		}
	}

	// Insertar historial
	insertHistory := `
		INSERT INTO service_request_status_histories (
			id, order_id, previous_state, status_new, actor_type, actor_id, comment, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	for _, h := range req.History {
		_, err := tx.Exec(ctx, insertHistory,
			string(h.ID),
			string(req.ID),
			string(h.PreviousState),
			string(h.StatusNew),
			string(h.ActorType),
			h.ActorID,
			h.Comment,
			h.CreatedBy,
			h.CreatedAt,
			h.UpdatedAt,
		)
		if err != nil {
			return fmt.Errorf("insert service_request_history: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit tx create service request: %w", err)
	}

	return nil
}

// GetByID consulta la orden con todos sus ítems e historial de estados.
func (r *PostgresRepository) GetByID(ctx context.Context, id ID) (ServiceRequest, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return ServiceRequest{}, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`SELECT %s FROM service_requests WHERE id = $1`, serviceRequestColumns)
	row := r.pool.QueryRow(ctx, query, string(id))

	req, err := scanServiceRequestHeader(row)
	if err != nil {
		return ServiceRequest{}, err
	}

	items, err := r.loadItems(ctx, req.ID)
	if err != nil {
		return ServiceRequest{}, err
	}
	req.Items = items

	history, err := r.loadHistory(ctx, req.ID)
	if err != nil {
		return ServiceRequest{}, err
	}
	req.History = history

	return req, nil
}

// List retorna las órdenes de servicio filtradas y con sus relaciones cargadas.
func (r *PostgresRepository) List(ctx context.Context, filter ListFilter) ([]ServiceRequest, error) {
	if err := r.EnsureTable(ctx); err != nil {
		return nil, fmt.Errorf("ensure table: %w", err)
	}

	query := fmt.Sprintf(`
		SELECT %s
		FROM service_requests
		WHERE ($1 = '' OR stay_id = $1)
		  AND ($2 = '' OR room_id = $2)
		  AND ($3 = '' OR person_id = $3)
		  AND ($4 = '' OR status = $4)
		  AND ($5 = '' OR channel = $5)
		ORDER BY created_at DESC
	`, serviceRequestColumns)

	rows, err := r.pool.Query(ctx, query, filter.StayID, filter.RoomID, filter.PersonID, filter.Status, filter.Channel)
	if err != nil {
		return nil, fmt.Errorf("query service_requests: %w", err)
	}
	defer rows.Close()

	list := make([]ServiceRequest, 0)
	for rows.Next() {
		item, err := scanServiceRequestHeader(rows)
		if err != nil {
			return nil, fmt.Errorf("scan service_request: %w", err)
		}
		list = append(list, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate service_requests: %w", err)
	}

	// Cargar ítems e historial para cada orden listada
	for i := range list {
		items, err := r.loadItems(ctx, list[i].ID)
		if err != nil {
			return nil, err
		}
		list[i].Items = items

		hist, err := r.loadHistory(ctx, list[i].ID)
		if err != nil {
			return nil, err
		}
		list[i].History = hist
	}

	return list, nil
}

// Update actualiza la cabecera e inserta nuevos registros de historial o ítems si aplica.
func (r *PostgresRepository) Update(ctx context.Context, req ServiceRequest) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx update service request: %w", err)
	}
	defer tx.Rollback(ctx)

	updateQuery := `
		UPDATE service_requests
		SET status = $2,
		    general_notes = $3,
		    delivery_instructions = $4,
		    grade = $5,
		    guest_comment = $6,
		    reason_for_cancellation = $7,
		    confirmed_at = $8,
		    delivered_at = $9,
		    canceled_at = $10,
		    updated_at = $11
		WHERE id = $1
	`
	cmd, err := tx.Exec(ctx, updateQuery,
		string(req.ID),
		string(req.Status),
		req.GeneralNotes,
		req.DeliveryInstructions,
		req.Grade,
		req.GuestComment,
		req.ReasonForCancellation,
		req.ConfirmedAt,
		req.DeliveredAt,
		req.CanceledAt,
		req.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("update service_request: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}

	// Guardar entradas de historial pendientes
	insertHistory := `
		INSERT INTO service_request_status_histories (
			id, order_id, previous_state, status_new, actor_type, actor_id, comment, created_by, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (id) DO NOTHING
	`
	for _, h := range req.History {
		_, err := tx.Exec(ctx, insertHistory,
			string(h.ID),
			string(req.ID),
			string(h.PreviousState),
			string(h.StatusNew),
			string(h.ActorType),
			h.ActorID,
			h.Comment,
			h.CreatedBy,
			h.CreatedAt,
			h.UpdatedAt,
		)
		if err != nil {
			return fmt.Errorf("upsert service_request_history: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// Delete elimina una solicitud de servicio (los ítems e historial se eliminan en cascada).
func (r *PostgresRepository) Delete(ctx context.Context, id ID) error {
	if err := r.EnsureTable(ctx); err != nil {
		return fmt.Errorf("ensure table: %w", err)
	}

	cmd, err := r.pool.Exec(ctx, "DELETE FROM service_requests WHERE id = $1", string(id))
	if err != nil {
		return fmt.Errorf("delete service_request: %w", err)
	}
	if cmd.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func scanServiceRequestHeader(row pgx.Row) (ServiceRequest, error) {
	var s ServiceRequest
	var idStr, statusStr, channelStr, paymentStr string

	err := row.Scan(
		&idStr,
		&s.OrderNumber,
		&s.StayID,
		&s.RoomID,
		&s.PersonID,
		&statusStr,
		&channelStr,
		&paymentStr,
		&s.GeneralNotes,
		&s.DeliveryInstructions,
		&s.ScheduledFor,
		&s.Currency,
		&s.Subtotal,
		&s.Taxes,
		&s.Tip,
		&s.Total,
		&s.Grade,
		&s.GuestComment,
		&s.ReasonForCancellation,
		&s.CreatedBy,
		&s.ConfirmedAt,
		&s.DeliveredAt,
		&s.CanceledAt,
		&s.CreatedAt,
		&s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ServiceRequest{}, ErrNotFound
		}
		return ServiceRequest{}, err
	}

	s.ID = ID(idStr)
	s.Status = Status(statusStr)
	s.Channel = Channel(channelStr)
	s.PaymentMethod = PaymentMethod(paymentStr)
	return s, nil
}

func (r *PostgresRepository) loadItems(ctx context.Context, orderID ID) ([]OrderItem, error) {
	query := `
		SELECT id, order_id, item_menu_id, name_snapshot, price_unit, tax_rate, amount, note, created_by, created_at, updated_at
		FROM service_request_items
		WHERE order_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, query, string(orderID))
	if err != nil {
		return nil, fmt.Errorf("load items: %w", err)
	}
	defer rows.Close()

	items := make([]OrderItem, 0)
	for rows.Next() {
		var it OrderItem
		var itID, oID string
		err := rows.Scan(
			&itID,
			&oID,
			&it.ItemMenuID,
			&it.NameSnapshot,
			&it.PriceUnit,
			&it.TaxRate,
			&it.Amount,
			&it.Note,
			&it.CreatedBy,
			&it.CreatedAt,
			&it.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan item: %w", err)
		}
		it.ID = OrderItemID(itID)
		it.OrderID = ID(oID)
		items = append(items, it)
	}
	return items, nil
}

func (r *PostgresRepository) loadHistory(ctx context.Context, orderID ID) ([]OrderStatusHistory, error) {
	query := `
		SELECT id, order_id, previous_state, status_new, actor_type, actor_id, comment, created_by, created_at, updated_at
		FROM service_request_status_histories
		WHERE order_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.pool.Query(ctx, query, string(orderID))
	if err != nil {
		return nil, fmt.Errorf("load history: %w", err)
	}
	defer rows.Close()

	hist := make([]OrderStatusHistory, 0)
	for rows.Next() {
		var h OrderStatusHistory
		var hID, oID, prevStr, newStr, actorStr string
		err := rows.Scan(
			&hID,
			&oID,
			&prevStr,
			&newStr,
			&actorStr,
			&h.ActorID,
			&h.Comment,
			&h.CreatedBy,
			&h.CreatedAt,
			&h.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("scan history: %w", err)
		}
		h.ID = HistoryID(hID)
		h.OrderID = ID(oID)
		h.PreviousState = Status(prevStr)
		h.StatusNew = Status(newStr)
		h.ActorType = ActorType(actorStr)
		hist = append(hist, h)
	}
	return hist, nil
}
