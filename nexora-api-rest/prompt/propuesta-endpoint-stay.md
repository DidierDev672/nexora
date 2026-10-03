# Propuesta Técnica e Instrucciones para Crear el Endpoint: `Stay` (Estancia / Check-In)

Este documento detalla la propuesta técnica y las instrucciones completas para implementar el nuevo endpoint basado en la entidad **`Stay`** (Estancia / Registro de Ingreso), siguiendo la arquitectura definida en el proyecto: **Vertical Slicing + Onion Architecture (Hexagonal) + Principios SOLID** y la provisión automática de la tabla en PostgreSQL (`EnsureTable`) en la primera ejecución del método `POST`.

---

## 1. Definición del Dominio y Modelo de Datos

### 1.1. Atributos de la Entidad

| Atributo | Tipo Go | Tipo PostgreSQL | Restricciones / Reglas de Negocio |
| :--- | :--- | :--- | :--- |
| `id` | `StayID` (string) | `VARCHAR(36)` | Clave primaria (UUID v4 o ID generado). No vacío. |
| `room_id` | `RoomID` (string) | `VARCHAR(36)` | Requerido. Referencia válida a una habitación. |
| `reservation_id` | `ReserveID` (string) | `VARCHAR(36)` | Requerido. Referencia a la reserva asociada. |
| `person_id` | `PersonID` (string) | `VARCHAR(36)` | Requerido. Referencia al huésped/persona. |
| `check_in_date` | `time.Time` | `TIMESTAMPTZ` | Requerido. Fecha y hora de entrada efectiva. |
| `check_out_date` | `time.Time` | `TIMESTAMPTZ` | Requerido. Debe ser posterior a `check_in_date`. |
| `payment_method` | `PaymentMethod` (string) | `VARCHAR(30)` | Obligatorio. Valores válidos: `'cash'`, `'card'`, `'bank transfer'`. |
| `security_deposit` | `float64` | `NUMERIC(12,2)` | Obligatorio. Depósito en garantía, debe ser $\ge 0.00$. |
| `remarks` | `string` | `TEXT` | Opcional (por defecto texto vacío). Observaciones adicionales. |
| `status` | `StayStatus` (string) | `VARCHAR(30)` | Obligatorio. Valores válidos: `'progress'`, `'completed'`, `'canceled'`. |
| `created_by` | `string` | `VARCHAR(100)` | Auditoría de usuario creador. |
| `created_at` | `time.Time` | `TIMESTAMPTZ` | Marca de tiempo UTC al registrar. |
| `updated_at` | `time.Time` | `TIMESTAMPTZ` | Marca de tiempo UTC al actualizar. |

---

## 2. Arquitectura de la Solución

Siguiendo el diseño establecido en `internal/`:

```
                    ┌──────────────────────────────────────────────┐
                    │            HTTP Client / Router              │
                    │        (POST, GET, PUT, DELETE /stays)       │
                    └──────────────────────┬───────────────────────┘
                                           │
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │               Delivery Layer                 │
                    │           [internal/api/stay]                │
                    │  - Handler (Decodifica JSON, HTTP Status)    │
                    │  - DTOs de entrada y salida (JSON response)  │
                    └──────────────────────┬───────────────────────┘
                                           │ (invoca puertos estrechos)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │             Application Layer                │
                    │       [internal/application/stay]            │
                    │  - CreateStayUseCase                         │
                    │  - GetStayUseCase, ListStaysUseCase          │
                    │  - UpdateStayUseCase, DeleteStayUseCase      │
                    │  - ports.go (StayCreator, IDProvider, etc.)  │
                    └──────────────────────┬───────────────────────┘
                                           │ (utiliza interfaces de dominio)
                                           ▼
                    ┌──────────────────────────────────────────────┐
                    │                Domain Layer                  │
                    │            [internal/domain]                 │
                    │  - Entidad: Stay                             │
                    │  - Value Objects: PaymentMethod, StayStatus  │
                    │  - Constructor con Invariantes: NewStay()    │
                    │  - Puerto: StayRepository (interface)        │
                    │  - Errores centinela del dominio             │
                    └──────────────────────▲───────────────────────┘
                                           │
                                           │ (implementa interfaz)
                    ┌──────────────────────┴───────────────────────┐
                    │            Infrastructure Layer              │
                    │ [internal/infrastructure/persistence/postgres│
                    │  - StayRepository (pgxpool.Pool)             │
                    │  - StaySchemaDDL (Derivado 1:1 del modelo)   │
                    │  - EnsureTable (sync.Once al ejecutar POST)  │
                    └──────────────────────────────────────────────┘
```

