/**
 * Tipos de dominio y utilidades para el detalle del tipo de cama (/types-bed/{id}).
 */

export interface BedTypeInfo {
  id: string
  name: string
  capacity_people: number
  description: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export function formatBedCapacity(capacity: number | null | undefined): string {
  if (capacity == null || Number.isNaN(capacity) || capacity <= 0) return '1 persona'
  if (capacity === 1) return '1 persona'
  return `${capacity} personas`
}

/**
 * Catálogo de nombres conocidos para visualización inmediata en tabla.
 */
export const KNOWN_BED_TYPE_NAMES: Record<string, string> = {
  'room-type-matrimonial': 'Matrimonial',
  'room-type-doble': 'Doble Queen',
  'room-type-individual': 'Individual Estándar',
  'room-type-suite': 'Suite King Presidencial',
  matrimonial: 'Matrimonial',
  individual: 'Individual',
  doble: 'Doble',
  suite: 'Suite Presidencial',
  king: 'King Size',
  queen: 'Queen Size',
}

export function getBedTypeDisplayName(
  id?: string | null,
  namesMap?: Record<string, string>
): string {
  if (!id || typeof id !== 'string') return 'General / Todas'
  const cleanId = id.trim()
  if (!cleanId) return 'General / Todas'

  if (namesMap && namesMap[cleanId]) {
    return namesMap[cleanId]
  }
  if (namesMap && namesMap[cleanId.toLowerCase()]) {
    return namesMap[cleanId.toLowerCase()]
  }

  const lower = cleanId.toLowerCase()
  if (KNOWN_BED_TYPE_NAMES[lower]) {
    return KNOWN_BED_TYPE_NAMES[lower]
  }

  // Si ya es un nombre formal con mayúsculas y espacios
  if (cleanId.includes(' ') && /[A-Z]/.test(cleanId) && !cleanId.includes('-')) {
    return cleanId
  }

  // Si es un UUID (ej: 8a3e7b1a-2c9d-4e8f-9a1b-3c4d5e6f7a8b)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId)
  if (isUuid) {
    return `Cama (${cleanId.slice(0, 8)}...)`
  }

  // Formatear slugs técnicos como 'room-type-matrimonial' -> 'Matrimonial'
  const formatted = cleanId
    .replace(/^room[-_]type[-_]/i, '')
    .replace(/^bed[-_]type[-_]/i, '')
    .replace(/^type[-_]bed[-_]/i, '')
    .replace(/^cama[-_]/i, 'Cama ')
    .replace(/[-_]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return formatted || cleanId
}
