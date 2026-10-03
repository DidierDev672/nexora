export type RecepcionMetodoPago = 'efectivo' | 'tarjeta' | 'transferencia'

export const METODOS_PAGO: readonly RecepcionMetodoPago[] = [
  'efectivo',
  'tarjeta',
  'transferencia',
] as const

/**
 * Traduce y formatea cualquier método de pago (inglés o español) exclusivamente al español.
 * Garantiza que el usuario nunca visualice términos en inglés como 'cash', 'card' o 'transfer'.
 */
export function formatMetodoPago(method?: string | null): string {
  if (!method) return 'Efectivo'
  const normalized = method.trim().toLowerCase()
  switch (normalized) {
    case 'cash':
    case 'efectivo':
      return 'Efectivo'
    case 'card':
    case 'tarjeta':
    case 'credit_card':
    case 'debit_card':
      return 'Tarjeta (Débito / Crédito)'
    case 'transfer':
    case 'transferencia':
    case 'bank_transfer':
    case 'wire':
      return 'Transferencia bancaria'
    default:
      if (normalized.includes('cash')) return 'Efectivo'
      if (normalized.includes('card')) return 'Tarjeta (Débito / Crédito)'
      if (normalized.includes('transfer')) return 'Transferencia bancaria'
      return 'Efectivo'
  }
}

/**
 * Normaliza cualquier valor de método de pago (inglés o español) al valor tipado RecepcionMetodoPago
 */
export function normalizeMetodoPago(method?: string | null): RecepcionMetodoPago {
  if (!method) return 'efectivo'
  const normalized = method.trim().toLowerCase()
  if (normalized === 'cash' || normalized === 'efectivo') return 'efectivo'
  if (normalized === 'card' || normalized === 'tarjeta' || normalized.includes('card')) return 'tarjeta'
  if (normalized === 'transfer' || normalized === 'transferencia' || normalized.includes('transfer')) return 'transferencia'
  return 'efectivo'
}

export const METODO_PAGO_OPTIONS = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'tarjeta', label: 'Tarjeta (Débito / Crédito)' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
] as const

export type RecepcionEstado = 'progreso' | 'finalizada' | 'cancelada'

export const RECEPCION_ESTADOS: readonly RecepcionEstado[] = [
  'progreso',
  'finalizada',
  'cancelada',
] as const

export const ESTADO_OPTIONS = [
  { value: 'progreso', label: 'En progreso (Hospedado)' },
  { value: 'finalizada', label: 'Finalizada (Check-out)' },
  { value: 'cancelada', label: 'Cancelada' },
] as const

export interface SedeInfo {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
}

export interface SubSedeInfo {
  id?: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: string
  created_by?: string
}

export interface EdificioInfo {
  id: string
  name: string
  floor_number?: number
  headquarters_id: string
  sub_headquarters_id?: string | null
  status?: string
}

export interface HabitacionInfo {
  id: string
  name: string
  number?: string
  floor?: number
  capacity?: number
  price?: number
  building_id?: string
  room_types_id?: string
  status?: string
  label: string
}

