# Propuesta Técnica: Sistema de Auditoría Hotelera (Nexora API REST)

Este documento presenta la propuesta integral para un módulo de **Auditoría Hotelera** que opera sobre las entidades ya modeladas en **Nexora API REST** — Edificio, Habitación, Tipo de Cama, Sede, Sub Sede, Tarifa y Tarifa Aplicada — combinando la disciplina del **ingeniero industrial** (estado físico real, trazabilidad, estándares, KPIs) con la del **ingeniero de software** (estados transaccionales, integridad de datos, API REST verificable).

El objetivo es convertir el estado digital ("lo que el sistema dice") y el estado físico ("lo que el auditor observa") en una **matriz de auditoría** accionable, con reglas de negocio formales, endpoints de evidencia y KPI de conformidad.

---

## 1. Visión y Concepto de la Auditoría

Una auditoría hotelera de inventario y tarifas compara **tres dimensiones** por recurso:

1. **Estado de sistema** (`status`): lo que el sistema registra para la entidad.
2. **Estado físico (industrial)**: lo que el auditor verifica en campo (ocupación, limpieza, mantenimiento, disponibilidad física).
3. **Consistencia estructural**: las relaciones entre entidades (una habitación debe colgar de un edificio, el edificio de una sede, la tarifa aplicada de una tarifa válida).

**Concepto de "estados" manejado en esta propuesta:**

| Dimensión | Estado | Definición | Código de auditoría |
| :--- | :--- | :--- | :--- |
| Operatividad | `active` | Recurso habilitado y auditable | ✅ Conforme |
| Operatividad | `inactive` | Recurso deshabilitado / retirado | ⚠️ Revisar |
| Físico | `available` | Habitación disponible | ✅ Conforme |
| Físico | `busy` | Habitación ocupada | ✅ Conforme (con reserva) |
| Físico | `maintenance` | Habitación en mantenimiento | 🔧 En observación |
| Físico | `cleaning` | Habitación en limpieza | 🔧 En observación |
| Verdicto | `conforme` | Estado físico == estado de sistema | ✅ |
| Verdicto | `no_conforme` | Diverge (material) | ❌ |
| Verdicto | `en_observacion` | Diverge temporalmente (limpieza, mat.) | ⚠️ |

---

## 2. Entidades Auditables y sus Estados

### 2.1. Edificio (`/building`)

| Campo | Tipo | Rol en auditoría |
| :--- | :--- | :--- |
| `id` | string | Identificador del recurso auditado |
| `name` | string | Nombre institucional |
| `floor_number` | int | Número de pisos (>= 1) |
| `headquarters_id` | string | Sede a la que pertenece (obligatoria) |
| `sub_headquarters_id` | string \| null | Sub sede asociada (opcional) |
| `status` | string | Estado operativo del edificio |
| `created_by` / `created_at` / `updated_at` | - | Trazabilidad (quién y cuándo) |

