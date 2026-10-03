/**
 * Dominio: Entidad y tipos para el modal de visualización de Tarifas
 */

export interface RawTarifaBackend {
  id: string
  name: string
  headquarter_id: string | null
  subheadquarter_id: string | null
  room_type_id: string | null
  modality: string
  price: number
  duration_units: number
  start_time: string | null
  end_time: string | null
  days_of_week: string
  status: string
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RawHeadquarterTarifa {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status?: string
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface RawSubHeadquarterTarifa {
  id: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: string
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export type TarifasErrorState = 'empty' | 'server_error' | 'network_error'

/**
 * Traduce cualquier modalidad (que suele venir en inglés desde el backend) a español claro y amigable
 */
export function translateModality(modality?: string | null): string {
  if (!modality) return 'No especificada'
  const key = modality.trim().toLowerCase()

  switch (key) {
    case 'daily':
    case 'day':
    case 'dias':
    case 'dia':
      return 'Diario (Estadía por día completo)'
    case 'night':
    case 'noche':
      return 'Noche (Estadía nocturna)'
    case 'morning':
    case 'manana':
    case 'mañana':
      return 'Mañana (Turno matutino)'
    case 'afternoon':
    case 'tarde':
      return 'Tarde (Turno vespertino)'
    case 'weekly':
    case 'semanal':
      return 'Semanal (Estadía por 7 días)'
    case 'monthly':
    case 'mensual':
      return 'Mensual (Estadía por 30 días)'
    case 'hourly':
    case 'hour':
    case 'horas':
    case 'hora':
      return 'Por horas (Fracción horaria)'
    default:
      return key.charAt(0).toUpperCase() + key.slice(1)
  }
}

/**
 * Traduce los días de la semana a español amigable
 */
export function translateDaysOfWeek(days?: string | null): string {
  if (!days) return 'No especificado'
  const key = days.trim().toLowerCase()

  switch (key) {
    case 'all':
    case 'todos_los_dias':
      return 'Todos los días (Lunes a Domingo)'
    case 'weekend':
    case 'fin_de_semana':
      return 'Fin de semana (Viernes a Domingo)'
    case 'weekday':
    case 'semanal':
      return 'Días de semana (Lunes a Viernes)'
    default:
      return key
  }
}

/**
 * Traduce el estado a español con indicador de vigencia
 */
export function translateTarifaStatus(status?: string | null): { label: string; isActive: boolean } {
  if (!status) return { label: 'Desconocido', isActive: false }
  const key = status.trim().toLowerCase()

  switch (key) {
    case 'active':
    case 'activo':
      return { label: 'Activa y vigente', isActive: true }
    case 'inactive':
    case 'inactivo':
      return { label: 'Inactiva', isActive: false }
    case 'maintenance':
      return { label: 'En mantenimiento', isActive: false }
    default:
      return { label: key, isActive: false }
  }
}

/**
 * Formateador de moneda colombiana / estándar
 */
export function formatTarifaPrice(amount: number): string {
  if (isNaN(amount)) return '$ 0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}
