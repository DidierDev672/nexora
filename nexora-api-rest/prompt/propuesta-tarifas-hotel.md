# Propuesta Técnica y Arquitectura de Dominio: Gestión de Tarifas Hoteleras (`Rate`)

Este documento presenta la propuesta integral para el diseño, modelo de negocio, persistencia en PostgreSQL y exposición de la API REST del módulo de **Tarifas (`Rate`)** para el sistema hotelero **Nexora API REST**.

La solución está diseñada bajo los paradigmas de **Vertical Slicing**, **Onion Architecture (Hexagonal)**, **Principios SOLID** y la **Heurística de la Precaución** (garantía de integridad en datos financieros), incorporando aprovisionamiento automático e idempotente de la tabla en PostgreSQL (`EnsureTable`) en la primera ejecución del método `POST`.

---

## 1. Visión y Escalabilidad del Modelo de Negocio

El modelo de tarifas hoteleras debe ser capaz de adaptarse a diversos tipos de establecimientos y modalidades de cobro: hoteles urbanos, resorts vacacionales, alojamientos ejecutivos, hoteles por horas (moteles/estancias cortas) y apartahoteles de larga estancia.

```
                            ┌─────────────────────────────────────────┐
                            │           SEDE (Headquarter)            │
                            └────────────────────┬────────────────────┘
                                                 │ 1
                                                 │
                                                 ▼ 0..*
                            ┌─────────────────────────────────────────┐
                            │       SUB SEDE (SubHeadquarter)         │
                            └────────────────────┬────────────────────┘
                                                 │ 1
                                                 │
                                                 ▼ 0..*
                            ┌─────────────────────────────────────────┐
                            │       TIPO HABITACIÓN (RoomType)        │
                            └────────────────────┬────────────────────┘
                                                 │ 1
                                                 │
                                                 ▼ 0..*
                            ┌─────────────────────────────────────────┐
                            │            TARIFA (Rate)                │
                            │  - Modalidad (mañana, tarde, noche,     │
                            │    días, semanal, horas)                │
                            │  - Duración (duration_units)            │
                            │  - Ventana Horaria (start/end_time)     │
                            │  - Días de aplicación (days_of_week)    │
                            │  - Precio base monetario (> 0.00)       │
                            └─────────────────────────────────────────┘
```

### 1.1. Principios de Escalabilidad Incorporados

1. **Jerarquía Flexible (Sede vs. Sub Sede)**:
   - Toda tarifa se vincula obligatoriamente a una **Sede** (`headquarter_id`).
   - El campo **Sub Sede** (`subheadquarter_id`) es opcional (`nullable`).
   - **Regla de Herencia**: Si una tarifa tiene `subheadquarter_id = NULL`, aplica como tarifa general para toda la sede. Si se define una sub sede, tiene precedencia específica sobre esa ubicación.

2. **Desacoplamiento del Tipo de Habitación**:
   - `room_type_id` es opcional (`nullable`). Permite definir tarifas globales para todas las habitaciones de una sede/sub sede, o tarifas especializadas para tipos concretos (Suite, Matrimonial, Doble, etc.).

3. **Multi-Modalidad / Multi-Frecuencia Temporal**:
   - Soporte nativo para los requerimientos del usuario:
     - `morning` (Mañana / Turno matutino)
     - `afternoon` (Tarde / Turno vespertino)
     - `night` (Noche / Turno nocturno)
     - `daily` (Día / Diaria estándar)
     - `weekly` (Semanal / Larga estancia)
     - `hourly` (Por horas / Fraccionado)
   - Extensible en el futuro a `monthly` o `custom` sin romper el esquema.

4. **Parametrización Temporal y Reglas Dinámicas**:
   - `duration_units`: Especifica el factor multiplicador. Por ejemplo, en modalidad `hourly`, `duration_units: 3` define una tarifa por bloque de 3 horas. En modalidad `daily`, `duration_units: 1` es por 1 noche.
   - `start_time` y `end_time` (Opcionales): Permiten automatizar el cálculo tarifario según la hora de ingreso del huésped (ej: Mañana = 07:00 a 13:00, Tarde = 13:00 a 19:00, Noche = 19:00 a 07:00).
   - `days_of_week`: Permite aplicar tarifas diferenciadas para fines de semana (`weekend`), entre semana (`weekdays`) o todos los días (`all`).

---

## 2. Definición del Dominio y Modelo de Datos

