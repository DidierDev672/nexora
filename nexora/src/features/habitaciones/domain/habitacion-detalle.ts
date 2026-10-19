export type HabitacionEstado =
  | 'disponible'
  | 'ocupada'
  | 'mantenimiento'
  | 'limpieza'
  | 'inactiva'

export const HABITACION_ESTADOS: readonly HabitacionEstado[] = [
  'disponible',
  'ocupada',
  'mantenimiento',
  'limpieza',
  'inactiva',
] as const

export const HABITACION_ESTADO_LABELS: Record<HabitacionEstado, string> = {
  disponible: 'Disponible',
  ocupada: 'Ocupada',
  mantenimiento: 'Mantenimiento',
  limpieza: 'Limpieza',
  inactiva: 'Inactiva',
}

export const HABITACION_ESTADO_STATUS: Record<HabitacionEstado, string> = {
  disponible: 'available',
  ocupada: 'occupied',
  mantenimiento: 'maintenance',
  limpieza: 'cleaning',
  inactiva: 'inactive',
}

export interface ApiRateItem {
  id: string
  name: string
  headquarter_id?: string | null
  subheadquarter_id?: string | null
  room_type_id?: string | null
  modality?: string | null
  price?: number | null
  duration_units?: number | null
  start_time?: string | null
  end_time?: string | null
  days_of_week?: string | null
  status?: string | null
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface HabitacionDetalleInput {
  numero: string
  piso: string
  tipoHabitacion: string
  edificioId: string
  precio: string
  estado: HabitacionEstado
  tarifaId?: string
}

export interface HabitacionDetalleValidationErrors {
  numero?: string
  piso?: string
  tipoHabitacion?: string
  edificioId?: string
  precio?: string
  estado?: string
  tarifaId?: string
}

export const NUMERO_MAX = 10
export const PISO_MIN = 0
export const PISO_MAX = 50
export const PRECIO_MAX = 9_999_999

const NUMERO_PATTERN = /^[\p{L}\p{N}\s-]{1,10}$/u
const INTEGER_PATTERN = /^\d+$/
const POSITIVE_NUMBER_PATTERN = /^\d+(?:[.,]\d{1,2})?$/

function parseMoney(value: string): number {
  return Number(value.trim().replace(',', '.'))
}

export function validateHabitacionDetalleInput(
  input: HabitacionDetalleInput,
  tarifaPrecioMax?: number | null,
  edificioMaxPisos?: number | null,
): HabitacionDetalleValidationErrors {
  const errors: HabitacionDetalleValidationErrors = {}
  const numero = input.numero.trim()
  const piso = input.piso.trim()
  const precio = input.precio.trim()

  if (!numero) {
    errors.numero = 'Escribe el número de habitación.'
  } else if (!NUMERO_PATTERN.test(numero)) {
    errors.numero = `Usa hasta ${NUMERO_MAX} caracteres; puedes combinar letras y números.`
  }

  if (!piso) {
    errors.piso = 'Indica el piso donde se encuentra.'
  } else if (!INTEGER_PATTERN.test(piso)) {
    errors.piso = 'El piso debe ser un número entero, sin letras ni símbolos.'
  } else {
    const value = Number(piso)
    if (value < PISO_MIN || value > PISO_MAX) {
      errors.piso = `El piso debe estar entre ${PISO_MIN} y ${PISO_MAX}.`
    } else if (edificioMaxPisos != null && edificioMaxPisos > 0 && value > edificioMaxPisos) {
      errors.piso = `El piso no puede superar el límite de ${edificioMaxPisos} ${edificioMaxPisos === 1 ? 'piso' : 'pisos'} del edificio seleccionado.`
    }
  }

  if (!input.tipoHabitacion) {
    errors.tipoHabitacion = 'Elige el tipo de habitación.'
  }

  if (!input.edificioId) {
    errors.edificioId = 'Elige el edificio al que pertenece la habitación.'
  }

  // `price_override` es opcional: si el usuario lo deja vacío, el payload lo envía como `null`.
  if (precio && !POSITIVE_NUMBER_PATTERN.test(precio)) {
    errors.precio = 'Escribe un monto válido, por ejemplo 150000 o 150000.50'
  } else if (precio) {
    const value = parseMoney(precio)
    if (value <= 0) {
      errors.precio = 'El precio debe ser mayor a 0.'
    } else if (value > PRECIO_MAX) {
      errors.precio = 'Ese precio se ve muy alto. Revísalo y ajústalo.'
    } else if (tarifaPrecioMax != null && tarifaPrecioMax > 0 && value > tarifaPrecioMax) {
      const formattedValue = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(value)
      const formattedMax = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(tarifaPrecioMax)
      errors.precio = `El precio a validar (${formattedValue}) no puede ser superior al precio de la tarifa seleccionada (${formattedMax}).`
    }
  }

  if (!HABITACION_ESTADOS.includes(input.estado)) {
    errors.estado = 'Elige un estado válido.'
  }

  return errors
}