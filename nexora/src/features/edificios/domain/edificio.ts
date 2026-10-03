export type EdificioEstado =
  | 'disponible'
  | 'ocupado'
  | 'mantenimiento'
  | 'limpieza'
  | 'inactivo'

export const EDIFICIO_ESTADOS: readonly EdificioEstado[] = [
  'disponible',
  'ocupado',
  'mantenimiento',
  'limpieza',
  'inactivo',
] as const

export const EDIFICIO_ESTADO_LABELS: Record<EdificioEstado, string> = {
  disponible: 'Disponible',
  ocupado: 'Ocupado',
  mantenimiento: 'Mantenimiento',
  limpieza: 'Limpieza',
  inactivo: 'Inactivo',
}

export const EDIFICIO_ESTADO_STATUS: Record<EdificioEstado, string> = {
  disponible: 'available',
  ocupado: 'occupied',
  mantenimiento: 'maintenance',
  limpieza: 'cleaning',
  inactivo: 'inactive',
}

export interface EdificioInput {
  nombre: string
  numPisos: string
  sedeId: string
  subSedeId: string
  estado: EdificioEstado
}

export interface EdificioValidationErrors {
  nombre?: string
  numPisos?: string
  sedeId?: string
  subSedeId?: string
  estado?: string
}

export const NOMBRE_MAX = 60
export const PISOS_MIN = 1
export const PISOS_MAX = 100

const NOMBRE_PATTERN = /^[\p{L}\p{N}\s-]{1,60}$/u
const INTEGER_PATTERN = /^\d+$/

export function validateEdificioInput(input: EdificioInput): EdificioValidationErrors {
  const errors: EdificioValidationErrors = {}
  const nombre = input.nombre.trim()
  const numPisos = input.numPisos.trim()

  if (!nombre) {
    errors.nombre = 'Escribe el nombre del edificio.'
  } else if (!NOMBRE_PATTERN.test(nombre)) {
    errors.nombre = `Usa hasta ${NOMBRE_MAX} caracteres; puedes combinar letras y números.`
  }

  if (!numPisos) {
    errors.numPisos = 'Indica cuántos pisos tiene el edificio.'
  } else if (!INTEGER_PATTERN.test(numPisos)) {
    errors.numPisos = 'El número de pisos debe ser un entero, sin letras ni símbolos.'
  } else {
    const value = Number(numPisos)
    if (value < PISOS_MIN || value > PISOS_MAX) {
      errors.numPisos = `El número de pisos debe estar entre ${PISOS_MIN} y ${PISOS_MAX}.`
    }
  }

  if (!input.sedeId) {
    errors.sedeId = 'Elige la sede a la que pertenece el edificio.'
  }

  if (!EDIFICIO_ESTADOS.includes(input.estado)) {
    errors.estado = 'Elige un estado válido.'
  }

  return errors
}