---

## 3. Desglose de Implementación por Capas

### 3.1. Capa de Dominio (`internal/domain`)

#### Archivo: `internal/domain/stay.go`
- **Tipos y Constantes**:
  ```go
  type StayID string
  
  type PaymentMethod string
  const (
      PaymentMethodCash         PaymentMethod = "cash"
      PaymentMethodCard         PaymentMethod = "card"
      PaymentMethodBankTransfer PaymentMethod = "bank transfer"
  )

  type StayStatus string
  const (
      StayStatusProgress  StayStatus = "progress"
      StayStatusCompleted StayStatus = "completed"
      StayStatusCanceled  StayStatus = "canceled"
  )
  ```
- **Errores Centinela**:
  - `ErrStayNotFound`
  - `ErrInvalidStayID`
  - `ErrInvalidStayRoomID`
  - `ErrInvalidStayReservationID`
  - `ErrInvalidStayPersonID`
  - `ErrInvalidStayDates` (check_out $\le$ check_in)
  - `ErrInvalidPaymentMethod`
  - `ErrInvalidSecurityDeposit` (menor a cero)
  - `ErrInvalidStayStatus`
- **Constructor e Invariantes**:
  - Función constructora `NewStay(...) (Stay, error)` que invoca `Validate()`.
  - Métodos de comportamiento de negocio:
    - `Complete(at time.Time) error`
    - `Cancel(reason string) error`

#### Archivo: `internal/domain/stay_repository.go`
- Define la interfaz de persistencia independiente del motor de base de datos:
  ```go
  type StayRepository interface {
      FindAll(ctx context.Context) ([]Stay, error)
      FindByID(ctx context.Context, id StayID) (Stay, error)
      Save(ctx context.Context, stay Stay) (Stay, error)
      Update(ctx context.Context, stay Stay) (Stay, error)
      Delete(ctx context.Context, id StayID) error
      EnsureTable(ctx context.Context) error
  }
  ```

---

### 3.2. Capa de Aplicación (`internal/application/stay`)

#### Archivo: `internal/application/stay/ports.go`
- Aplicando **ISP (Interface Segregation Principle)**:
  ```go
  type IDProvider interface {
      NewStayID() domain.StayID
  }

  type StayCreator interface {
      Create(ctx context.Context, in CreateInput) (domain.Stay, error)
  }

  type StayLister interface {
      List(ctx context.Context) ([]domain.Stay, error)
  }

  type StayGetter interface {
      GetByID(ctx context.Context, id domain.StayID) (domain.Stay, error)
  }

  type StayUpdater interface {
      Update(ctx context.Context, in UpdateInput) (domain.Stay, error)
  }

  type StayDeleter interface {
      Delete(ctx context.Context, id domain.StayID) error
  }
  ```

#### Archivo: `internal/application/stay/create.go`
- Caso de uso único (`CreateStayUseCase`):
  - Recibe `domain.StayRepository` e `IDProvider` (DIP).
  - Normaliza y parsea fechas, `PaymentMethod` y `StayStatus`.
  - Construye la entidad llamando a `domain.NewStay`.
  - Guarda invocando `repo.Save(ctx, stay)`.

---

### 3.3. Capa de Infraestructura (`internal/infrastructure/persistence/postgres`)