**Reglas de auditoría del Edificio:**
- R1. `headquarters_id` no puede ser nulo o vacío (referencia a Sede obligatoria).
- R2. Si `sub_headquarters_id` está definido, la sede base y la sub sede deben ser coherentes.
- R3. `floor_number >= 1` (no existen pisos 0 en el inventario físico.
- R4. Un edificio `inactive` no debe tener habitaciones `available` asociadas.

### 2.2. Habitación (`/room`)

| Campo | Tipo | Rol en auditoría |
| :--- | :--- | :--- |
| `id` | string | Identificador |
| `number` | string | Número físico (placa/puerta) |
| `floor` | int | Piso físico |
| `room_types_id` | string | Tipo de habitación (obligatoria) |
| `building_id` | string | Edificio (obligatoria) |
| `price_override` | float \| null | Precio propio (0 = precio base del tipo) |
| `status` | string | `available`, `busy`, `maintenance`, `cleaning`, `inactive` |

**Reglas de auditoría de la Habitación:**
- R5. `number` único dentro del edificio (identidad física).
- R6. `price_override` no negativo; si es `null`, usa el precio base de su `room_type` (financiero: la habitación siempre tiene precio auditable).
- R7. Estado físico esperado según ocupación: `busy` implica estancia vigente asociada a la habitación.
- R8. `maintenance` y `cleaning` son estados transitorios de auditoría (con corte temporal).

### 2.3. Tipo de Cama (`/types-bed`)

| Campo | Tipo | Rol en auditoría |
| :--- | :--- | :--- |
| `id` | string | Identificador |
| `name` | string | Nombre del tipo (único) |
| `capacity_people` | int | Capacidad (>= 1) |
| `description` | string | Descripción estándar |
| `created_by` / timestamps | - | Trazabilidad |

**Reglas de auditoría del Tipo de Cama:**
- R9. `capacity_people >= 1` (una cama no puede albergar 0 personas).
- R10. `name` único (evita duplicidades en el inventario de mobiliario).
- R11. La capacidad declarada debe coincidir con la plazas físicas observadas (conteo en campo).

### 2.4. Sede y Sub Sede (`/headquarters`, `/sub-headquarters`)

| Campo | Rol en auditoría |
| :--- | :--- |
| `id`, `name`, `address`, `city`, `phone` | Identidad y ubicación del establecimiento |
| `status` | Operatividad de la sede / sub sede |
| `headquarter_id` (sub) | Sub sede siempre pertenece a una sede |

**Reglas de auditoría:**
- R12. Toda sub sede referencia una sede existente (`headquarter_id`).
- R13. Jerarquía de cobertura: tarifas y edificios declarados a nivel sede son heredables por sus sub sedes (escalabilidad del modelo).

### 2.5. Tarifa (`/rates`)

| Campo | Tipo | Rol en auditoría |
| :--- | :--- | :--- |
| `modality` | string | `morning`, `afternoon`, `night`, `daily`, `weekly`, `hourly` |
| `price` | float | Precio base (estrictamente > 0) |
| `duration_units` | int | Unidades de duración (>= 1) |
| `days_of_week` | string | Vigencia semanal (`all`, `weekdays`, `weekend`, `1..7`) |
| `status` | string | `active`, `inactive` |

**Reglas de auditoría de la Tarifa (financieras):**
- R14. `price > 0.00` (invariante monetaria; no se admiten precios 0 o negativos).
- R15. `duration_units >= 1`.
- R16. `modality` y `status` dentro de los vocabularios válidos.
- R17. Una tarifa `inactive` no puede estar referenciada por una `tarifa aplicada` `active`.

### 2.6. Tarifa Aplicada (`/room_tariffs`)

| Campo | Tipo | Rol en auditoría |
| :--- | :--- | :--- |
| `room_id` | string | Habitación destino |
| `rate_id` | string | Tarifa del catálogo |
| `is_default` | bool | Marca la tarifa por defecto de la habitación |
| `status` | string | `active`, `inactive` |

**Reglas de auditoría de la Tarifa Aplicada:**
- R18. Una habitación debe tener **como máximo una** tarifa `is_default = true`.
- R19. Toda `room_tariffs` `active` debe referenciar una tarifa `active` (coherencia catálogo → asignación).
- R20. La habitación debe existir y pertenecer a la sede de la tarifa (coherencia jerárquica).

---

## 3. Matriz de Auditoría Industrial (Físico vs. Sistema)

| Recurso | Estado sistema | Verificación física | Resultado |
| :--- | :--- | :--- | :--- |
| Habitación | `available` | Puerta operativa, limpia, sin huésped | Conforme |
| Habitación | `available` | Huésped presente sin estancia registrada | **No conforme** |
| Habitación | `busy` | Huésped registrado en estancia | Conforme |
| Habitación | `busy` | Sin estancia asociada (ocio con bloqueo) | **No conforme** |
| Habitación | `maintenance` | Señalética/fuera de servicio física | Conforme |
| Cama | `capacity_people = 2` | Conteo físico de plazas = 2 | Conforme |
| Cama | `capacity_people = 2` | Conteo físico = 1 o 3 | **No conforme** |
| Edificio | `active` | Servicios básicos y accesos operativos | Conforme |
| Tarifa aplicada | `is_default = true` | Existe tarifa vigente en catálogo | Conforme |

La matriz debe alimentarse con dos fuentes: (1) evidencia capturada por el auditor en campo y (2) datos vía API GET de cada entidad.

---

## 4. API de Evidencia (Consumo GET existente) y Status Codes

La propuesta reutiliza los endpoints GET ya existentes como **fuente de evidencia** para la auditoría:

| Entidad | Endpoint | Estructura clave | Status codes |
| :--- | :--- | :--- | :--- |
| Edificio | `GET /building` · `GET /building/{id}` | `status`, `headquarters_id` | `200` · `404` · `500` |
| Habitación | `GET /room` · `GET /room/{id}` | `status`, `price_override`, `building_id` | `200` · `404` · `500` |
| Tipo de cama | `GET /types-bed` · `GET /types-bed/{id}` | `capacity_people`, `name` | `200` · `404` · `500` |
| Sede | `GET /headquarters` · `GET /headquarters/{id}` | `status`, `name` | `200` · `404` · `500` |
| Sub Sede | `GET /sub-headquarters` · `GET /sub-headquarters/{id}` · `GET /sub-headquarters/by-headquarter/{id_headquarters}` | `status`, `headquarter_id` | `200` · `404` · `500` |
| Tarifa | `GET /rates` (filtros query) · `GET /rates/{id}` | `price`, `modality`, `status` | `200` · `400` · `404` · `500` |
| Tarifa aplicada | `GET /room_tariffs` · `GET /room_tariffs/{id}` · `GET /room_tariffs/by-room/{room_id}` | `is_default`, `status`, `room_id`, `rate_id` | `200` · `400` · `404` · `500` |

**Filtros de evidencia para auditoría (query parameters):**
- Tarifas: `?headquarter_id=`, `?subheadquarter_id=`, `?room_type_id=`, `?modality=`, `?status=`.
- Tarifas por habitación: `GET /room_tariffs/by-room/{room_id}` (array, tarifa por defecto primero).

---

## 5. Endpoints Propuestos para el Módulo de Auditoría

> Propuesta a implementar siguiendo la arquitectura Vertical Slicing + Onion + SOLID del repositorio.

### 5.1. Resumen

| Método | Ruta | Descripción | Status codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/audit/summary` | Indicadores globales: totales por entidad y por estado | `200` · `500` |
| `GET` | `/audit/rooms` | Inventario de habitaciones con coherencia de estado y tarifa | `200` · `500` |
| `GET` | `/audit/rooms/by-status/{status}` | Habitaciones por estado físico (`busy`, `maintenance`, etc.) | `200` · `400` · `500` |
| `GET` | `/audit/rates` | Tarifas con vigencia y precios para control financiero | `200` · `500` |
| `GET` | `/audit/rooms-without-tariff` | Habitaciones sin tarifa aplicada activa (brecha de cobertura) | `200` · `500` |
| `GET` | `/audit/tariffs-inactive-in-use` | Tarifas inactivas referenciadas por asignaciones activas | `200` · `500` |

### 5.2. Ejemplos de Respuesta

**`GET /audit/summary`**
```json
{
  "edificios": { "total": 3, "active": 3, "inactive": 0 },
  "habitaciones": { "total": 42, "available": 28, "busy": 9, "maintenance": 2, "cleaning": 2, "inactive": 1 },
  "tipos_cama": { "total": 6 },
  "sedes": { "total": 1, "active": 1 },
  "sub_sedes": { "total": 2, "active": 2 },
  "tarifas": { "total": 8, "active": 7, "inactive": 1 },
  "tarifas_aplicadas": { "total": 38, "active": 36, "inactive": 2, "defaults": 38 }
}
```

**`GET /audit/rooms-without-tariff`**
```json
[
  {
    "room_id": "...",
    "number": "105",
    "floor": 1,
    "building_id": "...",
    "status": "available",
    "gap": "sin_tarifa_aplicada_activa"
  }
]
```

---

## 6. KPI de Auditoría e Indicadores

| # | Indicador | Fórmula | Objetivo |
| :--- | :--- | :--- | :--- |
| K1 | Cobertura de tarifas | Habitaciones con tarifa activa / Total habitaciones | ≥ 95 % |
| K2 | Coherencia de estados | Habitaciones físico==sistema / Total | 100 % |
| K3 | Tarifas default duplicadas | Habitaciones con >1 `is_default` / Total | 0 |
| K4 | Brechas financieras | Habitaciones sin precio auditable (override null sin base) | 0 |
| K5 | Tarifas inactivas en uso | Asignaciones activas con tarifa inactiva | 0 |
| K6 | Trazabilidad | % de registros con `created_by` no vacío | 100 % |

---

## 7. Ciclo de Auditoría (Modelo Operativo)

```
1. Base de datos (estado digital) ──► GET endpoints de evidencia
2. Inspección en campo (estado físico) ──► Formato/captura del auditor
3. Cruce de dimensiones ──► Matriz físico vs. sistema (Sección 3)
4. Evaluación de reglas (R1..R20) ──► Convenciones de conformidad
5. Diagnóstico y KPI (Sección 6) ──► Score de la sede
6. Plan de acción (acciones correctivas) ──► Cierre y re-auditoría
```

---

## 8. Rúbrica de Calidad (Ingeniería Industrial + Software)

1. **Trazabilidad total**: toda entidad conserva `created_by`, `created_at` y `updated_at` (auditoría de quién/cuándo).
2. **Invariantes endurecidas**: precios, capacidades y estados validados en el dominio (fail-safe, sin datos ambiguos).
3. **Evidencia API-first**: toda decisión de auditoría es reproducible consultando endpoints GET estandarizados.
4. **Vocabularios cerrados**: los estados (`available`, `busy`, `maintenance`, `cleaning`, `inactive`, `active`) son CHECK constraints en PostgreSQL.
5. **Separación de responsabilidades**: el módulo de auditoría consulta, nunca muta el inventario (principio de auditoría: evidencia independiente del operador).

---

## 9. Prompt Maestro para la Generación del Módulo de Auditoría

Para ejecutar la implementación del módulo propuesto con un agente de IA o desarrollador, utiliza el siguiente prompt:

```text
Actúa como ingeniero de software e industrial experto en Go (Golang) y arquitectura de software.
Implementa el módulo de lectura "Auditoría Hotelera" en el proyecto "nexora-api-rest", siguiendo la arquitectura Vertical Slicing + Onion + SOLID del repositorio.

Contexto: el módulo SOLO LEE (nunca escribe) las entidades existentes — edificios(/building), habitaciones(/room), tipos de cama(/types-bed), sedes(/headquarters), sub sedes(/sub-headquarters), tarifas(/rates), tarifas aplicadas(/room_tariffs) — y expone indicadores y brechas de auditoría.

Endpoints a crear (GET, sin cuerpo):
1. GET /audit/summary          -> totales por entidad y por estado.
2. GET /audit/rooms             -> inventario de habitaciones con su estado y tarifa aplicada.
3. GET /audit/rooms/by-status/{status} -> habitaciones filtradas por estado (available, busy, maintenance, cleaning, inactive).
4. GET /audit/rates             -> tarifas del catálogo con precio, modalidad y vigencia.
5. GET /audit/rooms-without-tariff -> habitaciones sin tarifa aplicada activa.
6. GET /audit/tariffs-inactive-in-use -> tarifas inactivas referenciadas por asignaciones activas.

Reglas de negocio a implementar:
- R18: como máximo una tarifa is_default=true por habitación.
- R19: una room_tariffs activa debe referenciar una tarifa activa.
- R20: coherencia entre la habitación (edificio -> sede) y la tarifa.
- No duplicar lógica: reutiliza los repositories existentes (BuildingRepository, RoomRepository, RateRepository, RoomTariffRepository, etc.) a través de un AuditRepository que los componga.

Estructura de archivos:
1. internal/domain/audit_repository.go      -> interfaz de consultas de auditoría.
2. internal/application/audit/              -> ports.go + use cases (SummaryUseCase, RoomsUseCase, RoomsByStatusUseCase, RatesUseCase, RoomsWithoutTariffUseCase, InactiveTariffsInUseUseCase).
3. internal/infrastructure/persistence/postgres/audit_repository.go -> implementación con *pgxpool.Pool usando los repositorios existentes y JOINs de solo lectura.
4. internal/api/audit/                      -> handler.go + un archivo por endpoint (solo net/http + internal/api/httpjson).

Restricciones:
- Go idiomático y estándar. Sin frameworks externos.
- El módulo es de solo lectura: sin Save/Update/Delete/EnsureTable.
- Código compila con "go build ./..." y pasa "go vet ./..." y "go test ./...".
- Registro de rutas en internal/api/router.go con el prefijo /audit.
```

---

*Documento de propuesta — sujeto a revisión del equipo de arquitectura.*