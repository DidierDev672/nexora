# Prompt: Formulario de Reserva Interactiva con Barra de Navegación 3D, Sistema Drag & Drop, Zona de Soltado y Gestión Resiliente de Status Codes

## Registro del Prompt Optimizado

```text
@[src/features/reservas/ui/reservas-page.tsx]
@[src/features/reservas/domain/reserva.ts]
@[src/features/reservas/domain/reserva-repository.ts]
@[src/features/reservas/application/use-reserva-form.ts]
@[src/features/reservas/application/use-client-session.ts]
@[src/features/reservas/application/use-interactive-beds.ts]
@[src/features/reservas/infrastructure/api-reserva-repository.ts]
@[src/features/reservas/ui/molecules/bed-drop-zone.tsx]
@[src/features/reservas/ui/molecules/bed-3d-dock-bar.tsx]
@[src/features/reservas/ui/molecules/client-session-card.tsx]
@[src/features/reservas/ui/molecules/stay-date-picker.tsx]
@[src/features/reservas/ui/molecules/reserva-summary-card.tsx]
@[src/features/reservas/ui/organisms/reserva-interactive-form.tsx]
@[src/features/cama3d/ui/organisms/escena-tipo-cama.tsx]
@[src/shared/auth-storage.ts]

Rediseña integralmente el módulo de reservas en Nexora (@[src/features/reservas/ui/reservas-page.tsx]) bajo la arquitectura Vertical Slicing * Onion (Hexagonal) + Atomic Design, descartando por completo los selectores tipo dropdown convencionales para las camas y sustituyéndolos por una barra de navegación con camas en 3D interactiva con sistema de Drag & Drop, junto con una zona de soltado guiada en el formulario y un manejo estricto de códigos de estado HTTP y bloques try/catch:

### 1. Detección y Presentación de la Información del Cliente en Sesión
- Detecta automáticamente el cliente autenticado desde el almacenamiento local (@[src/shared/auth-storage.ts]) y vincula su perfil:
  * Extrae email, nombre (o usuario) y token activo mediante `readTokenEmail()`, `readAuthTokenEmail()` o `auth_user`.
  * Resuelve contra /persons el registro correspondiente o presenta la ficha del cliente en una molécula destacada (`ClientSessionCard`).
  * Muestra al cliente un bloque visual con avatar, nombre, correo electrónico y chip de "Sesión Activa - Titular de la Reserva".
  * Elimina la necesidad de que el cliente busque manualmente su propio nombre en dropdowns genéricos, agilizando el flujo con soberanía y privacidad.

### 2. Barra de Navegación con Camas en 3D (`Bed3DDockBar`) y Drag & Drop
- Sustituye todo dropdown de camas por una barra superior/inferior de navegación dock interactiva:
  * Efecto Dock Magnification con Framer Motion (`motion/react`): al deslizar el cursor sobre la barra, las tarjetas de cama escalan fluidamente mediante `useMotionValue`, `useTransform` y física elástica con `useSpring`.
  * Visualización 3D: cada elemento de la barra presenta un canvas interactivo o viewport 3D (@[src/features/cama3d/ui/organisms/escena-tipo-cama.tsx]) renderizando la cama (o sofá/cama doble) con iluminación, sombras y rotación suave.
  * Tarjeta Arrastrable (`Bed3DDraggableCard`): cada cama posee atributos HTML5 Drag & Drop (`draggable={true}`) o arrastre táctil/físico, emitiendo en `onDragStart` la metadata enriquecida (`bedId`, `roomId`, `roomName`, `etiquette`, `capacity`, `price`, `typeName`).
  * Micro-interacción: cursor tipo `grab` / `grabbing`, feedback de escala y resplandor al arrastrar.

### 3. Zona Dedicada de Soltado en el Formulario (`BedDropZone`)
- Incorpora una sección destacada en el formulario que indica con absoluta claridad al usuario dónde debe soltar la cama:
  * Estado 1: En espera (Idle) -> Contenedor con borde discontinuo (`border-2 border-dashed border-line`), icono flotante de cama con flecha animada y copywriting invitador: *"Arrastra y suelta aquí tu cama 3D favorita desde la barra para asignarla a tu reserva"*.
  * Estado 2: Sobrevolando (DragOver / Active) -> Al arrastrar una cama sobre el área, la zona reacciona con iluminación perimetral (`border-primary ring-4 ring-primary/20 scale-[1.01] bg-primary/5`), invitando a soltar: *"¡Suelta la cama aquí para fijarla!"*.
  * Estado 3: Cama Asignada (Slotted) -> Al soltar (`onDrop`), la zona se transforma mostrando la escena 3D en vivo de la cama elegida, nombre de la habitación, piso, etiqueta física (ej. "Cama 01"), capacidad máxima, tarifa por noche en COP y botón accesible *"Cambiar o retirar cama"*.
  * Sincronización automática inmediata: se actualizan en el estado del formulario `bedId`, `roomId`, `totalPrice` sugerido y el límite máximo del stepper de huéspedes.

### 4. Registro de Estadía y Aforo (Fechas y Huéspedes)
- Registro de Entrada (`checkInDate`) y Salida (`checkOutDate`):
  * Selector accesible con validación en tiempo real.
  * Fecha mínima de entrada: Hoy (impide reservas retroactivas).
  * Fecha mínima de salida: Día posterior a la entrada seleccionada.
  * Contador dinámico de noches calculado automáticamente con badge informativo (`NightBadge`, ej. "3 noches").
- Control de Huéspedes (`GuestStepper`):
  * Stepper numérico (+) y (-) acotado rígidamente por la capacidad física de la cama 3D soltada (`maxGuests`).
  * Si el usuario no ha soltado una cama, el stepper le recuerda amablemente soltar una cama en la zona para habilitar el aforo correspondiente.
- Cálculo de Tarifa en Vivo:
  * Multiplica la tarifa por noche de la habitación por la cantidad de noches seleccionadas, formateada en COP (`formatPrecioCOP`).

### 5. Resumen Dinámico en Tiempo Real (`ReservaSummaryCard`)
- Tarjeta lateral fija (sticky) que desglosa en tiempo real:
  * Huésped titular de la sesión activa.
  * Cama 3D asignada y habitación.
  * Fechas de entrada y salida con total de noches.
  * Huéspedes confirmados.
  * Desglose financiero transparente (Tarifa base x Noches = Total en COP).
  * Botón de acción con spinner y garantía ética de confirmación.

### 6. Matriz Rigurosa de Status Codes HTTP y Arquitectura de `try / catch`
- Aplica manejo exhaustivo de códigos HTTP y bloques `try / catch` en el repositorio (`ApiReservaRepository`) y en los hooks de aplicación:
  * `200 OK`: Catálogo de camas, habitaciones y personas recuperados con éxito.
  * `201 Created`: Reserva persistida satisfactoriamente en backend.
  * `400 Bad Request`: Captura de errores de formato en fechas o aforo; notificación empática y corrección sin pérdida de datos.
  * `401 Unauthorized`: Token expirado; redirección guiada o reautenticación sin bloquear el estado local.
  * `403 Forbidden`: Permisos insuficientes; mensaje explicativo al usuario.
  * `404 Not Found`: Habitación o cama dada de baja; fallback resiliente en caché o notificación sin colapsar la vista.
  * `409 Conflict`: Cama reservada concurrentemente por otro cliente en esas fechas; alerta inmediata para que el usuario arrastre otra cama de la barra 3D.
  * `422 Unprocessable Entity`: Violación de regla de negocio; resalta los campos afectados.
  * `500 Internal Server Error`: Fallo de servidor; captura con `try / catch` y mensaje psicológico de tranquilidad.
  * `Código 0 / Network Error`: Timeout o desconexión; el formulario conserva el 100% de los datos diligenciados permitiendo reintento con un clic.
```