export interface CamaInfo {
  id: string
  room_id: string
  types_bed_id?: string[]
  etiquette: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface TipoCamaInfo {
  id: string
  name: string
  capacity_people: number
  description?: string
}

export interface HuespedInfo {
  id: string
  name: string
  document_type?: string
  document_number?: string
  phone_number?: string
  email?: string
  label: string
}

export interface ReservaInfo {
  id: string
  roomId: string
  roomName: string
  personId: string
  guestName: string
  guestPhone?: string
  checkInDate: string
  checkOutDate: string
  totalPrice?: number
  label: string
}

export interface RecepcionInput {
  sedeId?: string
  edificioId?: string
  habitacionId: string
  camaId?: string
  reservaId: string
  huespedId: string
  checkIn: string
  checkOut: string
  metodoPago: RecepcionMetodoPago | string
  depositoGarantia: number | string
  estado: RecepcionEstado | string
  observaciones?: string
}

export const PAYMENT_METHOD_BACKEND_MAP: Record<string, string> = {
  efectivo: 'cash',
  tarjeta: 'card',
  transferencia: 'transfer',
  cash: 'cash',
  card: 'card',
  transfer: 'transfer',
}

export const STATUS_BACKEND_MAP: Record<string, string> = {
  progreso: 'progress',
  finalizada: 'completed',
  cancelada: 'canceled',
  progress: 'progress',
  completed: 'completed',
  canceled: 'canceled',
}

export interface RecepcionPayload {
  room_id: string
  reservation_id: string
  person_id: string
  check_in_date: string
  check_out_date: string
  payment_method: string
  security_deposit: number
  remarks: string
  status: string
  created_by: string
}

export interface Recepcion {
  id: string
  roomId: string
  roomLabel: string
  reservaId?: string
  reservaLabel?: string
  guestId: string
  guestLabel: string
  checkIn: string
  checkOut: string
  metodoPago: RecepcionMetodoPago | string
  metodoPagoLabel: string
  depositoGarantia: number
  estado: RecepcionEstado | string
  estadoLabel: string
  observaciones?: string
  createdAt: string
  createdBy: string
  // Contexto espacial jerárquico enriquecido
  sede?: {
    id: string
    name: string
    city: string
    address?: string
    phone?: string
    status?: string
  }
  edificio?: {
    id: string
    name: string
    floor?: number
    status?: string
  }
  habitacion?: {
    id: string
    number?: string
    name: string
    floor?: number
    capacity?: number
    price?: number
    status?: string
  }
  cama?: {
    id: string
    etiquette: string
    types_bed_id?: string[]
    status?: string
    tipoNombre?: string
  }
  huesped?: {
    id: string
    name: string
    documentNumber?: string
    phoneNumber?: string
    email?: string
  }
  noches?: number
}

export interface RecepcionValidationErrors {
  sedeId?: string
  edificioId?: string
  habitacionId?: string
  camaId?: string
  reservaId?: string
  huespedId?: string
  checkIn?: string
  checkOut?: string
  metodoPago?: string
  depositoGarantia?: string
  estado?: string
  observaciones?: string
}

export function validateRecepcionInput(input: RecepcionInput): RecepcionValidationErrors {
  const errors: RecepcionValidationErrors = {}

  if (!input.reservaId || !input.reservaId.trim() || input.reservaId === 'sin-reserva') {
    errors.reservaId = 'Por favor selecciona la reserva previa para registrar la recepción.'
  }

  if (!input.habitacionId || !input.habitacionId.trim()) {
    errors.habitacionId = 'Por favor selecciona la habitación para el ingreso del huésped.'
  }

  if (!input.huespedId || !input.huespedId.trim()) {
    errors.huespedId = 'Por favor selecciona el huésped que se hospedará.'
  }

  if (!input.checkIn || !input.checkIn.trim()) {
    errors.checkIn = 'Indica la fecha y hora de entrada a la habitación.'
  }

  if (!input.checkOut || !input.checkOut.trim()) {
    errors.checkOut = 'Indica la fecha y hora estimada de salida.'
  } else if (input.checkIn && input.checkOut <= input.checkIn) {
    errors.checkOut = 'La fecha y hora de salida debe ser posterior a la de entrada.'
  }

  if (!input.metodoPago || !input.metodoPago.trim()) {
    errors.metodoPago = 'Elige el método de pago utilizado para la estadía.'
  }

  const depositStr = (input.depositoGarantia ?? '').toString().replace(',', '.').trim()
  if (depositStr === '') {
    errors.depositoGarantia = 'Ingresa el valor del depósito de garantía (puede ser 0 si no aplica).'
  } else {
    const depositNum = Number(depositStr)
    if (isNaN(depositNum) || depositNum < 0) {
      errors.depositoGarantia = 'El depósito debe ser un monto numérico mayor o igual a 0.'
    }
  }

  if (!input.estado || !input.estado.trim()) {
    errors.estado = 'Selecciona el estado de esta recepción.'
  }

  return errors
}

export function formatPrecioCOP(amount: number): string {
  if (isNaN(amount)) return '$ 0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`
}

export function getDefaultCheckInDateTime(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = padZero(now.getMonth() + 1)
  const dd = padZero(now.getDate())
  const hh = padZero(now.getHours())
  const min = padZero(now.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export function getDefaultCheckOutDateTime(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(12, 0, 0, 0)
  const yyyy = tomorrow.getFullYear()
  const mm = padZero(tomorrow.getMonth() + 1)
  const dd = padZero(tomorrow.getDate())
  const hh = padZero(tomorrow.getHours())
  const min = padZero(tomorrow.getMinutes())
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export function formatReadableDateTime(isoString: string): string {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  return date.toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatToIsoUtc(dateString: string): string {
  if (!dateString) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
  if (dateString.endsWith('Z')) return dateString
  const parsed = new Date(dateString)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().replace(/\.\d{3}Z$/, 'Z')
  }
  return dateString.length === 16 ? `${dateString}:00Z` : `${dateString}Z`
}

export function calcularNoches(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1
  const start = new Date(checkIn).getTime()
  const end = new Date(checkOut).getTime()
  if (isNaN(start) || isNaN(end) || end <= start) return 1
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 1
}
