/**
 * Tipos de dominio y utilidades para la información de Sedes y Subsedes asociadas a tarifas.
 */

export interface HeadquarterInfo {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface SubHeadquarterInfo {
  id: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export function translateSedeStatus(status?: string | null): string {
  if (!status) return 'Inactiva'
  const key = status.trim().toLowerCase()
  switch (key) {
    case 'active':
    case 'activo':
      return 'Activa'
    case 'inactive':
    case 'inactivo':
      return 'Inactiva'
    case 'maintenance':
    case 'mantenimiento':
      return 'En Mantenimiento'
    case 'pending':
    case 'pendiente':
      return 'Pendiente'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

/**
 * Diccionario de nombres oficiales de sedes conocidas del ecosistema Nexora.
 */
export const KNOWN_SEDES_NAMES: Record<string, string> = {
  'sede-central-miraflores': 'Sede Principal Miraflores',
  'sede-central': 'Hotel Nexora Central',
  'sede-san-isidro': 'Sede San Isidro Campestre',
  'sede-costa': 'Nexora Resort & Beach',
  'sede-valle': 'Nexora Boutique Valle',
  'sede-norte': 'Sede Norte Empresarial',
  'sede-sur': 'Sede Sur Campestre',
}

/**
 * Obtiene el nombre legible y amigable de una sede a partir de su ID o nombre previo.
 * Prioriza el diccionario dinámico del backend si está disponible, luego el catálogo
 * conocido y finalmente formatea el identificador como texto legible en Title Case.
 */
export function getSedeDisplayName(
  id?: string | null,
  namesMap?: Record<string, string>
): string {
  if (!id || typeof id !== 'string') return 'Sede General'
  const cleanId = id.trim()
  if (!cleanId) return 'Sede General'

  // 1. Si existe en el mapa dinámico recibido (ej: cache del endpoint /headquarters)
  if (namesMap && namesMap[cleanId]) {
    return namesMap[cleanId]
  }

  // 2. Si existe en el diccionario de sedes conocidas
  const lowerId = cleanId.toLowerCase()
  if (KNOWN_SEDES_NAMES[lowerId]) {
    return KNOWN_SEDES_NAMES[lowerId]
  }

  // 3. Si el ID ya es un nombre completo con espacios y mayúsculas
  if (cleanId.includes(' ') && /[A-Z]/.test(cleanId)) {
    return cleanId
  }

  // 4. Si es un slug tipo 'sede-...' o 'hotel-...', formatear en Title Case legible
  const formatted = cleanId
    .replace(/^sede[-_]/i, 'Sede ')
    .replace(/^sub[-_]/i, 'Sub-sede ')
    .replace(/[-_]/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return formatted || cleanId
}