---

## 1. Justificación del Cambio de Paradigma: Adiós al Dropdown

Los selectores desplegables estándar (`<select>` o menús dropdown planos) en la hotelería moderna presentan graves deficiencias:
1. **Falta de Percepción Espacial y de Confort**:
   - Una opción en texto plano `"Cama 02 - Habitación 204"` no transmite si la cama es matrimonial, individual o sofá cama, ni cómo se siente el espacio.
2. **Fricción en la Decisión**:
   - Forzar al usuario a hacer clic, abrir una lista vertical larga y leer texto árido reduce la conversión y la satisfacción.
3. **El Paradigma Físico Háptico (3D Dock + Drag & Drop)**:
   - Al presentar las camas en una **barra de navegación tipo dock con modelos 3D en tiempo real**, el huésped experimenta el placer táctil de "elegir su cama".
   - Al **arrastrar la cama 3D físicamente** hacia la **zona de soltado (`BedDropZone`)** del formulario, se genera una metáfora visual inmersiva de adjudicación que confirma con certeza qué lugar ocupará en el hotel.

---

## 2. Mapa Arquitectónico (Vertical Slicing * Onion + Atomic Design)

```
src/features/reservas/
├── domain/
│   ├── reserva.ts                     # Entidades puras: Reserva, ClientSession, BedItem3D, ReservaValidationErrors
│   ├── reserva-repository.ts          # Contrato del puerto (IReservaRepository)
│   ├── reserva-calculations.ts        # Reglas puras: cálculo de noches, aforo vs capacidad de cama, precio en COP
│   └── reserva-status-codes.ts        # Diccionario de códigos HTTP, mensajes psicológicos y tipos de error
│
├── application/
│   ├── use-reserva-form.ts            # Caso de uso: orquestación de campos, drag & drop, submit y try/catch
│   ├── use-client-session.ts          # Caso de uso: lectura y normalización del usuario logueado desde auth-storage
│   └── use-interactive-beds-3d.ts     # Caso de uso: catálogo enriquecido de camas vinculadas a modelos 3D y habitaciones
│
├── infrastructure/
│   └── api-reserva-repository.ts      # Adaptador Axios para /reserve, /beds, /rooms, /types-bed con try/catch exhaustivo
│
└── ui/
    ├── atoms/
    │   ├── session-avatar.tsx         # Avatar del cliente con pulso verde de sesión activa
    │   ├── bed-type-badge.tsx         # Badge de confort (King, Queen, Twin, Sofá)
    │   ├── guest-stepper.tsx          # Control (+) y (-) acotado por la capacidad de la cama soltada
    │   ├── night-badge.tsx            # Píldora animada con el total de noches calculadas
    │   └── drop-zone-indicator.tsx    # Icono animado de arrastre con flechas y pulso háptico
    │
    ├── molecules/
    │   ├── client-session-card.tsx    # Ficha del huésped titular autenticado
    │   ├── bed-3d-dock-bar.tsx        # Barra de navegación dock con magnificación y camas 3D arrastrables
    │   ├── bed-3d-draggable-card.tsx  # Tarjeta individual con canvas 3D y handlers onDragStart
    │   ├── bed-drop-zone.tsx          # ZONA DE SOLTADO: guía visual interactiva con estados idle, hover y slotted 3D
    │   ├── stay-date-picker.tsx       # Selectores de fecha de entrada y salida con validación
    │   └── reserva-summary-card.tsx   # Resumen dinámico y desglose financiero en COP
    │
    ├── organisms/
    │   └── reserva-interactive-form.tsx # Formulario integral de 2 columnas con integración de la zona de soltado
    │
    └── reservas-page.tsx              # Vista principal responsiva con la barra 3D superior y formulario
```

