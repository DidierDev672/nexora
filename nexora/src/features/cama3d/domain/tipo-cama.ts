export interface TipoCama {
  id: string
  name: string
  capacity_people: number
  description: string
  created_by: string
}

export function escalaCama(capacity: number): number {
  const escala = 0.6 + capacity * 0.2
  return Math.min(Math.max(escala, 0.7), 1.8)
}

export function esTipoSofa(name: string): boolean {
  const normalizado = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return normalizado.includes('sofa')
}

export const CAPACIDAD_MIN = 1
export const CAPACIDAD_MAX = 16
export const DESCRIPCION_MAX = 240

export interface TipoCamaDraft {
  nombre: string
  capacidad: string
  descripcion: string
}

export interface TipoCamaDraftErrors {
  nombre?: string
  capacidad?: string
  descripcion?: string
}

export function validarTipoCamaDraft(draft: TipoCamaDraft): TipoCamaDraftErrors {
  const errores: TipoCamaDraftErrors = {}

  const nombre = draft.nombre.trim()
  if (!nombre) {
    errores.nombre = 'El tipo de cama necesita un nombre para que podamos identificarlo.'
  } else if (nombre.length > 30) {
    errores.nombre = 'Ese nombre es muy largo: quedate con 30 caracteres como máximo.'
  }

  const capacidad = Number(draft.capacidad.trim())
  if (!draft.capacidad.trim()) {
    errores.capacidad = 'Contanos cuántas personas pueden dormir ahí.'
  } else if (!Number.isInteger(capacidad) || capacidad < CAPACIDAD_MIN) {
    errores.capacidad = `La capacidad tiene que ser un número entero de al menos ${CAPACIDAD_MIN}.`
  } else if (capacidad > CAPACIDAD_MAX) {
    errores.capacidad = `Relajá: la capacidad máxima es de ${CAPACIDAD_MAX} personas.`
  }

  if (draft.descripcion.trim().length > DESCRIPCION_MAX) {
    errores.descripcion = `La descripción respira mejor con ${DESCRIPCION_MAX} caracteres o menos.`
  }

  return errores
}