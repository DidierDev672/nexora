# Prompt: Tabla Interactiva de Reservas de Hoy con Inspección Rápida de Sede/Sub-Sedes y Habitación/Camas

## Registro del Prompt Optimizado

```text
@[src/features/dashboard/ui/organisms/recent-reservations.tsx]
@[src/features/dashboard/domain/dashboard-types.ts]
@[src/features/dashboard/application/use-today-reservations.ts]
@[src/features/dashboard/infrastructure/api-dashboard-repository.ts]
@[src/features/recepciones/ui/molecules/sede-detalle-modal.tsx]
@[src/features/recepciones/ui/molecules/habitacion-detalle-modal.tsx]
@[src/features/recepciones/application/use-sede-detalle.ts]
@[src/features/recepciones/application/use-habitacion-detalle.ts]

Transforma la tabla de "Reservas de hoy" en el Dashboard en una interfaz completamente interactiva, explorable y resiliente mediante modales de inspección contextual (drill-down sin recarga ni pérdida de foco), cumpliendo estrictamente con la orquestación de endpoints, validación de HTTP status codes y bloques try/catch en todas las capas del sistema.

### 1. Interacción y Navegación Contextual (UI/UX)
1. Ítem "Sede":
   - Convierte la celda de la Sede en un elemento interactivo con accesibilidad total (botón semántico, icono BuildingIcon, cursor pointer, foco visible y micro-interacción al hacer hover/active).
   - Al hacer clic en la Sede, abre un modal de inspección detallada (@[src/features/recepciones/ui/molecules/sede-detalle-modal.tsx]) pasando el `headquarterId` (o `sedeId`) de la reserva.
   - Contenido del Modal de Sede:
     * Datos generales de la Sede: Nombre, ciudad, dirección, teléfono y estado operativo.
     * Listado de Sub-Sedes vinculadas: Nombre de la subsede, dirección, teléfono y estado. Si no posee subsedes, mostrar mensaje amigable indicando que opera como punto central único.
     * Edificios y torres asociados a la sede (nombre, pisos y estado).

2. Ítem "Habitación":
   - Convierte la celda de la Habitación en un elemento interactivo con badge estilizado, icono BedIcon, hover sutil y tooltip contextual ("Haz clic para ver camas y confort").
   - Al hacer clic en la Habitación, abre un modal de inspección detallada (@[src/features/recepciones/ui/molecules/habitacion-detalle-modal.tsx]) pasando el `roomId` (y `camaId` si está vinculado).
   - Contenido del Modal de Habitación:
     * Ficha de la habitación: Nombre/número, piso, capacidad de personas y tarifa por noche.
     * Inventario de Camas Físicas instaladas: Etiqueta de cama (ej. "Cama 01", "Cama 02"), estado de disponibilidad y capacidad total.
     * Desglose de Tipos de Cama y Confort asignados: Nombre del tipo de cama (ej. "King Size", "Queen", "Doble Confort", "Individual"), personas permitidas y descripción técnica.

3. Card "Habitación" en el Modal "Detalle de la reserva":
   - En la card "Habitación" del modal general de reserva, incluye un botón interactivo con icono de flecha (`ChevronRightIcon`) titulado *"Ver detalle"*.
   - Al hacer clic, invoca `HabitacionDetalleModal` en una capa superior (`z-[60]`) para consultar la ficha técnica de la habitación y el tipo de confort de cama sin cerrar el modal de reserva en curso.

4. Animaciones y Experiencia de Usuario (src/agent.md):
   - Modales: Entrada y salida suaves mediante AnimatePresence con variante `fadeUp` (opacity: 0 -> 1, y: 16 -> 0, duration: 0.35s, ease: 'easeOut').
   - Backdrop con difuminado suave (`backdrop-blur-xs` y `bg-black/60`).
   - Cierre fluido con botón accesible, clic en el backdrop o pulsación de la tecla `Escape`.
   - Preservación de estado: Apertura y cierre de modales no reinician el scroll infinito (`InfiniteScroll.tsx`) ni la búsqueda en vivo.

---

### 2. Orquestación de Endpoints del Proyecto, Status Codes HTTP y Manejo de Excepciones (Infraestructura)
Implementa la orquestación resiliente de peticiones en los repositorios de infraestructura. Cada llamada a la API debe estar obligatoriamente encapsulada en bloques `try / catch`, validando los códigos de estado HTTP y lanzando excepciones tipadas del dominio con su respectivo `statusCode`:

1. Reservas de Hoy: GET /reserve
   - Éxito: 200 OK ➔ Devuelve ReservaBackendResponse[] o { data: ReservaBackendResponse[] }.
   - Errores contemplados:
     * 400 Bad Request: Lanza DashboardApiError(400, "Error en los parámetros de consulta de reservas").
     * 401 Unauthorized: Lanza DashboardApiError(401, "Sesión expirada o token no autorizado").
     * 404 Not Found: Lanza DashboardApiError(404, "Servicio de reservas no localizado").
     * 500 Internal Server Error: Lanza DashboardApiError(500, "Falla interna en la base de datos de reservas").
     * Código 0 / Network Error: Lanza DashboardApiError(0, "Falla de conectividad con el servidor de reservas").

2. Ficha de Habitación: GET /rooms/{id} (Fallback: GET /room/{id})
   - Éxito: 200 OK ➔ Devuelve RoomBackendResponse con datos del piso, capacidad y sede.
   - Errores contemplados:
     * 400 Bad Request: ID de habitación inválido.
     * 404 Not Found: Habitación inexistente ➔ Lanza HabitacionApiError(404, "Habitación no encontrada").
     * 500 Internal Server Error ➔ Lanza HabitacionApiError(500, "Error al consultar la habitación").
     * Código 0 / Network Error ➔ Lanza HabitacionApiError(0, "Sin conexión para obtener la habitación").

3. Sede Principal: GET /headquarters/{id} (Fallback: GET /headquarter/{id})
   - Éxito: 200 OK ➔ Devuelve HeadquarterBackendResponse.
   - Errores contemplados:
     * 404 Not Found: Sede no registrada ➔ Lanza SedeApiError(404, "Sede no encontrada").
     * 500 Internal Server Error ➔ Lanza SedeApiError(500, "Error del servidor al obtener la sede").
     * Código 0 / Network Error ➔ Lanza SedeApiError(0, "Sin conexión con la sede central").

4. Sub-Sedes Vinculadas: GET /sub-headquarters/by-headquarter/{headquarter_id}
   - Éxito: 200 OK ➔ Devuelve ApiSubHeadquarter[].
   - Errores y Casos Edge:
     * 404 Not Found / 400 Bad Request: Sede sin subsedes asociadas ➔ Retornar arreglo vacío `[]` de forma controlada sin quebrar la visualización del modal.
     * 500 Internal Server Error: Registrar advertencia interna y retornar `[]` para permitir ver la sede principal.

5. Edificios y Torres: GET /building (o GET /buildings)
   - Éxito: 200 OK ➔ Devuelve ApiBuilding[]. Filtrar en cliente por `building.headquarter_id === headquarterId`.
   - Errores:
     * 404 Not Found / 500 Internal Server Error ➔ Retornar `[]` seguro sin romper el modal de sede.

6. Camas de la Habitación: GET /beds
   - Éxito: 200 OK ➔ Devuelve BedApiResponse[]. Filtrar por `bed.room_id === roomId`.
   - Errores:
     * 404 Not Found: No hay camas configuradas ➔ Retornar `[]`.
     * 500 Internal Server Error ➔ Lanza CamaApiError(500, "Error al consultar el inventario de camas").

7. Tipos de Cama y Confort: GET /types-bed
   - Éxito: 200 OK ➔ Devuelve TipoCamaApiResponse[] con nombres, capacidades y descripciones de descanso.
   - Errores:
     * 500 Internal Server Error o Código 0 ➔ Lanza TipoCamaApiError o utiliza fallback seguro de catálogo local.

8. Huésped / Persona: GET /persons/{id} (Fallback: GET /person/{id})
   - Éxito: 200 OK ➔ Devuelve PersonBackendResponse con documento, teléfono y correo.
   - Errores:
     * 404 Not Found ➔ Retornar objeto seguro de fallback con nombre genérico sin lanzar excepción fatal.

---

### 3. Reglas Obligatorias de Try / Catch y Manejo de Excepciones

1. Patrón en Repositorios de Infraestructura:
   - Toda llamada con `api.get()` debe capturar errores verificando `axios.isAxiosError(error)`.
   - Extraer obligatoriamente `statusCode`: `const status = error.response?.status ?? 0`.
   - Extraer mensaje del servidor: `error.response?.data?.message || error.response?.data?.error || error.message`.
   - Lanzar la excepción tipada correspondiente (`DashboardApiError`, `SedeApiError`, `HabitacionApiError`).

   ```typescript
   try {
     const response = await api.get<T>(url, {
       validateStatus: (status) => status >= 200 && status < 300,
     })
     return response.data
   } catch (error: unknown) {
     if (axios.isAxiosError(error)) {
       const statusCode = error.response?.status ?? 0
       const message = error.response?.data?.message || error.message
       throw new DashboardApiError(statusCode, message)
     }
     throw new DashboardApiError(undefined, error instanceof Error ? error.message : 'Error desconocido')
   }
   ```

2. Patrón en Hooks de Aplicación (`useTodayReservations`, `useSedeDetalle`, `useHabitacionDetalle`):
   - Los hooks NUNCA deben dejar propagar errores no controlados que provoquen pantalla blanca (*crash* de React).
   - Deben capturar la excepción y desglosar el `statusCode`:
     * Si `statusCode === 400`: Activar bandera específica `is400Error = true` y mensaje psicológico empático.
     * Si `statusCode === 404`: Indicar que el recurso solicitado ya no existe en el catálogo.
     * Si `statusCode === 500`: Mensaje tranquilizador: "El servidor de tu red hotelera está procesando solicitudes pendientes; tus datos no se han perdido".
     * Si `statusCode === 0` (Red/Timeout): Mensaje de desconexión transitoria invitando al reintento o carga de datos demo.
```