---

## 3. Especificación Técnica: Barra 3D (`Bed3DDockBar`) y Zona de Soltado (`BedDropZone`)

### 3.1. Barra de Navegación con Camas 3D (`Bed3DDockBar`)

La barra de navegación actúa como la fuente de arrastre (*Drag Source*) y menú de exploración de confort:
- **Efecto Dock Magnification** (conforme a `prompt/prompt-dock-magnification.md`):
  * `mouseX = useMotionValue(Infinity)`: Registra la posición horizontal del cursor sin re-renders.
  * `useTransform`: Mapea la distancia euclidiana del cursor hacia el centro de cada tarjeta (rango `[-160, 0, 160]px`), escalando suavemente de `90px` hasta `160px`.
  * `useSpring`: Aplica inercia y rebote natural `{ mass: 0.1, stiffness: 150, damping: 12 }`.
- **Previsualización 3D en Tiempo Real**:
  * Cada tarjeta contiene una instancia compacta de `EscenaTipoCama` (@[src/features/cama3d/ui/organisms/escena-tipo-cama.tsx]) con `<Canvas>`, sombras de contacto (`ContactShadows`), luces ambientales y rotación lenta automática (`OrbitControls autoRotate`).
- **Sistema de Arrastre (*Drag Source*)**:
  ```tsx
  // Evento al iniciar el arrastre de la cama 3D
  const handleDragStart = (e: React.DragEvent, bed: BedItem3D) => {
    e.dataTransfer.setData('application/json', JSON.stringify(bed))
    e.dataTransfer.effectAllowed = 'copyMove'
    setIsDragging(true)
  }
  ```