### 2.1. Atributos de la Entidad `Rate`

| Atributo | Tipo Go | Tipo PostgreSQL | Nulo | Restricciones / Reglas de Negocio |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `RateID` (string) | `VARCHAR(36)` | No | Clave primaria UUID v4. |
| `name` | `string` | `VARCHAR(150)` | No | Nombre legible (ej: "Tarifa Noche Fin de Semana"). |
| `headquarter_id` | `HeadquarterID` (string) | `VARCHAR(36)` | No | Referencia obligatoria a la Sede. |
| `subheadquarter_id` | `*SubHeadquarterID` (string) | `VARCHAR(36)` | Sí | Referencia opcional a la Sub Sede. |
| `room_type_id` | `*RoomTypeID` (string) | `VARCHAR(36)` | Sí | Referencia opcional al tipo de habitación. |
| `modality` | `RateModality` (string) | `VARCHAR(30)` | No | `morning`, `afternoon`, `night`, `daily`, `weekly`, `hourly`. |
| `price` | `BasePrice` (float64) | `NUMERIC(12,2)` | No | Monto monetario. Invariante: $price > 0.00$. |
| `duration_units` | `int` | `INTEGER` | No | Unidades de duración ($\ge 1$). Por defecto `1`. |
| `start_time` | `*string` | `TIME` | Sí | Hora de inicio del turno (formato `HH:MM:SS`). |
| `end_time` | `*string` | `TIME` | Sí | Hora de fin del turno (formato `HH:MM:SS`). |
| `days_of_week` | `string` | `VARCHAR(50)` | No | Días de vigencia: `'all'`, `'weekdays'`, `'weekend'`, o `'1,2,3,4,5,6,7'`. |
| `status` | `RateStatus` (string) | `VARCHAR(30)` | No | `'active'`, `'inactive'`. |
| `created_by` | `string` | `VARCHAR(100)` | No | Identificador del operador/usuario creador. |
| `created_at` | `time.Time` | `TIMESTAMPTZ` | No | Marca de tiempo UTC al registrar. |
| `updated_at` | `time.Time` | `TIMESTAMPTZ` | No | Marca de tiempo UTC al actualizar. |

---

## 3. Esquema en PostgreSQL y Auto-Construcción en POST

### 3.1. DDL de la Tabla (`rates`)

```sql
CREATE TABLE IF NOT EXISTS rates (
    id                 VARCHAR(36) PRIMARY KEY,
    name               VARCHAR(150) NOT NULL,
    headquarter_id     VARCHAR(36) NOT NULL,
    subheadquarter_id  VARCHAR(36),
    room_type_id       VARCHAR(36),
    modality           VARCHAR(30) NOT NULL,
    price              NUMERIC(12, 2) NOT NULL,
    duration_units     INTEGER NOT NULL DEFAULT 1,
    start_time         TIME,
    end_time           TIME,
    days_of_week       VARCHAR(50) NOT NULL DEFAULT 'all',
    status             VARCHAR(30) NOT NULL DEFAULT 'active',
    created_by         VARCHAR(100) NOT NULL DEFAULT '',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (modality IN ('morning', 'afternoon', 'night', 'daily', 'weekly', 'hourly')),
    CHECK (status IN ('active', 'inactive')),
    CHECK (price > 0),
    CHECK (duration_units >= 1)
);

-- Índices optimizados para búsquedas frecuentes y cálculo en tiempo de reserva/estancia
CREATE INDEX IF NOT EXISTS idx_rates_headquarter_id ON rates(headquarter_id);
CREATE INDEX IF NOT EXISTS idx_rates_subheadquarter_id ON rates(subheadquarter_id);
CREATE INDEX IF NOT EXISTS idx_rates_room_type_id ON rates(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rates_modality ON rates(modality);
CREATE INDEX IF NOT EXISTS idx_rates_status ON rates(status);
CREATE INDEX IF NOT EXISTS idx_rates_query_lookup ON rates(headquarter_id, subheadquarter_id, room_type_id, modality, status);
```

### 3.2. Mecanismo de Validación y Creación Automática en el Primer `POST`

Para satisfacer el requerimiento: *"debe tener una validación si se está realizando el POST por primera vez se debe construir la tabla de postgres"*, se utiliza el patrón **`EnsureTable`** sincronizado con `sync.Once` dentro del adaptador PostgreSQL (`RateRepository`):

