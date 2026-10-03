import type { DropdownOption } from '../../recursos/ui/molecules/recursos-dropdown'

export type TarifaModalidad =
  | 'manana'
  | 'tarde'
  | 'noche'
  | 'dias'
  | 'semanal'
  | 'horas'

export type TarifaDiasSemana =
  | 'todos_los_dias'
  | 'fin_de_semana'
  | 'semanal'

export type TarifaEstado = 'activo' | 'inactivo'

export const TARIFA_MODALIDAD_OPTIONS: ReadonlyArray<DropdownOption> = [
  { value: 'manana', label: 'Mañana (Turno matutino)' },
  { value: 'tarde', label: 'Tarde (Turno vespertino)' },
  { value: 'noche', label: 'Noche (Estadía nocturna)' },
  { value: 'dias', label: 'Días (Estadía por día completo)' },
  { value: 'semanal', label: 'Semanal (Estadía por 7 días)' },
  { value: 'horas', label: 'Horas (Fracción por horas)' },
]

/**
 * Mapeo de modalidades en español a sus valores equivalentes en inglés requeridos por el backend.
 */
export const MODALIDAD_MAP_TO_ENGLISH: Record<string, string> = {
  manana: 'morning',
  tarde: 'afternoon',
  noche: 'night',
  dias: 'day',
  dia: 'day',
  semanal: 'weekly',
  horas: 'hour',
  hora: 'hour',
  morning: 'morning',
  afternoon: 'afternoon',
  night: 'night',
  day: 'day',
  weekly: 'weekly',
  hour: 'hour',
}

/**
 * Convierte cualquier modalidad recibida (español o inglés) al formato estandarizado en inglés para el payload.
 */
export function mapModalidadToEnglish(modalidad?: string | null): string {
  if (!modalidad) return 'night'
  const key = modalidad.trim().toLowerCase()
  return MODALIDAD_MAP_TO_ENGLISH[key] ?? key
}

export const TARIFA_DIAS_SEMANA_OPTIONS: ReadonlyArray<DropdownOption> = [
  { value: 'todos_los_dias', label: 'Todos los días' },
  { value: 'fin_de_semana', label: 'Fin de semana' },
  { value: 'semanal', label: 'Semanal' },
]

/**
 * Mapeo de días de la semana al formato requerido por el endpoint.
 */
export const DIAS_SEMANA_MAP_TO_ENGLISH: Record<string, string> = {
  todos_los_dias: 'all',
  fin_de_semana: 'weekend',
  semanal: 'weekday',
  all: 'all',
  weekend: 'weekend',
  weekday: 'weekday',
}

export function mapDiasSemanaToEnglish(dias?: string | null): string {
  if (!dias) return 'weekend'
  const key = dias.trim().toLowerCase()
  return DIAS_SEMANA_MAP_TO_ENGLISH[key] ?? key
}

export const TARIFA_ESTADO_OPTIONS: ReadonlyArray<DropdownOption> = [
  { value: 'activo', label: 'Activo' },
  { value: 'inactivo', label: 'Inactivo' },
]

export interface Tarifa {
  id: string
  nombre: string
  sedeId: string
  sedeNombre?: string
  subSedeId?: string
  subSedeNombre?: string
  modalidad: TarifaModalidad
  precio: number
  duracion: number
  fechaInicio: string
  fechaFinal: string
  diasSemana: TarifaDiasSemana
  estado: TarifaEstado
  createdAt: string
}

export interface TarifaInput {
  nombre: string
  sedeId: string
  subSedeId?: string
  modalidad: TarifaModalidad | ''
  precio: string
  duracion: string
  fechaInicio: string
  fechaFinal: string
  diasSemana: TarifaDiasSemana | ''
  estado: TarifaEstado
}

export interface TarifaApiPayload {
  name: string
  headquarter_id: string
  subheadquarter_id: string | null
  room_type_id: string | null
  modality: string
  price: number
  duration_units: number
  start_time: string
  end_time: string
  days_of_week: string
  status: string
  created_by: string
}


export interface TarifaValidationErrors {
  nombre?: string
  sedeId?: string
  subSedeId?: string
  modalidad?: string
  precio?: string
  duracion?: string
  fechaInicio?: string
  fechaFinal?: string
  diasSemana?: string
  estado?: string
}

export const NOMBRE_TARIFA_MAX = 90

export function validateTarifaInput(input: TarifaInput): TarifaValidationErrors {
  const errors: TarifaValidationErrors = {}
  const nombre = input.nombre.trim()

  if (!nombre) {
    errors.nombre = 'Escribe el nombre de la tarifa para identificarla fácilmente.'
  } else if (nombre.length < 3) {
    errors.nombre = 'El nombre de la tarifa debe tener al menos 3 caracteres.'
  } else if (nombre.length > NOMBRE_TARIFA_MAX) {
    errors.nombre = `El nombre no puede superar los ${NOMBRE_TARIFA_MAX} caracteres.`
  }

  if (!input.sedeId) {
    errors.sedeId = 'Elige la sede del hotel a la que pertenece esta tarifa.'
  }

  if (!input.modalidad) {
    errors.modalidad = 'Selecciona una modalidad (mañana, tarde, noche, días, semanal u horas).'
  }

  const numPrecio = Number.parseFloat(input.precio)
  if (!input.precio || Number.isNaN(numPrecio)) {
    errors.precio = 'Ingresa el precio base de la tarifa.'
  } else if (numPrecio <= 0) {
    errors.precio = 'El precio debe ser un número positivo mayor a 0.'
  }

  const numDuracion = Number.parseInt(input.duracion, 10)
  if (!input.duracion || Number.isNaN(numDuracion)) {
    errors.duracion = 'Indica la duración correspondiente a esta tarifa.'
  } else if (numDuracion <= 0) {
    errors.duracion = 'La duración debe ser un número entero mayor a 0.'
  }

  if (!input.fechaInicio) {
    errors.fechaInicio = 'Selecciona la fecha de inicio de vigencia.'
  }

  if (!input.fechaFinal) {
    errors.fechaFinal = 'Selecciona la fecha final de vigencia.'
  }

  if (input.fechaInicio && input.fechaFinal) {
    const inicio = new Date(input.fechaInicio)
    const fin = new Date(input.fechaFinal)
    if (fin < inicio) {
      errors.fechaFinal = 'La fecha final debe ser igual o posterior a la fecha de inicio.'
    }
  }

  if (!input.diasSemana) {
    errors.diasSemana = 'Selecciona los días en que aplica la tarifa (Todos los días, Fin de semana o Semanal).'
  }

  if (!input.estado) {
    errors.estado = 'Elige el estado inicial de la tarifa (Activo o Inactivo).'
  }

  return errors
}