---

### 3.2. Sección en el Formulario: Zona de Soltado de Cama (`BedDropZone`)

Ubicada en el corazón del formulario para indicarle inequívocamente al cliente dónde colocar su elección:

#### Estados de la Zona de Soltado:

```
+--------------------------------------------------------------------------+
| ESTADO 1: EN ESPERA (IDLE)                                               |
| [ Borde discontinuo 2px border-dashed border-line ]                      |
|                                                                          |
|                     ┌────────┐                                           |
|                     │  🛏️ ↓  │  (Icono de cama con flecha pulsante)     |
|                     └────────┘                                           |
|     "Arrastra y suelta tu cama 3D aquí para asignarla a tu reserva"      |
|    Explora las opciones en la barra superior y arrastra la que prefieras |
+--------------------------------------------------------------------------+
```

```
+--------------------------------------------------------------------------+
| ESTADO 2: SOBREVOLANDO (DRAG OVER / ACTIVE)                              |
| [ Borde activo 2px border-primary ring-4 ring-primary/20 bg-primary/5 ]  |
|                                                                          |
|                     ┌────────┐                                           |
|                     │  ✨ 🎯 │  (Brillo y scale 1.02)                   |
|                     └────────┘                                           |
|                    "¡Suelta aquí para fijar esta cama!"                  |
+--------------------------------------------------------------------------+
```

```
+--------------------------------------------------------------------------+
| ESTADO 3: CAMA ASIGNADA (SLOTTED)                                        |
| [ Borde sólido 1px border-primary/40 bg-panel shadow-md ]                |
|                                                                          |
|  ┌─────────────────────┐  Suite Imperial 201 · Piso 2                    |
|  │                     │  Cama King Size (Principal)                     |
|  │   ESCENA 3D         │  Capacidad: Hasta 2 personas                    |
|  │   INTERACTIVA       │  $ 220.000 COP / noche                          |
|  │                     │  [Badge King] [Chip Disponible]                 |
|  └─────────────────────┘                                                 |
|                           [ Botón: Cambiar / Quitar cama ]               |
+--------------------------------------------------------------------------+
```