---

## 1. Fundamentos Técnicos y Filosofía de Diseño

### 1.1. Arquitectura Hexagonal y Vertical Slicing
El proyecto organiza las funcionalidades en módulos verticales independientes:
- **`src/features/dashboard/`**:
  - `domain/dashboard-types.ts`: Define las entidades del dashboard (`DashboardReservationItem`) enriquecidas con `headquarterId` y `roomId`, además de la clase de error `DashboardApiError`.
  - `application/use-today-reservations.ts`: Orquesta el listado, paginación con Infinite Scroll, búsqueda en vivo y simulación de estados de error (ej. error 400).
  - `infrastructure/api-dashboard-repository.ts`: Resuelve la hidratación en paralelo contra `/reserve`, `/room/{id}`, `/headquarter/{id}` y `/person/{id}` con caché en memoria y `try / catch` estricto.
  - `ui/organisms/recent-reservations.tsx`: Componente visual que renderiza la tabla interactiva y orquesta los estados de apertura de los modales.

### 1.2. Reutilización de Moléculas Existentes
Para evitar duplicación de código y garantizar consistencia visual en la plataforma, la propuesta aprovecha y desacopla las moléculas de inspección ya testeadas en la sección de recepciones:
- `src/features/recepciones/ui/molecules/sede-detalle-modal.tsx` (consumidor de `useSedeDetalle`)
- `src/features/recepciones/ui/molecules/habitacion-detalle-modal.tsx` (consumidor de `useHabitacionDetalle`)