```go
type RateRepository struct {
    conn      *pgxpool.Pool
    initOnce  sync.Once
    initError error
}

func (r *RateRepository) EnsureTable(ctx context.Context) error {
    r.initOnce.Do(func() {
        _, r.initError = r.conn.Exec(ctx, RateSchemaDDL)
    })
    return r.initError
}

func (r *RateRepository) Save(ctx context.Context, rate domain.Rate) (domain.Rate, error) {
    // Al realizar un POST, se valida y asegura la existencia de la tabla antes del INSERT
    if err := r.EnsureTable(ctx); err != nil {
        return domain.Rate{}, fmt.Errorf("ensure rates table on save: %w", err)
    }

    const query = `
        INSERT INTO rates (
            id, name, headquarter_id, subheadquarter_id, room_type_id,
            modality, price, duration_units, start_time, end_time,
            days_of_week, status, created_by, created_at, updated_at
        ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15
        )
        RETURNING created_at, updated_at;
    `
    // Ejecución segura de la inserción...
}
```

**Ventajas de este enfoque**:
1. **Thread-Safe**: `sync.Once` garantiza que el DDL solo se ejecute una única vez durante el ciclo de vida del proceso, eliminando sobrecargas en peticiones posteriores.
2. **Idempotencia Absoluta**: Utiliza `CREATE TABLE IF NOT EXISTS` y `CREATE INDEX IF NOT EXISTS`, impidiendo fallos si la tabla ya existía previamente.
3. **Fail-Safe**: Si la base de datos rechaza la instrucción por falta de permisos o conexión, el error es capturado inmediatamente y retornado limpiamente al cliente HTTP como un error 500 sin romper el estado del servidor.

---

## 4. Arquitectura de la Solución (Hexagonal + Vertical Slicing)

```
                    ┌──────────────────────────────────────────────┐
                    │            HTTP Client / Router              │
                    │        (POST, GET, PUT, DELETE /rates)       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               Delivery Layer                 │
                    │           [internal/api/rate]                │
                    │  - Handler (Decodifica JSON, HTTP Status)    │
                    │  - DTOs de entrada y salida (JSON response)  │
                    └──────────────────────┬───────────────────────┘
                                           │ (invoca puertos estrechos)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │             Application Layer                │
                    │       [internal/application/rate]            │
                    │  - CreateRateUseCase                         │
                    │  - GetRateUseCase, ListRatesUseCase          │
                    │  - UpdateRateUseCase, DeleteRateUseCase      │
                    │  - ports.go (RateCreator, IDProvider, etc.)  │
                    └──────────────────────┬───────────────────────┘
                                           │ (utiliza interfaces de dominio)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │                Domain Layer                  │
                    │            [internal/domain]                 │
                    │  - Entidad: Rate                             │
                    │  - Value Objects: RateModality, RateStatus   │
                    │  - Constructor con Invariantes: NewRate()    │
                    │  - Puerto: RateRepository (interface)        │
                    │  - Errores centinela del dominio             │
                    └──────────────────────▲───────────────────────┘
                                           │
                                           │ (implementa interfaz)
                    ┌──────────────────────┴───────────────────────┐
                    │            Infrastructure Layer              │
                    │ [internal/infrastructure/persistence/postgres│
                    │  - RateRepository (pgxpool.Pool)             │
                    │  - RateSchemaDDL (Derivado 1:1 del modelo)   │
                    │  - EnsureTable (sync.Once al ejecutar POST)  │
                    └──────────────────────────────────────────────┘
```

---

## 5. Desglose de Código por Capas

### 5.1. Capa de Dominio (`internal/domain`)

#### Archivo: `internal/domain/rate.go`