#### Archivo: `internal/infrastructure/persistence/postgres/stay_repository.go`
- **DDL derivado 1:1 del modelo**:
  ```sql
  CREATE TABLE IF NOT EXISTS stays (
      id               VARCHAR(36) PRIMARY KEY,
      room_id          VARCHAR(36) NOT NULL,
      reservation_id   VARCHAR(36) NOT NULL,
      person_id        VARCHAR(36) NOT NULL,
      check_in_date    TIMESTAMPTZ NOT NULL,
      check_out_date   TIMESTAMPTZ NOT NULL,
      payment_method   VARCHAR(30) NOT NULL,
      security_deposit NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
      remarks          TEXT NOT NULL DEFAULT '',
      status           VARCHAR(30) NOT NULL DEFAULT 'progress',
      created_by       VARCHAR(100) NOT NULL DEFAULT '',
      created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
      CHECK (payment_method IN ('cash', 'card', 'bank transfer')),
      CHECK (status IN ('progress', 'completed', 'canceled')),
      CHECK (security_deposit >= 0),
      CHECK (check_out_date > check_in_date)
  );
  CREATE INDEX IF NOT EXISTS idx_stays_room_id ON stays(room_id);
  CREATE INDEX IF NOT EXISTS idx_stays_reservation_id ON stays(reservation_id);
  CREATE INDEX IF NOT EXISTS idx_stays_person_id ON stays(person_id);
  CREATE INDEX IF NOT EXISTS idx_stays_dates ON stays(check_in_date, check_out_date);
  CREATE INDEX IF NOT EXISTS idx_stays_status ON stays(status);
  ```

- **Aprovisionamiento Automático (`EnsureTable`) en POST**:
  ```go
  type StayRepository struct {
      conn      *pgxpool.Pool
      initOnce  sync.Once
      initError error
  }

  func (r *StayRepository) EnsureTable(ctx context.Context) error {
      r.initOnce.Do(func() {
          _, r.initError = r.conn.Exec(ctx, StaySchemaDDL)
      })
      return r.initError
  }

  func (r *StayRepository) Save(ctx context.Context, stay domain.Stay) (domain.Stay, error) {
      // Garantiza que la tabla exista al insertar por primera vez
      if err := r.EnsureTable(ctx); err != nil {
          return domain.Stay{}, fmt.Errorf("ensure stays table: %w", err)
      }
      // Ejecución del INSERT ... RETURNING created_at, updated_at
  }
  ```

---

### 3.4. Capa de Entrega HTTP (`internal/api/stay`)

- **Rutas estándar de Go (`net/http`)**:
  - `POST /stays` (y alias `POST /stay` para compatibilidad)
  - `GET /stays`
  - `GET /stays/{id}`
  - `PUT /stays/{id}`
  - `DELETE /stays/{id}`
- **Handler**:
  - Compone los puertos estrechos `StayCreator`, `StayLister`, `StayGetter`, etc.
  - Decodifica el JSON de entrada (`createStayRequest`).
  - Traduce los errores de dominio a códigos de estado HTTP (400 Bad Request, 404 Not Found, 422 Unprocessable Entity, 500 Internal Server Error).
  - Retorna HTTP 201 Created con el DTO `stayResponse` al crear.

---

### 3.5. Ensamble de Rutas (`internal/api/router.go` y `cmd/api/main.go`)

- En `cmd/api/main.go`:
  ```go
  stayRepo := postgres.NewStayRepository(conn)
  // Inyección en NewRouter
  ```
- En `internal/api/router.go`:
  ```go
  stayHandler := &stayhttp.Handler{
      Creator: stayapp.NewCreateStayUseCase(stayRepo, ids.RandomID{}),
      Lister:  stayapp.NewListStaysUseCase(stayRepo),
      Getter:  stayapp.NewGetStayUseCase(stayRepo),
      Updater: stayapp.NewUpdateStayUseCase(stayRepo),
      Deleter: stayapp.NewDeleteStayUseCase(stayRepo),
  }
  
  mux.HandleFunc("POST /stays", stayHandler.Create)
  mux.HandleFunc("POST /stay", stayHandler.Create)
  mux.HandleFunc("GET /stays", stayHandler.List)
  mux.HandleFunc("GET /stays/{id}", stayHandler.Get)
  mux.HandleFunc("PUT /stays/{id}", stayHandler.Update)
  mux.HandleFunc("DELETE /stays/{id}", stayHandler.Delete)
  ```

---

## 4. Rúbrica de Cumplimiento SOLID