Ambos componentes pueden importarse directamente o promoverse a `src/shared/ui/modals/` si se desea un nivel máximo de neutralidad de feature.

### 1.3. Psicología del Usuario y Micro-interacciones
- **Affordance visual clara**: Las celdas interactivas no parecen texto estático; tienen indicadores visuales (fondo sutil en hover, bordes redondeados, cambios de color en iconos y cursor pointer) que indican que son accionables sin navegar fuera de la página.
- **Sin pérdida de contexto**: El recepcionista o administrador no pierde el foco de la jornada de reservas; los modales actúan como una capa de consulta rápida (*peek & inspect*).
- **Tranquilidad cognitiva (Heurística del Temor)**: La inspección no realiza mutaciones de datos ni reasigna reservas accidentalmente; es 100% de solo lectura segura.

---

## 2. Matriz de Errores y Códigos de Estado HTTP (Status Codes)

La siguiente matriz estandariza la respuesta del sistema ante cualquier contingencia de red o API en la tabla interactiva de reservas:

| Código HTTP | Escenario Técnico | Excepción Tipada | Comportamiento UI y Psicología Positiva |
| :---: | :--- | :--- | :--- |
| **`200 OK`** | Respuesta exitosa con datos completos. | Ninguna | Muestra datos en tiempo real con animación fluida `fadeIn` / `fadeUp`. |
| **`400 Bad Request`** | Petición malformada o parámetro de fecha/id inválido. | `DashboardApiError(400)` | Activa `PsychologicalErrorState`: *"Tus reservas están a salvo, solo necesitamos sincronizarlas. No hiciste nada mal y la información sigue intacta."* |
| **`401 Unauthorized`** | Token JWT ausente o expirado. | `DashboardApiError(401)` | Redirección o aviso suave de reautenticación sin pérdida del estado visual en curso. |
| **`403 Forbidden`** | El rol actual no tiene permisos sobre esa sede o habitación. | `DashboardApiError(403)` | Muestra aviso amigable de permisos insuficientes invitando a contactar al administrador. |
| **`404 Not Found`** | ID de habitación, sede o reserva no encontrado en el servidor. | `HabitacionApiError(404)` / `SedeApiError(404)` | **Fallback resiliente**: El modal informa que el elemento no está disponible sin cerrar abruptamente la vista. |
| **`409 Conflict`** | Conflicto en asignación de habitación o cama en las fechas. | `DashboardApiError(409)` | Muestra advertencia no alarmista señalando la superposición de fechas. |
| **`500 Internal Error`** | Excepción no controlada en base de datos del backend. | `DashboardApiError(500)` | Ofrece botón de reintento inmediato y acceso a **Modo Demo** para continuar navegando la interfaz. |
| **`Código 0 (Red/Offline)`** | Falla de conexión, timeout o servidor apagado localmente. | `DashboardApiError(0)` | Notificación sutil con opción de reintentar la conexión cuando la red se restablezca. |