```go
package domain

import (
	"errors"
	"strings"
	"time"
)

// RateID identifica unívocamente una tarifa en el sistema.
type RateID string

// RateModality representa la frecuencia o franja de cobro de la tarifa.
type RateModality string

const (
	RateModalityMorning   RateModality = "morning"
	RateModalityAfternoon RateModality = "afternoon"
	RateModalityNight     RateModality = "night"
	RateModalityDaily     RateModality = "daily"
	RateModalityWeekly    RateModality = "weekly"
	RateModalityHourly    RateModality = "hourly"
)

// ValidRateModalities lista todas las modalidades admitidas.
var ValidRateModalities = []RateModality{
	RateModalityMorning,
	RateModalityAfternoon,
	RateModalityNight,
	RateModalityDaily,
	RateModalityWeekly,
	RateModalityHourly,
}

// RateStatus representa el estado de operatividad de una tarifa.
type RateStatus string

const (
	RateStatusActive   RateStatus = "active"
	RateStatusInactive RateStatus = "inactive"
)

// Errores centinela del dominio Rate.
var (
	ErrRateNotFound              = errors.New("rate not found")
	ErrRateDuplicated            = errors.New("a rate with these parameters already exists")
	ErrInvalidRateName           = errors.New("rate name must not be empty")
	ErrInvalidRateHeadquarterID  = errors.New("headquarter id is required")
	ErrInvalidRateModality       = errors.New("modality must be one of: morning, afternoon, night, daily, weekly, hourly")
	ErrInvalidRatePrice          = errors.New("rate price must be strictly greater than zero")
	ErrInvalidRateDurationUnits  = errors.New("duration units must be at least 1")
	ErrInvalidRateStatus         = errors.New("status must be active or inactive")
	ErrInvalidRateTimeFormat     = errors.New("start_time and end_time must be in valid format (HH:MM or HH:MM:SS)")
)

// Rate es la entidad raíz del agregado de tarifas hoteleras.
type Rate struct {
	ID               RateID
	Name             string
	HeadquarterID    HeadquarterID
	SubHeadquarterID *SubHeadquarterID
	RoomTypeID       *RoomTypeID
	Modality         RateModality
	Price            BasePrice
	DurationUnits    int
	StartTime        *string
	EndTime          *string
	DaysOfWeek       string
	Status           RateStatus
	CreatedBy        string
	CreatedAt        time.Time
	UpdatedAt        time.Time
}

// NewRate es el constructor seguro que valida invariantes antes de instanciar la entidad.
func NewRate(
	id RateID,
	name string,
	headquarterID HeadquarterID,
	subHeadquarterID *SubHeadquarterID,
	roomTypeID *RoomTypeID,
	modality RateModality,
	price BasePrice,
	durationUnits int,
	startTime *string,
	endTime *string,
	daysOfWeek string,
	status RateStatus,
	createdBy string,
	createdAt time.Time,
) (Rate, error) {
	if durationUnits <= 0 {
		durationUnits = 1
	}
	if strings.TrimSpace(daysOfWeek) == "" {
		daysOfWeek = "all"
	}

	rate := Rate{
		ID:               id,
		Name:             strings.TrimSpace(name),
		HeadquarterID:    headquarterID,
		SubHeadquarterID: subHeadquarterID,
		RoomTypeID:       roomTypeID,
		Modality:         modality,
		Price:            price,
		DurationUnits:    durationUnits,
		StartTime:        startTime,
		EndTime:          endTime,
		DaysOfWeek:       daysOfWeek,
		Status:           status,
		CreatedBy:        strings.TrimSpace(createdBy),
		CreatedAt:        createdAt,
		UpdatedAt:        createdAt,
	}

	if err := rate.Validate(); err != nil {
		return Rate{}, err
	}
	return rate, nil
}

// Validate comprueba las reglas de negocio e invariantes de la tarifa.
func (r Rate) Validate() error {
	if r.Name == "" {
		return ErrInvalidRateName
	}
	if r.HeadquarterID == "" {
		return ErrInvalidRateHeadquarterID
	}
	if r.Price <= 0 {
		return ErrInvalidRatePrice
	}
	if r.DurationUnits < 1 {
		return ErrInvalidRateDurationUnits
	}

	switch r.Modality {
	case RateModalityMorning, RateModalityAfternoon, RateModalityNight,
		RateModalityDaily, RateModalityWeekly, RateModalityHourly:
		// Modalidad válida
	default:
		return ErrInvalidRateModality
	}

	switch r.Status {
	case RateStatusActive, RateStatusInactive:
		// Estado válido
	default:
		return ErrInvalidRateStatus
	}

	return nil
}
```

#### Archivo: `internal/domain/rate_repository.go`

```go
package domain

import "context"

// RateFilter define los criterios de filtrado escalables para listar tarifas.
type RateFilter struct {
	HeadquarterID    *HeadquarterID
	SubHeadquarterID *SubHeadquarterID
	RoomTypeID       *RoomTypeID
	Modality         *RateModality
	Status           *RateStatus
}

// RateRepository define el puerto secundario de persistencia (DIP).
type RateRepository interface {
	FindAll(ctx context.Context, filter RateFilter) ([]Rate, error)
	FindByID(ctx context.Context, id RateID) (Rate, error)
	Save(ctx context.Context, rate Rate) (Rate, error)
	Update(ctx context.Context, rate Rate) (Rate, error)
	Delete(ctx context.Context, id RateID) error
	EnsureTable(ctx context.Context) error
}
```