1. **S - Single Responsibility Principle**:
   - Cada use case en `internal/application/stay/` realiza exactamente una sola operación (`Create`, `Get`, `List`, `Update`, `Delete`).
   - El handler HTTP solo maneja protocolo de red, deserialización y serialización.
2. **O - Open/Closed Principle**:
   - Nuevos métodos de pago o estados se añaden al set del dominio y constraint de base de datos sin alterar los casos de uso.
   - El usecase depende de interfaces (`StayRepository`), permitiendo cambiar de motor sin alterar la lógica de negocio.
3. **L - Liskov Substitution Principle**:
   - `postgres.StayRepository` cumple 100% con `domain.StayRepository`. Se puede sustituir por un repositorio en memoria (`InMemoryStayRepository`) o mock para pruebas sin romper el sistema.
4. **I - Interface Segregation Principle**:
   - Se crean puertos específicos en `application/stay/ports.go` (`StayCreator`, `StayGetter`, etc.) para que el handler solo dependa de lo que necesita consumir.
5. **D - Dependency Inversion Principle**:
   - El núcleo (dominio y casos de uso) no conoce detalles de Postgres ni del router HTTP. La infraestructura implementa las abstracciones definidas en el dominio.

---

## 5. Prompt Maestro para la Generación del Código

Para ejecutar la creación de este endpoint con un agente o modelo de IA, utiliza el siguiente prompt:

```text
Actúa como un desarrollador experto en Go (Golang) y arquitectura de software.
Implementa el nuevo endpoint y slice para la entidad "Stay" (Estancia / Hospedaje) en el proyecto "nexora-api-rest", siguiendo estrictamente la arquitectura Vertical Slicing + Onion Architecture + Principios SOLID del repositorio.

Entidad a modelar:
- ID: identificador de la estancia (StayID, string)
- room_id: referencia a habitación (RoomID, string)
- reservation_id: referencia a reserva (ReserveID, string)
- person_id: referencia a huésped (PersonID, string)
- check_in_date: fecha de entrada (time.Time)
- check_out_date: fecha de salida (time.Time)
- payment_method: método de pago ('cash', 'card', 'bank transfer')
- security_deposit: depósito de garantía (float64, >= 0)
- remarks: observaciones (string)
- status: estado ('progress', 'completed', 'canceled')
- created_by: usuario creador (string)
- created_at: fecha de registro (time.Time)
- updated_at: fecha de actualización (time.Time)

Estructura de archivos requerida:
1. internal/domain/stay.go:
   - Struct Stay con campos encapsulados/adecuados.
   - Value Objects y tipos: StayID, PaymentMethod, StayStatus con constantes y sets de validación.
   - Errores centinela del dominio (ErrStayNotFound, ErrInvalidStayDates, etc.).
   - Constructor NewStay(...) con validación estricta de invariantes (check_out > check_in, security_deposit >= 0, payment_method y status válidos).

2. internal/domain/stay_repository.go:
   - Interfaz StayRepository con FindAll, FindByID, Save, Update, Delete y EnsureTable.

3. internal/application/stay/:
   - ports.go: interfaces segregadas (StayCreator, StayLister, StayGetter, StayUpdater, StayDeleter, IDProvider).
   - create.go: CreateStayUseCase con CreateInput y validación.
   - get.go, list.go, update.go, delete.go.

4. internal/infrastructure/persistence/postgres/stay_repository.go:
   - Implementación StayRepository con *pgxpool.Pool.
   - DDL StaySchemaDDL derivado 1:1 de domain.Stay con CHECK constraints e índices.
   - Método EnsureTable con sync.Once que crea la tabla automáticamente si no existe en la primera ejecución del método POST (Save).

5. internal/api/stay/:
   - handler.go, create.go, get.go, list.go, update.go, delete.go.
   - Endpoints HTTP usando solo la librería estándar net/http de Go.

6. Conexión y wiring:
   - Registrar repositorio en cmd/api/main.go.
   - Registrar rutas en internal/api/router.go para POST, GET, PUT, DELETE en "/stays" y "/stay".

Restricciones técnicas:
- Usar Go idiomático, estándar (net/http, context, errors, fmt).
- Sin frameworks HTTP externos.
- Asegurar que compile limpiamente con "go build ./..." y pase "go vet ./...".
```