---

## 3. Diagnóstico del Estado Actual vs. Propuesta Mejorada

| Aspecto | Estado Actual | Propuesta Interactiva |
| :--- | :--- | :--- |
| **Columna Sede** | Celda con badge pasivo `<span>` que solo muestra el nombre textual de la sede. | Botón interactivo accesible con icono `<BuildingIcon />`. Al hacer clic, abre `SedeDetalleModal` con sub-sedes, direcciones, teléfonos y edificios asociados. |
| **Columna Habitación** | Celda con texto plano y un `<BedIcon />` no interactivo. | Botón interactivo con hover destacado y tooltip. Al hacer clic, abre `HabitacionDetalleModal` con ficha técnica, inventario de camas y tipos de confort asignados. |
| **Columna Acción** | Solo el botón "Detalles" al final de la fila permite abrir el modal genérico de reserva. | El usuario cuenta con 3 puntos de acceso contextuales: Sede (drill-down geográfico), Habitación (drill-down físico/confort) y Acción (reserva financiera/huésped). |
| **Manejo de Errores** | Básico o no tipado ante errores de sub-recursos. | Repositorio con captura estricta de `statusCode`, validación con `isAxiosError` y estados de fallback empáticos en modales. |
| **Accesibilidad** | Solo la fila y el botón de acción tienen interacción. | Celdas con atributos `role="button"`, `tabIndex={0}`, etiquetas `aria-label` descriptivas y soporte completo para teclado (`Enter` y `Espacio`). |

---

## 4. Especificación Detallada de los Modales de Inspección

### 4.1. Modal de Sede y Sub-Sedes (`SedeDetalleModal`)
- **Hook de soporte**: `useSedeDetalle(sedeId)`
- **Endpoints orquestados**:
  1. `GET /headquarters/{id}`: Nombre de sede, ciudad, dirección, teléfono, estado.
  2. `GET /sub-headquarters/by-headquarter/{headquarter_id}`: Sub-sedes vinculadas (si responde 404, devuelve `[]` seguro).
  3. `GET /building`: Edificios de la sede (si responde 404 o 500, devuelve `[]` seguro).