---

### 5.2. Capa de Aplicación (`internal/application/rate`)

#### Archivo: `internal/application/rate/ports.go`

```go
package rate

import (
	"context"
	"nexora-api-rest/internal/domain"
)

type IDProvider interface {
	NewRateID() domain.RateID
}

type RateCreator interface {
	Create(ctx context.Context, in CreateInput) (domain.Rate, error)
}

type RateLister interface {
	List(ctx context.Context, filter domain.RateFilter) ([]domain.Rate, error)
}

type RateGetter interface {
	GetByID(ctx context.Context, id domain.RateID) (domain.Rate, error)
}

type RateUpdater interface {
	Update(ctx context.Context, in UpdateInput) (domain.Rate, error)
}

type RateDeleter interface {
	Delete(ctx context.Context, id domain.RateID) error
}
```

#### Archivo: `internal/application/rate/create.go`

```go
package rate

import (
	"context"
	"time"

	"nexora-api-rest/internal/domain"
)

type CreateInput struct {
	Name             string
	HeadquarterID    domain.HeadquarterID
	SubHeadquarterID *domain.SubHeadquarterID
	RoomTypeID       *domain.RoomTypeID
	Modality         domain.RateModality
	Price            float64
	DurationUnits    int
	StartTime        *string
	EndTime          *string
	DaysOfWeek       string
	Status           domain.RateStatus
	CreatedBy        string
}

type CreateRateUseCase struct {
	repo       domain.RateRepository
	idProvider IDProvider
}

func NewCreateRateUseCase(repo domain.RateRepository, idProvider IDProvider) *CreateRateUseCase {
	return &CreateRateUseCase{repo: repo, idProvider: idProvider}
}

func (uc *CreateRateUseCase) Create(ctx context.Context, in CreateInput) (domain.Rate, error) {
	id := uc.idProvider.NewRateID()
	now := time.Now().UTC()

	basePrice, err := domain.NewBasePrice(in.Price)
	if err != nil {
		return domain.Rate{}, err
	}

	status := in.Status
	if status == "" {
		status = domain.RateStatusActive
	}

	rate, err := domain.NewRate(
		id,
		in.Name,
		in.HeadquarterID,
		in.SubHeadquarterID,
		in.RoomTypeID,
		in.Modality,
		basePrice,
		in.DurationUnits,
		in.StartTime,
		in.EndTime,
		in.DaysOfWeek,
		status,
		in.CreatedBy,
		now,
	)
	if err != nil {
		return domain.Rate{}, err
	}

	return uc.repo.Save(ctx, rate)
}
```

---

### 5.3. Capa de Infraestructura (`internal/infrastructure/persistence/postgres`)

#### Archivo: `internal/infrastructure/persistence/postgres/rate_repository.go`

```go
package postgres

import (
	"context"
	"errors"
	"fmt"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"nexora-api-rest/internal/domain"
)

const RateSchemaDDL = `
CREATE TABLE IF NOT EXISTS rates (
    id                 VARCHAR(36) PRIMARY KEY,
    name               VARCHAR(150) NOT NULL,
    headquarter_id     VARCHAR(36) NOT NULL,
    subheadquarter_id  VARCHAR(36),
    room_type_id       VARCHAR(36),
    modality           VARCHAR(30) NOT NULL,
    price              NUMERIC(12, 2) NOT NULL,
    duration_units     INTEGER NOT NULL DEFAULT 1,
    start_time         TIME,
    end_time           TIME,
    days_of_week       VARCHAR(50) NOT NULL DEFAULT 'all',
    status             VARCHAR(30) NOT NULL DEFAULT 'active',
    created_by         VARCHAR(100) NOT NULL DEFAULT '',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (modality IN ('morning', 'afternoon', 'night', 'daily', 'weekly', 'hourly')),
    CHECK (status IN ('active', 'inactive')),
    CHECK (price > 0),
    CHECK (duration_units >= 1)
);

