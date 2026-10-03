export type KpiIcon = 'rooms' | 'guests' | 'sedes' | 'occupancy'

export interface DashboardKpi {
  id: string
  label: string
  value: string
  /** Variación porcentual frente al período anterior. Negativa = bajó. */
  change: number
  icon: KpiIcon
}

export interface OccupancyPoint {
  month: string
  /** Porcentaje de ocupación (0..100). */
  occupancy: number
}

export type ReservationStatus = 'confirmada' | 'checkIn' | 'checkOut' | 'cancelada' | 'reserve'

export interface Reservation {
  id: string
  guest: string
  room: string
  sede: string
  status: ReservationStatus
  time: string
}

/**
 * Respuesta del endpoint GET /reserve
 */
export interface ReservaBackendResponse {
  id: string
  room_id: string
  person_id: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  state: string
  total_price: number
  created_by: string
}

/**
 * Respuesta del endpoint GET /rooms/{id} o /room/{id}
 */
export interface RoomBackendResponse {
  id: string
  room_type_id?: string
  headquarter_id?: string
  sub_headquarter_id?: string
  building_id?: string
  name: string
  description?: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Respuesta del endpoint GET /person/{id} o /persons/{id}
 */
export interface PersonBackendResponse {
  id: string | number
  document_type?: string
  document_number?: string
  name: string
  phone_number?: string
  email?: string
}

/**
 * Respuesta del endpoint GET /headquarter/{id} o /headquarters/{id}
 */
export interface HeadquarterBackendResponse {
  id: string
  name: string
  address?: string
  city?: string
  phone?: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

/**
 * Modelo de reserva unificado para la tabla del Dashboard:
 * - HUÉSPED -> person.name
 * - Habitación -> room.name (del endpoint /room/{id})
 * - SEDE -> headquarter.name (del endpoint /headquarter/{id})
 * - Estado -> "reserve"
 * - Hora -> reservation.check_in_date
 */
export interface DashboardReservationItem {
  id: string
  roomId: string
  personId: string
  headquarterId?: string
  camaId?: string
  guestName: string
  guestDocument?: string
  guestPhone?: string
  guestEmail?: string
  roomName: string
  roomDescription?: string
  roomStatus?: string
  sede: string // name de la sede obtenido de /headquarter/{id}
  sedeAddress?: string
  sedeCity?: string
  estado: string
  hora: string // Hora computada en formato HH:mm
  checkInDate?: string // Fecha original completa de llegada
  checkOutDate?: string
  numberOfGuests?: number
  totalPrice?: number
  createdBy?: string
}

/**
 * Función computable para convertir una fecha a únicamente formato de hora (HH:mm).
 * Maneja formatos ISO (2026-09-20T10:15:00.000Z), cadenas con hora (2026-09-20 14:30),
 * y cadenas de solo fecha (2026-09-20) proporcionando la hora estándar de check-in hotelero.
 */
export function computeHoraFromDate(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') {
    return '14:00'
  }

  const trimmed = dateStr.trim()

  // 1. Si contiene indicador de hora con 'T' o espacio (ej: "2026-09-20T10:15:00.000Z" o "2026-09-20 14:30:00")
  const timeMatch = trimmed.match(/[T ](\d{1,2}):(\d{2})(?::\d{2})?/)
  if (timeMatch) {
    const hours = timeMatch[1].padStart(2, '0')
    const minutes = timeMatch[2]
    return `${hours}:${minutes}`
  }

  // 2. Si ya viene en formato de hora pura (ej: "14:30" o "14:30:00")
  const pureTimeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/)
  if (pureTimeMatch) {
    const hours = pureTimeMatch[1].padStart(2, '0')
    const minutes = pureTimeMatch[2]
    return `${hours}:${minutes}`
  }

  // 3. Si es parseable como Date de JavaScript y contiene información horaria válida
  const parsedDate = new Date(trimmed)
  if (!isNaN(parsedDate.getTime())) {
    const hours = parsedDate.getHours().toString().padStart(2, '0')
    const minutes = parsedDate.getMinutes().toString().padStart(2, '0')

    // Si tanto horas como minutos no son 00 (o si se especificó hora válida)
    if (hours !== '00' || minutes !== '00') {
      return `${hours}:${minutes}`
    }
  }

  // 4. Si la entrada es sólo fecha (ej. "2026-09-20"), calculamos una hora de check-in hotelera estándar (14:00)
  return '14:00'
}

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

export interface DashboardRepository {
  getTodayReservations(): Promise<DashboardReservationItem[]>
}