- **Manejo de Status Codes**:
  - En caso de error 404 o 500 al consultar sub-sedes, no se aborta la visualización de la sede principal; se presenta el mensaje de punto único.
  - En caso de error fatal al cargar la sede principal, se muestra tarjeta con `border-danger/25` y botón de reintento.

### 4.2. Modal de Habitación y Confort de Camas (`HabitacionDetalleModal`)
- **Hook de soporte**: `useHabitacionDetalle(roomId)`
- **Endpoints orquestados**:
  1. `GET /rooms/{id}`: Ficha de habitación, número, piso, capacidad y precio.
  2. `GET /beds`: Camas filtradas por `room_id`.
  3. `GET /types-bed`: Catálogo de confort asignado (`types_bed_id`).
- **Manejo de Status Codes**:
  - Si `GET /beds` responde vacío o 404: Se renderiza mensaje informativo *"No se han registrado camas físicas para esta habitación todavía"* sin fallar.
  - Si `GET /types-bed` falla con 500: Se mantiene la etiqueta física de la cama (`cama.etiquette`) y se oculta la sección técnica de colchón de forma segura.

---

## 5. Guía de Modificación de Código (Implementación)

### 5.1. Definición de Errores Tipados de Dominio

En `src/features/dashboard/domain/dashboard-types.ts`:
```typescript
/**
 * Excepción de Dominio para operaciones de la API del Dashboard.
 * Preserva el código de estado HTTP para toma de decisiones resilientes en la UI.
 */
export class DashboardApiError extends Error {
  readonly statusCode?: number
  readonly originalError?: unknown

  constructor(statusCode?: number, message?: string, originalError?: unknown) {
    super(message || `Error en el servicio de reservas (código ${statusCode ?? 'red'})`)
    this.name = 'DashboardApiError'
    this.statusCode = statusCode
    this.originalError = originalError
  }

  get isClientError(): boolean {
    return typeof this.statusCode === 'number' && this.statusCode >= 400 && this.statusCode < 500
  }

  get isServerError(): boolean {
    return typeof this.statusCode === 'number' && this.statusCode >= 500
  }

  get isNetworkError(): boolean {
    return !this.statusCode || this.statusCode === 0
  }
}
```

---

### 5.2. Implementación de Try / Catch en `ApiDashboardRepository`