CREATE INDEX IF NOT EXISTS idx_rates_headquarter_id ON rates(headquarter_id);
CREATE INDEX IF NOT EXISTS idx_rates_subheadquarter_id ON rates(subheadquarter_id);
CREATE INDEX IF NOT EXISTS idx_rates_room_type_id ON rates(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rates_modality ON rates(modality);
CREATE INDEX IF NOT EXISTS idx_rates_status ON rates(status);
CREATE INDEX IF NOT EXISTS idx_rates_query_lookup ON rates(headquarter_id, subheadquarter_id, room_type_id, modality, status);
`

type RateRepository struct {
	conn      *pgxpool.Pool
	initOnce  sync.Once
	initError error
}

func NewRateRepository(conn *pgxpool.Pool) *RateRepository {
	return &RateRepository{conn: conn}
}

var _ domain.RateRepository = (*RateRepository)(nil)

func (r *RateRepository) EnsureTable(ctx context.Context) error {
	r.initOnce.Do(func() {
		_, r.initError = r.conn.Exec(ctx, RateSchemaDDL)
	})
	return r.initError
}

func (r *RateRepository) Save(ctx context.Context, rate domain.Rate) (domain.Rate, error) {
	// Aprovisionamiento automático en la primera ejecución del POST
	if err := r.EnsureTable(ctx); err != nil {
		return domain.Rate{}, fmt.Errorf("ensure rates table: %w", err)
	}

	const query = `
		INSERT INTO rates (
			id, name, headquarter_id, subheadquarter_id, room_type_id,
			modality, price, duration_units, start_time, end_time,
			days_of_week, status, created_by, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5,
			$6, $7, $8, $9, $10,
			$11, $12, $13, $14, $15
		)
		RETURNING created_at, updated_at;
	`

	var subHQ *string
	if rate.SubHeadquarterID != nil {
		s := string(*rate.SubHeadquarterID)
		subHQ = &s
	}

	var roomType *string
	if rate.RoomTypeID != nil {
		rt := string(*rate.RoomTypeID)
		roomType = &rt
	}

	err := r.conn.QueryRow(
		ctx,
		query,
		string(rate.ID),
		rate.Name,
		string(rate.HeadquarterID),
		subHQ,
		roomType,
		string(rate.Modality),
		float64(rate.Price),
		rate.DurationUnits,
		rate.StartTime,
		rate.EndTime,
		rate.DaysOfWeek,
		string(rate.Status),
		rate.CreatedBy,
		rate.CreatedAt,
		rate.UpdatedAt,
	).Scan(&rate.CreatedAt, &rate.UpdatedAt)

	if err != nil {
		return domain.Rate{}, fmt.Errorf("insert rate: %w", err)
	}

	return rate, nil
}
```

---

## 6. Especificación de la API REST (`internal/api/rate`)

### 6.1. Resumen de Endpoints

| Método | Ruta | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| `POST` | `/rates` (alias `/rate`) | Crea una nueva tarifa. **Ejecuta `EnsureTable` para garantizar la tabla en Postgres**. | `201`, `400`, `422`, `500` |
| `GET` | `/rates` | Lista tarifas con filtros query (`headquarter_id`, `subheadquarter_id`, etc.). | `200`, `500` |
| `GET` | `/rates/{id}` | Obtiene el detalle de una tarifa por su ID. | `200`, `400`, `404`, `500` |
| `PUT` | `/rates/{id}` | Actualiza completamente los datos de una tarifa. | `200`, `400`, `404`, `422`, `500` |
| `DELETE` | `/rates/{id}` | Elimina o desactiva una tarifa del catálogo. | `204`, `400`, `404`, `500` |

---

### 6.2. Detalle de Contratos y Ejemplos de Petición / Respuesta

#### 1. `POST /rates` (Creación de Tarifa)
- **Request Body (JSON)**:
```json
{
  "name": "Tarifa Noche Fin de Semana",
  "headquarter_id": "8a3e7b1a-2c9d-4e8f-9a1b-3c4d5e6f7a8b",
  "subheadquarter_id": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "room_type_id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  "modality": "night",
  "price": 120.00,
  "duration_units": 1,
  "start_time": "20:00:00",
  "end_time": "08:00:00",
  "days_of_week": "weekend",
  "status": "active",
  "created_by": "supervisor@nexora.com"
}
```

- **Respuesta Exitosa (`201 Created`)**:
```json
{
  "id": "e9b2c3d4-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "name": "Tarifa Noche Fin de Semana",
  "headquarter_id": "8a3e7b1a-2c9d-4e8f-9a1b-3c4d5e6f7a8b",
  "subheadquarter_id": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "room_type_id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  "modality": "night",
  "price": 120.00,
  "duration_units": 1,
  "start_time": "20:00:00",
  "end_time": "08:00:00",
  "days_of_week": "weekend",
  "status": "active",
  "created_by": "supervisor@nexora.com",
  "created_at": "2026-09-26T21:55:00Z",
  "updated_at": "2026-09-26T21:55:00Z"
}
```

- **Ejemplo en Modalidad Horas (`hourly`)**:
```json
{
  "name": "Tarifa Express 3 Horas",
  "headquarter_id": "8a3e7b1a-2c9d-4e8f-9a1b-3c4d5e6f7a8b",
  "subheadquarter_id": null,
  "room_type_id": null,
  "modality": "hourly",
  "price": 45.00,
  "duration_units": 3,
  "start_time": null,
  "end_time": null,
  "days_of_week": "all",
  "status": "active",
  "created_by": "admin@nexora.com"
}
```

---

#### 2. `GET /rates` (Listado y Búsqueda con Filtros)
- **Filtros Query Parameters Admitidos**:
  - `?headquarter_id=...` (Filtra tarifas de una sede específica).
  - `?subheadquarter_id=...` (Filtra por subsede).
  - `?room_type_id=...` (Filtra por tipo de habitación).
  - `?modality=...` (Filtra por `morning`, `afternoon`, `night`, `daily`, `weekly`, `hourly`).
  - `?status=...` (Filtra por `active` o `inactive`).

- **Respuesta Exitosa (`200 OK`)**:
```json
[
  {
    "id": "e9b2c3d4-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
    "name": "Tarifa Noche Fin de Semana",
    "headquarter_id": "8a3e7b1a-2c9d-4e8f-9a1b-3c4d5e6f7a8b",
    "subheadquarter_id": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
    "room_type_id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    "modality": "night",
    "price": 120.00,
    "duration_units": 1,
    "start_time": "20:00:00",
    "end_time": "08:00:00",
    "days_of_week": "weekend",
    "status": "active",
    "created_by": "supervisor@nexora.com",
    "created_at": "2026-09-26T21:55:00Z",
    "updated_at": "2026-09-26T21:55:00Z"
  }
]
```

---

#### 3. `GET /rates/{id}` (Consulta Individual)
- **Respuesta Exitosa (`200 OK`)**: Objeto JSON individual idéntico al de creación.
- **Respuesta Fallida (`404 Not Found`)**:
```json
{
  "error": "rate not found"
}
```

---

#### 4. `PUT /rates/{id}` (Actualización de Tarifa)
- **Request Body (JSON)**:
```json
{
  "name": "Tarifa Noche Fin de Semana Ajustada",
  "headquarter_id": "8a3e7b1a-2c9d-4e8f-9a1b-3c4d5e6f7a8b",
  "subheadquarter_id": "1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e",
  "room_type_id": "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
  "modality": "night",
  "price": 135.00,
  "duration_units": 1,
  "start_time": "20:00:00",
  "end_time": "08:00:00",
  "days_of_week": "weekend",
  "status": "active"
}
```
- **Respuesta Exitosa (`200 OK`)**: Objeto JSON actualizado con nuevo `updated_at`.

---

#### 5. `DELETE /rates/{id}` (Eliminación)
- **Respuesta Exitosa (`204 No Content`)**: Sin cuerpo en la respuesta.
- **Respuesta Fallida (`404 Not Found`)**: Si la tarifa con ese ID no existe.

---

## 7. Rúbrica de Cumplimiento SOLID y Ética del Software

1. **S - Single Responsibility Principle**:
   - Cada caso de uso en `internal/application/rate/` tiene una única razón de cambio (`CreateRateUseCase`, `GetRateUseCase`, etc.).
   - El handler HTTP únicamente traduce JSON, delega al usecase correspondiente y responde con el status code adecuado.

2. **O - Open/Closed Principle**:
   - Para añadir una nueva modalidad de tarifa (ej: `monthly`, `seasonal`), basta con registrarla en el dominio y en la restricción de base de datos sin necesidad de reescribir los casos de uso.

3. **L - Liskov Substitution Principle**:
   - `postgres.RateRepository` implementa estrictamente `domain.RateRepository`. Se puede intercambiar por un repositorio en memoria (`InMemoryRateRepository`) en tests unitarios sin alterar el comportamiento.

4. **I - Interface Segregation Principle**:
   - El handler HTTP no depende del repositorio monolítico, sino de interfaces segregadas (`RateCreator`, `RateLister`, `RateGetter`, `RateUpdater`, `RateDeleter`).

5. **D - Dependency Inversion Principle**:
   - Los casos de uso y la capa de dominio dependen de interfaces abstractas. PostgreSQL y `net/http` se ubican en los extremos externos de la arquitectura hexagonal.

6. **Imperativo de Responsabilidad y Heurística de la Precaución**:
   - Las tarifas representan transacciones financieras reales para huéspedes y sedes hoteleras. No se admiten precios negativos ni valores ambiguos. Si un dato tarifario es inválido, el sistema falla de manera controlada y segura (*fail-safe*), protegiendo la integridad económica y la transparencia con el cliente.

---

## 8. Prompt Maestro para la Generación del Código

Para ejecutar la implementación completa de este módulo con un agente de IA o desarrollador, utiliza el siguiente prompt:

```text
Actúa como un desarrollador experto en Go (Golang) y arquitectura de software.
Implementa el nuevo endpoint y slice vertical para la entidad "Rate" (Tarifas del Hotel) en el proyecto "nexora-api-rest", siguiendo estrictamente la arquitectura Vertical Slicing + Onion Architecture + Principios SOLID del repositorio.

Contexto y reglas de negocio:
- Las tarifas aplican a cada Sede (headquarter_id) y opcionalmente a una Sub Sede (subheadquarter_id) y/o Tipo de Habitación (room_type_id).
- Modalidades admitidas: 'morning', 'afternoon', 'night', 'daily', 'weekly', 'hourly'.
- duration_units: entero >= 1 (por defecto 1).
- price: BasePrice (float64), estrictamente > 0.00.
- start_time y end_time: opcionales (formato TIME / string).
- days_of_week: string con valor por defecto 'all'.
- status: 'active' o 'inactive'.

Requisito indispensable de base de datos:
- Implementar en internal/infrastructure/persistence/postgres/rate_repository.go el método EnsureTable(ctx context.Context) error con sync.Once que ejecute el DDL de creación de la tabla "rates" e índices (CREATE TABLE IF NOT EXISTS rates ...).
- En el método Save (al procesar un POST por primera vez), debe ejecutarse r.EnsureTable(ctx) para garantizar que la tabla se cree automáticamente si no existe.

Estructura de archivos a crear:
1. internal/domain/rate.go:
   - Struct Rate con campos, tipos y Value Objects (RateID, RateModality, RateStatus, BasePrice).
   - Constantes de modalidades (morning, afternoon, night, daily, weekly, hourly).
   - Errores centinela del dominio (ErrRateNotFound, ErrInvalidRatePrice, ErrInvalidRateModality, etc.).
   - Constructor NewRate(...) con validación de invariantes.

2. internal/domain/rate_repository.go:
   - Interfaz RateRepository con FindAll(ctx context.Context, filter RateFilter) ([]Rate, error), FindByID, Save, Update, Delete y EnsureTable.

3. internal/application/rate/:
   - ports.go: interfaces segregadas (RateCreator, RateLister, RateGetter, RateUpdater, RateDeleter, IDProvider).
   - create.go: CreateRateUseCase con CreateInput y validación.
   - get.go, list.go, update.go, delete.go.

4. internal/infrastructure/persistence/postgres/rate_repository.go:
   - Implementación de RateRepository con *pgxpool.Pool.
   - DDL RateSchemaDDL con CHECK constraints e índices.
   - EnsureTable sincronizado con sync.Once ejecutado en Save y FindAll.

5. internal/api/rate/:
   - handler.go, create.go, get.go, list.go, update.go, delete.go.
   - Usar solo la librería estándar net/http de Go y el helper internal/api/httpjson.
   - Manejo de filtros query parameters en list.go (headquarter_id, subheadquarter_id, room_type_id, modality, status).

6. Conexión y enrutamiento:
   - Registrar repositorio en cmd/api/main.go.
   - Enlazar rutas en internal/api/router.go para POST, GET, PUT, DELETE en "/rates" y alias "/rate".

Restricciones técnicas:
- Usar Go idiomático, estándar (net/http, context, errors, fmt).
- Sin frameworks externos innecesarios.
- El código debe compilar limpiamente con "go build ./..." y pasar "go vet ./...".
```
