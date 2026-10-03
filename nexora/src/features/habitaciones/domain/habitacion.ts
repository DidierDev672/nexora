export interface Habitacion {
  id: string
  name: string
  capacity: number
  basePrice: number
}

export interface HabitacionInput {
  name: string
  capacity: string
  basePrice: string
}

export interface HabitacionValidationErrors {
  name?: string
  capacity?: string
  basePrice?: string
}

export { HabitacionApiError } from './habitacion-error'

export const NAME_MAX = 80
export const CAPACITY_MIN = 1
export const CAPACITY_MAX = 50
export const BASE_PRICE_MAX = 9_999_999

const CAPACITY_PATTERN = /^\d+$/
const BASE_PRICE_PATTERN = /^\d+(?:[.,]\d{1,2})?$/

function newId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `habitacion-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function parseBasePrice(value: string): number {
  return Number(value.trim().replace(',', '.'))
}

export function newHabitacion(input: HabitacionInput): Habitacion {
  return {
    id: newId(),
    name: input.name.trim(),
    capacity: Math.trunc(Number(input.capacity)),
    basePrice: parseBasePrice(input.basePrice),
  }
}

export function validateHabitacionInput(input: HabitacionInput): HabitacionValidationErrors {
  const errors: HabitacionValidationErrors = {}
  const name = input.name.trim()
  const capacity = input.capacity.trim()
  const basePrice = input.basePrice.trim()

  if (!name) {
    errors.name = 'Ponle un nombre para reconocerla en tu inventario.'
  } else if (name.length < 2) {
    errors.name = 'El nombre necesita al menos 2 caracteres.'
  } else if (name.length > NAME_MAX) {
    errors.name = `El nombre no puede superar los ${NAME_MAX} caracteres.`
  }

  if (!capacity) {
    errors.capacity = 'Indica cuántas personas pueden alojarse.'
  } else if (!CAPACITY_PATTERN.test(capacity)) {
    errors.capacity = 'Usa solo números enteros, sin letras ni símbolos.'
  } else {
    const value = Number(capacity)
    if (value < CAPACITY_MIN || value > CAPACITY_MAX) {
      errors.capacity = `La capacidad debe estar entre ${CAPACITY_MIN} y ${CAPACITY_MAX} personas.`
    }
  }

  if (!basePrice) {
    errors.basePrice = 'Define el precio base por noche.'
  } else if (!BASE_PRICE_PATTERN.test(basePrice)) {
    errors.basePrice = 'Escribe un monto válido, por ejemplo 250000 o 250000.50'
  } else {
    const value = parseBasePrice(basePrice)
    if (value <= 0) {
      errors.basePrice = 'El precio base debe ser mayor a 0.'
    } else if (value > BASE_PRICE_MAX) {
      errors.basePrice = 'Ese precio se ve muy alto. Revísalo y ajústalo.'
    }
  }

  return errors
}