En `src/features/dashboard/infrastructure/api-dashboard-repository.ts`:
```typescript
import axios from 'axios'
import { api } from '../../../lib/api'
import { DashboardApiError, computeHoraFromDate } from '../domain/dashboard-types'

export class ApiDashboardRepository {
  async getTodayReservations(): Promise<DashboardReservationItem[]> {
    let rawReservations: ReservaBackendResponse[] = []

    try {
      const response = await api.get<ReservaBackendResponse[] | { data?: ReservaBackendResponse[] }>('/reserve', {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      if (Array.isArray(response.data)) {
        rawReservations = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        rawReservations = response.data.data
      } else {
        rawReservations = []
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const statusCode = err.response?.status ?? 0
        const serverMessage = err.response?.data?.message || err.message

        if (statusCode === 400) {
          throw new DashboardApiError(400, 'Error 400: Parámetros inválidos en la consulta de reservas.', err)
        }
        if (statusCode === 401) {
          throw new DashboardApiError(401, 'Error 401: Sesión no autorizada o token expirado.', err)
        }
        if (statusCode === 404) {
          throw new DashboardApiError(404, 'Error 404: Endpoint /reserve no encontrado en el servidor.', err)
        }
        if (statusCode >= 500) {
          throw new DashboardApiError(statusCode, `Error ${statusCode}: Falla interna del servidor de reservas.`, err)
        }
        throw new DashboardApiError(statusCode, serverMessage, err)
      }
      throw new DashboardApiError(undefined, err instanceof Error ? err.message : 'Error inesperado de red', err)
    }

    if (!rawReservations || rawReservations.length === 0) {
      return []
    }

    // Hidratación en paralelo con try / catch individual para evitar que el fallo de un sub-recurso rompa toda la tabla
    const hydratedList = await Promise.all(
      rawReservations.map(async (reserva): Promise<DashboardReservationItem> => {
        try {
          const [room, person] = await Promise.all([
            this.getRoomSafe(reserva.room_id),
            this.getPersonSafe(reserva.person_id),
          ])

          const headquarterId = room.headquarter_id || room.building_id || ''
          const headquarter = await this.getHeadquarterSafe(headquarterId)

          return {
            id: reserva.id,
            roomId: reserva.room_id,
            personId: reserva.person_id,
            headquarterId: headquarter.id || headquarterId,
            guestName: person.name || `Huésped #${reserva.person_id.slice(0, 6)}`,
            guestDocument: person.document_number,
            guestPhone: person.phone_number,
            guestEmail: person.email,
            roomName: room.name || `Habitación #${reserva.room_id.slice(0, 6)}`,
            roomDescription: room.description,
            roomStatus: room.status,
            sede: headquarter.name || 'Sede Central',
            sedeAddress: headquarter.address,
            sedeCity: headquarter.city,
            estado: 'reserve',
            hora: computeHoraFromDate(reserva.check_in_date),
            checkInDate: reserva.check_in_date,
            checkOutDate: reserva.check_out_date,
            numberOfGuests: reserva.number_of_guests,
            totalPrice: reserva.total_price,
            createdBy: reserva.created_by,
          }
        } catch {
          // Fallback resiliente por fila individual si falla la resolución de entidades relacionadas
          return {
            id: reserva.id,
            roomId: reserva.room_id,
            personId: reserva.person_id,
            guestName: `Huésped #${reserva.person_id.slice(0, 6)}`,
            roomName: `Habitación #${reserva.room_id.slice(0, 6)}`,
            sede: 'Sede Asignada',
            estado: 'reserve',
            hora: computeHoraFromDate(reserva.check_in_date),
          }
        }
      }),
    )

    return hydratedList
  }

  private async getRoomSafe(id: string): Promise<RoomBackendResponse> {
    try {
      const res = await api.get<RoomBackendResponse | { data?: RoomBackendResponse }>(`/rooms/${id}`)
      return 'data' in res.data && res.data.data ? res.data.data : (res.data as RoomBackendResponse)
    } catch {
      try {
        const fallbackRes = await api.get<RoomBackendResponse | { data?: RoomBackendResponse }>(`/room/${id}`)
        return 'data' in fallbackRes.data && fallbackRes.data.data ? fallbackRes.data.data : (fallbackRes.data as RoomBackendResponse)
      } catch {
        return { id, name: `Habitación ${id.slice(0, 6)}` }
      }
    }
  }

  private async getHeadquarterSafe(id: string): Promise<HeadquarterBackendResponse> {
    try {
      const res = await api.get<HeadquarterBackendResponse | { data?: HeadquarterBackendResponse }>(`/headquarters/${id}`)
      return 'data' in res.data && res.data.data ? res.data.data : (res.data as HeadquarterBackendResponse)
    } catch {
      try {
        const fallbackRes = await api.get<HeadquarterBackendResponse | { data?: HeadquarterBackendResponse }>(`/headquarter/${id}`)
        return 'data' in fallbackRes.data && fallbackRes.data.data ? fallbackRes.data.data : (fallbackRes.data as HeadquarterBackendResponse)
      } catch {
        return { id, name: 'Sede Principal' }
      }
    }
  }

  private async getPersonSafe(id: string): Promise<PersonBackendResponse> {
    try {
      const res = await api.get<PersonBackendResponse | { data?: PersonBackendResponse }>(`/persons/${id}`)
      return 'data' in res.data && res.data.data ? res.data.data : (res.data as PersonBackendResponse)
    } catch {
      try {
        const fallbackRes = await api.get<PersonBackendResponse | { data?: PersonBackendResponse }>(`/person/${id}`)
        return 'data' in fallbackRes.data && fallbackRes.data.data ? fallbackRes.data.data : (fallbackRes.data as PersonBackendResponse)
      } catch {
        return { id, name: `Huésped ${id.slice(0, 6)}` }
      }
    }
  }
}
```

---

### 5.3. Modificación Visual en `recent-reservations.tsx`

#### A. Importaciones de Modales
```tsx
import { SedeDetalleModal } from '../../../recepciones/ui/molecules/sede-detalle-modal'
import { HabitacionDetalleModal } from '../../../recepciones/ui/molecules/habitacion-detalle-modal'
```

#### B. Estados de Inspección
```tsx
// Estados para modales contextuales de inspección rápida
const [inspectSedeId, setInspectSedeId] = useState<string | null>(null)
const [inspectRoomId, setInspectRoomId] = useState<string | null>(null)
const [inspectCamaId, setInspectCamaId] = useState<string | null>(null)
```

#### C. Celda de Habitación Interactiva
```tsx
{/* Habitación -> Clicable para abrir inspección de habitación y camas */}
<td className="px-4 py-3.5 whitespace-nowrap">
  <button
    type="button"
    onClick={() => {
      setInspectRoomId(item.roomId)
      setInspectCamaId(null)
    }}
    aria-label={`Ver detalles de la habitación ${item.roomName} y sus camas`}
    title="Haz clic para inspeccionar camas y tipos de confort de esta habitación"
    className="group/room inline-flex items-center gap-2 rounded-lg px-2 py-1 text-left transition-all hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
  >
    <span className="grid size-7 place-items-center rounded-md bg-canvas/80 text-primary transition-colors group-hover/room:bg-primary group-hover/room:text-white">
      <BedIcon className="size-4 shrink-0" />
    </span>
    <div>
      <span className="block font-medium text-ink transition-colors group-hover/room:text-primary">
        {item.roomName}
      </span>
      <span className="block text-[10px] text-ink-muted group-hover/room:text-primary/80">
        Ver camas y confort ➔
      </span>
    </div>
  </button>