#### Código de Referencia para `BedDropZone`:
```tsx
export function BedDropZone({
  assignedBed,
  onBedDropped,
  onRemoveBed,
}: BedDropZoneProps) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!isOver) setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    try {
      const rawData = e.dataTransfer.getData('application/json')
      if (rawData) {
        const bed = JSON.parse(rawData) as BedItem3D
        onBedDropped(bed)
      }
    } catch {
      // Ignora silenciosamente transferencias corruptas
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl p-6 transition-all duration-200 ${
        assignedBed
          ? 'border border-primary/30 bg-panel shadow-xs'
          : isOver
            ? 'border-2 border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]'
            : 'border-2 border-dashed border-line bg-canvas hover:border-primary/50'
      }`}
    >
      {/* Renderizado condicional según estado Idle vs Slotted */}
    </div>
  )
}
```

---

## 4. Matriz Completa de Status Codes HTTP y Arquitectura de `try / catch`

Cada interacción con la API de Nexora cuenta con tipado estricto, captura mediante bloques `try / catch` y respuestas de contingencia que protegen la experiencia del usuario (1ra Ley de Asimov):

### 4.1. Matriz de Códigos de Estado

| Endpoint | Método | Código HTTP | Significado | Comportamiento del Repositorio | Experiencia para el Usuario |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **`/beds`** | `GET` | **`200 OK`** | Catálogo de camas obtenido exitosamente. | Hidrata el dock 3D con las camas disponibles. | Las camas 3D se despliegan en la barra listas para arrastrar. |
| **`/beds`** | `GET` | **`401 Unauthorized`** | Token ausente o sesión caducada. | Emite `ReservaApiError(401)`. | Solicita reautenticación sin borrar lo seleccionado. |
| **`/beds`** | `GET` | **`500 Server Error`** | Error en base de datos del hotel. | Retorna catálogo de contingencia en caché local. | El usuario visualiza camas de muestra con advertencia suave. |
| **`/beds`** | `GET` | **`Código 0 (Network)`** | Sin conexión a internet o backend apagado. | Activa modo offline con datos en memoria. | Mensaje: *"Modo sin conexión. Puedes explorar las camas 3D"*. |
| **`/rooms/{id}`**| `GET` | **`200 OK`** | Datos de habitación (tarifa, piso, nombre). | Asocia detalles técnicos a la cama 3D arrastrada. | Desglose de habitación actualizado al soltar la cama. |
| **`/rooms/{id}`**| `GET` | **`404 Not Found`** | Habitación no registrada en backend. | Aplica nombre genérico de contingencia. | La cama sigue operativa sin romper el formulario. |
| **`/persons`** | `GET` | **`200 OK`** | Lista o búsqueda de personas. | Resuelve el perfil del cliente logueado. | Ficha `ClientSessionCard` completada automáticamente. |
| **`/reserve`** | `POST` | **`201 Created`** | Reserva creada y confirmada. | Retorna ID de reserva exitosa. | Modal de éxito con animación `fadeUp` y botón de comprobante. |
| **`/reserve`** | `POST` | **`400 Bad Request`** | Parámetros inválidos (ej. fechas invertidas). | Parsea mensaje exacto del servidor. | Alerta visual en los campos involucrados; **no se borran datos**. |
| **`/reserve`** | `POST` | **`401 Unauthorized`** | Sesión expirada durante el llenado. | Preserva el borrador en `sessionStorage`. | Permite renovar login y volver exactamente donde estaba. |
| **`/reserve`** | `POST` | **`403 Forbidden`** | Usuario sin privilegios para reservar. | Notifica bloqueo administrativo. | Mensaje explicativo de permisos con soporte del hotel. |
| **`/reserve`** | `POST` | **`409 Conflict`** | **Cama ya ocupada en ese rango de fechas.** | Captura conflicto de concurrencia. | *"Esta cama acaba de ser tomada para esas fechas. Por favor arrastra otra cama desde la barra superior"*. |
| **`/reserve`** | `POST` | **`422 Unprocessable`**| El aforo supera la capacidad de la cama. | Rechaza petición a nivel de dominio. | Bloquea el botón y ajusta el stepper al máximo admisible. |
| **`/reserve`** | `POST` | **`500 Server Error`** | Fallo imprevisto en backend. | Captura excepción y preserva estado. | *"Tuvimos un inconveniente al asegurar tu reserva. Tus datos están a salvo; reintenta en un momento"*. |
| **`/reserve`** | `POST` | **`Código 0 (Timeout)`**| Pérdida de paquetes o red inestable. | Conserva el 100% del formulario. | Botón *"Reintentar confirmación"* sin perder ningún campo. |

---

### 4.2. Implementación de Referencia: `ApiReservaRepository` con `try / catch`

```typescript
// src/features/reservas/infrastructure/api-reserva-repository.ts
import axios from 'axios'
import { api } from '../../../lib/api'
import {
  ReservaApiError,
  type BedApiResponse,
  type PersonApiResponse,
  type ReservaPayload,
  type RoomApiResponse,
} from '../domain/reserva'
import type { ReservaRepository } from '../domain/reserva-repository'

