export type SedeEstado = 'activa' | 'mantenimiento' | 'inactiva'

export const SEDE_ESTADOS: SedeEstado[] = ['activa', 'mantenimiento', 'inactiva']

export const SEDE_ESTADO_LABELS: Record<SedeEstado, string> = {
  activa: 'Activa',
  mantenimiento: 'Mantenimiento',
  inactiva: 'Inactiva',
}

export interface Sede {
  id: string
  name: string
  address: string
  city: string
  phone: string
  estado: SedeEstado
}

export interface SedeInput {
  name: string
  address: string
  city: string
  phone: string
  estado: SedeEstado
}

export interface SedeValidationErrors {
  name?: string
  address?: string
  city?: string
  phone?: string
  estado?: string
}

export const NAME_MAX = 80
export const ADDRESS_MAX = 140
export const CITY_MAX = 60
export const PHONE_MAX = 15

const PHONE_PATTERN = /^[\d\s()+-]{7,15}$/

function newId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID()
  }
  return `sede-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function newSede(input: SedeInput): Sede {
  return {
    id: newId(),
    name: input.name.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    phone: input.phone.trim(),
    estado: input.estado,
  }
}

export function updateSedeFields(sede: Sede, input: SedeInput): Sede {
  return {
    id: sede.id,
    name: input.name.trim(),
    address: input.address.trim(),
    city: input.city.trim(),
    phone: input.phone.trim(),
    estado: input.estado,
  }
}

export function validateSedeInput(input: SedeInput): SedeValidationErrors {
  const errors: SedeValidationErrors = {}
  const name = input.name.trim()
  const address = input.address.trim()
  const city = input.city.trim()
  const phone = input.phone.trim()
  const estado = input.estado

  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres.'
  } else if (name.length > NAME_MAX) {
    errors.name = `El nombre no puede superar los ${NAME_MAX} caracteres.`
  }

  if (!address) {
    errors.address = 'La dirección es obligatoria.'
  } else if (address.length < 5) {
    errors.address = 'Escribe una dirección más completa.'
  } else if (address.length > ADDRESS_MAX) {
    errors.address = `La dirección no puede superar los ${ADDRESS_MAX} caracteres.`
  }

  if (!city) {
    errors.city = 'La ciudad es obligatoria.'
  } else if (city.length < 2) {
    errors.city = 'La ciudad debe tener al menos 2 caracteres.'
  } else if (city.length > CITY_MAX) {
    errors.city = `La ciudad no puede superar los ${CITY_MAX} caracteres.`
  }

  if (!phone) {
    errors.phone = 'El teléfono es obligatorio.'
  } else if (!PHONE_PATTERN.test(phone)) {
    errors.phone = 'Usa solo números, espacios, paréntesis o el símbolo +.'
  }

  if (!SEDE_ESTADOS.includes(estado)) {
    errors.estado = 'Elige un estado válido.'
  }

  return errors
}

export type SubSedeStatus = 'active' | 'inactive'

export const SUB_SEDE_STATUS_LABELS: Record<SubSedeStatus, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
}

export interface SubSede {
  id?: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: SubSedeStatus
  created_by?: string
}