</td>
```

#### D. Celda de Sede Interactiva
```tsx
{/* SEDE -> Clicable para abrir inspección de sede y sub-sedes */}
<td className="px-4 py-3.5 whitespace-nowrap">
  <button
    type="button"
    onClick={() => setInspectSedeId(item.headquarterId || null)}
    aria-label={`Ver información de la sede ${item.sede} y sus subsedes`}
    title="Haz clic para consultar detalles de la sede, subsedes y edificios"
    className="group/sede inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/70 px-2.5 py-1 text-xs font-medium text-ink transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
  >
    <BuildingIcon className="size-3.5 text-secondary shrink-0 transition-transform group-hover/sede:scale-110" />
    <span className="font-semibold">{item.sede}</span>
    <span className="text-[10px] text-ink-muted group-hover/sede:text-primary">🔍</span>
  </button>
</td>
```

#### E. Renderizado de Modales al Pie de la Sección
```tsx
{/* Modal Interactivo de Inspección de Sede (Sub-sedes y Edificios) */}
<SedeDetalleModal
  sedeId={inspectSedeId}
  onClose={() => setInspectSedeId(null)}
/>

{/* Modal Interactivo de Inspección de Habitación (Camas y Tipos de Cama) */}
<HabitacionDetalleModal
  roomId={inspectRoomId}
  camaId={inspectCamaId}
  onClose={() => {
    setInspectRoomId(null)
    setInspectCamaId(null)
  }}
/>
```

---

## 6. Garantía de Calidad y Criterios de Aceptación

- [ ] **Manejo Estricto de Status Codes**: Cada petición valida códigos 200, 400, 401, 404 y 500, lanzando excepciones tipadas y permitiendo estados de recuperación o fallback seguro.
- [ ] **Encapsulación con Try / Catch**: Ningún error de red en sub-recursos (como una subsede inexistente o falla en catálogo de camas) provoca la caída de la tabla de reservas de hoy.
- [ ] **Interacción en Sede**: Al hacer clic en cualquier sede, se abre `SedeDetalleModal` mostrando datos generales, sub-sedes vinculadas y edificios.
- [ ] **Interacción en Habitación**: Al hacer clic en cualquier habitación, se abre `HabitacionDetalleModal` mostrando ficha técnica, camas instaladas y desglose de tipo de cama.
- [ ] **Accesibilidad y Atajos**: Presionar `Escape` o hacer clic en el backdrop cierra los modales sin alterar el scroll infinito ni la búsqueda activa.
- [ ] **Consistencia en Animaciones**: Se respetan las variantes `fadeUp` para modales y `fadeIn` para la tabla y cards de acuerdo a `src/agent.md`.