export class ApiReservaRepository implements ReservaRepository {
  async getBeds(): Promise<BedApiResponse[]> {
    try {
      const response = await api.get<BedApiResponse[]>('/beds')
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data
      }
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        console.warn(`[ApiReservaRepository.getBeds] Error HTTP ${status}:`, error.message)
        throw new ReservaApiError(status, 'No fue posible cargar las camas disponibles.')
      }
      throw new ReservaApiError(0, 'Fallo inesperado de red al conectar con el catálogo de camas.')
    }
  }

  async getRoom(id: string): Promise<RoomApiResponse> {
    try {
      const response = await api.get<RoomApiResponse>(`/rooms/${id}`)
      if (response.status === 200 && response.data) {
        return response.data
      }
      throw new ReservaApiError(response.status, `Habitación ${id} no encontrada.`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        if (status === 404) {
          // Fallback resiliente
          return { id, name: `Habitación ${id.slice(0, 6)}`, status: 'active' }
        }
        throw new ReservaApiError(status, `Error al consultar la habitación ${id}.`)
      }
      return { id, name: `Habitación ${id.slice(0, 6)}`, status: 'active' }
    }
  }

  async getPersons(): Promise<PersonApiResponse[]> {
    try {
      const response = await api.get<PersonApiResponse[]>('/persons')
      if (response.status === 200 && Array.isArray(response.data)) {
        return response.data
      }
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        throw new ReservaApiError(status, 'No se pudo consultar el registro de personas.')
      }
      return []
    }
  }

  async createReserva(payload: ReservaPayload): Promise<{ id?: string; message: string }> {
    try {
      const response = await api.post('/reserve', payload, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true, // Evaluamos manualmente los status codes
      })

      // Código 200 o 201: Éxito
      if (response.status === 200 || response.status === 201) {
        return {
          id: (response.data as { id?: string })?.id,
          message: '¡Tu reserva ha sido creada exitosamente!',
        }
      }

      // Códigos de error del backend
      const serverMessage =
        typeof response.data === 'object' && response.data !== null && 'message' in response.data
          ? String((response.data as { message: unknown }).message)
          : undefined

      switch (response.status) {
        case 400:
          throw new ReservaApiError(400, serverMessage || 'Datos de reserva incompletos o fechas inválidas.')
        case 401:
          throw new ReservaApiError(401, 'Tu sesión ha expirado. Por favor reingresa a tu cuenta.')
        case 403:
          throw new ReservaApiError(403, 'No tienes permisos para registrar reservas con este perfil.')
        case 404:
          throw new ReservaApiError(404, 'La cama o habitación seleccionada ya no existe en el sistema.')
        case 409:
          throw new ReservaApiError(409, '¡Esta cama ya está reservada para las fechas seleccionadas! Arrastra otra cama desde la barra 3D.')
        case 422:
          throw new ReservaApiError(422, serverMessage || 'El número de huéspedes excede la capacidad admitida.')
        case 500:
        default:
          throw new ReservaApiError(response.status, 'Inconveniente interno en los servidores de reservas. Tus datos permanecen a salvo.')
      }
    } catch (error) {
      if (error instanceof ReservaApiError) {
        throw error
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        throw new ReservaApiError(status, 'Problema de conexión con el servidor. Revisa tu red y reintenta.')
      }
      throw new ReservaApiError(0, 'Ocurrió un error inesperado al procesar la reserva.')
    }
  }
}
```

---

### 4.3. Implementación de `try / catch` en la Capa de Aplicación (`useReservaForm`)

```typescript
// En use-reserva-form.ts
const submitReserva = async () => {
  setIsSubmitting(true)
  setApiError(null)

  // 1. Validación previa en dominio (sin llamadas de red)
  const validationErrors = validateReservaInput(formData)
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    setIsSubmitting(false)
    return
  }

  // 2. Ejecución protegida con try / catch
  try {
    const payload = buildReservaPayload(formData)
    const result = await repository.createReserva(payload)
    setIsSuccess(true)
    setSuccessMessage(result.message)
  } catch (error: unknown) {
    if (error instanceof ReservaApiError) {
      setApiError({
        statusCode: error.statusCode,
        message: error.message,
      })
    } else {
      setApiError({
        statusCode: 0,
        message: 'No pudimos conectar con el servidor. Tus datos siguen intactos; prueba de nuevo.',
      })
    }
    // IMPORTANTE: Nunca limpiar formData ante error (Heurística del Temor / 3ra Ley de Asimov)
  } finally {
    setIsSubmitting(false)
  }
}
```

---

## 5. Especificación de Componentes Atómicos (Atomic Design)

### 5.1. Átomos (`ui/atoms/`)

1. **`SessionAvatar`**:
   - Iniciales del titular con badge circular verde pulsante (`bg-emerald-500`) indicando sesión autenticada.
2. **`BedTypeBadge`**:
   - Micro-chip con variantes cromáticas por confort: King (Púrpura), Queen (Azul), Twin (Esmeralda), Sofá (Ámbar).
3. **`GuestStepper`**:
   - Selector numérico accesible con botones `[-]` y `[+]`.
   - Bloqueado rígidamente si el usuario no ha soltado una cama en la zona de soltado.
   - Techo dinámico equivalente al aforo de la cama asignada (`maxGuests`).
4. **`NightBadge`**:
   - Píldora animada con `fadeIn` que muestra `"1 noche"`, `"3 noches"`.
5. **`DropZoneIndicator`**:
   - Icono SVG con animación de rebote vertical suave que guía la mirada del cliente hacia el área de recepción.

---

### 5.2. Moléculas (`ui/molecules/`)

1. **`ClientSessionCard`**:
   - Identidad automática del usuario autenticado vía `auth-storage.ts`.
   - Chip de seguridad: *"Titular autenticado"*.
   - Toggle secundario: *"¿Deseas registrar la reserva para un tercero?"*.

2. **`Bed3DDockBar`**:
   - Barra horizontal situada en la parte superior con efecto dock magnification (`motion/react`).
   - Flechas laterales de desplazamiento horizontal (`scrollLeft` / `scrollRight`) con escucha del mousewheel.
   - Agrupa las tarjetas arrastrables `Bed3DDraggableCard`.

3. **`Bed3DDraggableCard`**:
   - Tarjeta individual con canvas 3D (`EscenaTipoCama`), etiqueta de habitación, badge de confort y capacidad.
   - Atributos `draggable={true}` y visualización háptica de cursor al arrastrar (`cursor-grab` / `cursor-grabbing`).

4. **`BedDropZone` (Zona de Soltado de Cama)**:
   - Contenedor interactivo del formulario con receptores `onDragOver`, `onDragLeave` y `onDrop`.
   - Estado Idle: Bordes discontinuos y mensaje para invitar a arrastrar una cama 3D.
   - Estado Active: Iluminación y escala al sobrevolar una cama.
   - Estado Slotted: Muestra la cama 3D seleccionada, datos de confort, precio y botón de cambio.

5. **`StayDatePicker`**:
   - Controles de Check-in y Check-out con validación de fechas coherentes (hoy en adelante).
   - Chip intermedio con `NightBadge`.

6. **`ReservaSummaryCard`**:
   - Tarjeta sticky de desglose económico en tiempo real:
     * Noches calculadas.
     * Tarifa base de la cama 3D soltada.
     * Total en COP (`formatPrecioCOP`).
     * Botón principal de confirmación con estado de carga y tratamiento de errores.

---

### 5.3. Organismos (`ui/organisms/`)

#### `ReservaInteractiveForm`
- Disposición de layout responsivo:
  - **Fila Superior (Ancho Completo)**:
    * `Bed3DDockBar` (Barra interactiva de exploración 3D).
  - **Cuerpo en Dos Columnas (`lg:grid lg:grid-cols-12 lg:gap-8`)**:
    * **Columna Izquierda (8 columnas)**:
      1. `ClientSessionCard` (Identidad del huésped).
      2. `BedDropZone` (Zona de soltado interactiva para la cama 3D).
      3. `StayDatePicker` (Fechas de entrada y salida).
      4. `GuestStepper` (Número de huéspedes permitido por la cama).
    * **Columna Derecha (4 columnas)**:
      * `ReservaSummaryCard` (Sticky con desglose financiero y confirmación).

---

## 6. Principios Éticos y Leyes de Asimov Aplicadas al Formulario

1. **Primera Ley (No dañar al usuario ni por inacción permitir daño)**:
   - **Prevención de hacinamiento**: El stepper de huéspedes se bloquea al alcanzar la capacidad física de la cama 3D soltada.
   - **Prevención de cobros erróneos**: Fechas coherentes calculadas matemáticamente en el dominio antes de invocar la red.
2. **Segunda Ley (Soberanía, obediencia y claridad visual)**:
   - El cliente interactúa directamente con la cama 3D que va a ocupar: ve su forma, sus proporciones y su confort antes de pagar.
   - La zona de soltado le permite cambiar de cama cuantas veces desee con solo arrastrar otra o presionar retirar.
3. **Tercera Ley (Heurística del Temor y Preservación de la Integridad)**:
   - En caso de fallo de red (`Código 0`), error `409` (cama ocupada) o `500` (servidor caído), el formulario **nunca destruye la información ingresada**.
   - Los datos del huésped, fechas y cantidad de personas permanecen intactos en pantalla, ofreciendo un reintento inmediato sin frustración.
