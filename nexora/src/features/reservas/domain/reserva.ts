export type ReservaEstado =
  | 'pendiente'
  | 'confirmada'
  | 'en curso'
  | 'finalizada'
  | 'cancelada'
  | 'no muestrar'

export const RESERVA_ESTADOS: readonly ReservaEstado[] = [
  'pendiente',
  'confirmada',
  'en curso',
  'finalizada',
  'cancelada',
  'no muestrar',
] as const

export const RESERVA_ESTADO_BACKEND_MAP: Record<ReservaEstado, string> = {
  pendiente: 'pending',
  confirmada: 'confirmed',
  'en curso': 'in progress',
  finalizada: 'completed',
  cancelada: 'canceled',
  'no muestrar': 'no show',
}

export const RESERVA_ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en curso', label: 'En curso' },
  { value: 'finalizada', label: 'Finalizada' },
  { value: 'cancelada', label: 'Cancelada' },
  { value: 'no muestrar', label: 'No mostrar' },
] as const

export interface BedApiResponse {
  id: string
  room_id: string
  types_bed_id?: string[]
  etiquette: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface RoomApiResponse {
  id: string
  room_type_id?: string
  headquarter_id?: string
  sub_headquarter_id?: string
  building_id?: string
  name: string
  floor?: number | string
  description?: string
  status?: string
  price?: number
  capacity?: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface PersonApiResponse {
  id: string
  document_type: string
  document_number: string
  name: string
  phone_number: string
  email: string
}

export interface TipoCamaApiResponse {
  id: string
  name: string
  capacity_people: number
  description: string
  created_by?: string
}

/**
 * Entidad de Cama enriquecida con información espacial 3D, habitación y confort
 */
export interface BedItem3D {
  bedId: string
  roomId: string
  roomName: string
  floorNumber?: number | string
  etiquette: string
  capacity: number
  pricePerNight: number
  typeName: string
  typeBedId?: string
  status: string
}

/**
 * Entidad que representa la sesión del cliente autenticado
 */
export interface ClientSession {
  email: string
  name: string
  personId?: string
  phoneNumber?: string
  isAuthenticated: boolean
}

export interface BedRoomOption {
  bedId: string
  roomId: string
  roomName: string
  etiquette: string
  label: string
}

export interface PersonOption {
  id: string
  name: string
  phoneNumber: string
  email: string
  label: string
}

export interface ReservaInput {
  bedId: string
  roomId: string
  personId: string
  checkInDate: string
  checkOutDate: string
  numberOfGuests: number | string
  state: ReservaEstado | string
  totalPrice: number | string
}

export interface ReservaPayload {
  room_id: string
  person_id: string
  check_in_date: string
  check_out_date: string
  number_of_guests: number
  state: string
  total_price: number
  created_by: string
}

export interface ReservaValidationErrors {
  bedId?: string
  roomId?: string
  personId?: string
  checkInDate?: string
  checkOutDate?: string
  numberOfGuests?: string
  state?: string
  totalPrice?: string
}

/**
 * Calcula el número exacto de noches entre dos fechas YYYY-MM-DD
 */
export function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0
  const diffTime = end.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

/**
 * Calcula el precio total estimado (noches * tarifa por noche)
 */
export function calculateTotalPrice(nights: number, pricePerNight: number): number {
  const n = Math.max(nights, 1)
  const p = Math.max(pricePerNight, 0)
  return n * p
}

export function validateReservaInput(
  input: ReservaInput,
  maxGuestsAllowed = 10,
): ReservaValidationErrors {
  const errors: ReservaValidationErrors = {}

  if (!input.bedId.trim() || !input.roomId.trim()) {
    errors.bedId = 'Por favor arrastra y suelta una cama 3D en la zona de asignación.'
  }

  if (!input.personId.trim()) {
    errors.personId = 'Por favor confirma el huésped titular de la reserva.'
  }

  if (!input.checkInDate.trim()) {
    errors.checkInDate = 'La fecha de entrada es obligatoria.'
  }

  if (!input.checkOutDate.trim()) {
    errors.checkOutDate = 'La fecha de salida es obligatoria.'
  } else if (input.checkInDate.trim() && input.checkOutDate <= input.checkInDate) {
    errors.checkOutDate = 'La fecha de salida debe ser posterior a la fecha de entrada.'
  }

  const guests =
    typeof input.numberOfGuests === 'number'
      ? input.numberOfGuests
      : Number(input.numberOfGuests.toString().trim())

  if (!input.numberOfGuests || isNaN(guests) || guests < 1) {
    errors.numberOfGuests = 'El número de huéspedes debe ser al menos 1.'
  } else if (guests > maxGuestsAllowed) {
    errors.numberOfGuests = `La cama seleccionada permite un máximo de ${maxGuestsAllowed} personas.`
  }

  if (!input.state.trim()) {
    errors.state = 'Por favor selecciona el estado inicial de la reserva.'
  }

  const price =
    typeof input.totalPrice === 'number'
      ? input.totalPrice
      : Number(input.totalPrice.toString().replace(',', '.').trim())

  if (input.totalPrice === '' || isNaN(price) || price < 0) {
    errors.totalPrice = 'Ingresa un precio total válido (mayor o igual a 0).'
  }

  return errors
}

export class ReservaApiError extends Error {
  readonly statusCode: number

  constructor(statusCode: number, message?: string) {
    super(message || `API error with status ${statusCode}`)
    this.name = 'ReservaApiError'
    this.statusCode = statusCode
  }
}

/**
 * Formatea un valor numérico como moneda de Peso Colombiano (COP),
 * respetando las convenciones regionales (ej. $ 185.000).
 */
export function formatPrecioCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$ 0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

