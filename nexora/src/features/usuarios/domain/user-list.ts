/**
 * Dominio de Usuarios para el Directorio y Gestión de Personal.
 *
 * Reglas de diseño y ética:
 * - Contratos estrictos para la API (GET /users)
 * - Prohibición de exposición de identificadores técnicos (IDs) en la experiencia de usuario.
 * - Textos, estados y roles 100% en español para el usuario.
 * - Nombres técnicos y código en inglés para el desarrollador.
 */

export interface UserItem {
  id: string
  name: string
  email: string
  role_id: string
  headquarters_id: string
  sub_headquarters_id: string | null
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export type UsersViewMode = 'card' | 'table'

export interface UserStatusVisualConfig {
  label: string
  colorClasses: string
  dotClass: string
  bgClass: string
}

/**
 * Traduce el estado técnico de la API a una etiqueta amigable en español
 * y genera las clases estéticas semánticas inspiradas en MUI Chips.
 */
export function getUserStatusConfig(status?: string | null): UserStatusVisualConfig {
  const normalized = (status || '').trim().toLowerCase()

  switch (normalized) {
    case 'active':
    case 'activo':
      return {
        label: 'Activo',
        colorClasses: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
        bgClass: 'bg-emerald-500/10',
        dotClass: 'bg-emerald-500 animate-pulse',
      }
    case 'inactive':
    case 'inactivo':
      return {
        label: 'Inactivo',
        colorClasses: 'border-neutral-500/30 text-neutral-600 dark:text-neutral-400',
        bgClass: 'bg-neutral-500/10',
        dotClass: 'bg-neutral-400',
      }
    case 'suspended':
    case 'suspendido':
    case 'locked':
      return {
        label: 'Suspendido',
        colorClasses: 'border-rose-500/30 text-rose-700 dark:text-rose-400',
        bgClass: 'bg-rose-500/10',
        dotClass: 'bg-rose-500',
      }
    case 'pending':
    case 'pendiente':
      return {
        label: 'Pendiente',
        colorClasses: 'border-amber-500/30 text-amber-700 dark:text-amber-400',
        bgClass: 'bg-amber-500/10',
        dotClass: 'bg-amber-500',
      }
    default:
      return {
        label: 'Activo',
        colorClasses: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
        bgClass: 'bg-emerald-500/10',
        dotClass: 'bg-emerald-500',
      }
  }
}

/**
 * Mapeo de roles técnicos a nombres profesionales legibles en español.
 * Evita la exposición de cadenas como "role-1" al usuario final.
 */
const ROLE_NAMES_DICTIONARY: Record<string, string> = {
  'role-1': 'Recepción',
  'role-2': 'Administrador',
  'role-3': 'Supervisor',
  'role-admin': 'Administrador General',
  'role-reception': 'Recepción',
  'role-manager': 'Gerente de Sede',
  'role-auditor': 'Auditor Interno',
  'role-housekeeping': 'Gobernanta / Limpieza',
  'admin': 'Administrador',
  'recepcion': 'Recepción',
  'recepcionista': 'Recepción',
  'gerente': 'Gerente',
  'supervisor': 'Supervisor',
}

export function formatFriendlyRoleName(roleIdOrName?: string | null): string {
  if (!roleIdOrName) return 'Usuario del Sistema'
  const key = roleIdOrName.trim().toLowerCase()
  if (ROLE_NAMES_DICTIONARY[key]) return ROLE_NAMES_DICTIONARY[key]
  if (ROLE_NAMES_DICTIONARY[roleIdOrName.trim()]) return ROLE_NAMES_DICTIONARY[roleIdOrName.trim()]

  // Regla de oro: si es un ID técnico numérico, hash o UUID, nunca exponerlo al usuario
  if (
    /^role[-_]?\d+$/i.test(roleIdOrName) ||
    /^\d+$/.test(roleIdOrName) ||
    /^[0-9a-f-]{10,}$/i.test(roleIdOrName)
  ) {
    return 'Rol Asignado'
  }

  // Si viene un nombre de rol como "role-recepcion", humanizarlo
  return roleIdOrName
    .replace(/^role[-_]?/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Rol Asignado'
}

/**
 * Mapeo amigable para sedes sin exponer IDs técnicos ("hq-1").
 */
const HEADQUARTERS_NAMES_DICTIONARY: Record<string, string> = {
  'hq-1': 'Sede Central',
  'hq-central': 'Sede Principal Centro',
  'hq-norte': 'Sede Norte',
  'hq-sur': 'Sede Sur',
  'sede-01': 'Sede Principal',
  'sede-02': 'Sede Campestre',
}

export function formatFriendlyHeadquarterName(hqIdOrName?: string | null): string {
  if (!hqIdOrName) return 'Sede no asignada'
  const key = hqIdOrName.trim().toLowerCase()
  if (HEADQUARTERS_NAMES_DICTIONARY[key]) return HEADQUARTERS_NAMES_DICTIONARY[key]
  if (HEADQUARTERS_NAMES_DICTIONARY[hqIdOrName.trim()]) return HEADQUARTERS_NAMES_DICTIONARY[hqIdOrName.trim()]

  return hqIdOrName
    .replace(/^hq[-_]?/i, 'Sede ')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Mapeo amigable para subsedes sin exponer IDs técnicos ("shq-1").
 */
const SUB_HEADQUARTERS_NAMES_DICTIONARY: Record<string, string> = {
  'shq-1': 'Subsede Norte',
  'shq-2': 'Torre Ejecutiva',
  'sub-01': 'Anexo Comercial',
}

export function formatFriendlySubHeadquarterName(subHqIdOrName?: string | null): string {
  if (!subHqIdOrName) return 'Sin subsede asignada'
  const key = subHqIdOrName.trim().toLowerCase()
  if (SUB_HEADQUARTERS_NAMES_DICTIONARY[key]) return SUB_HEADQUARTERS_NAMES_DICTIONARY[key]
  if (SUB_HEADQUARTERS_NAMES_DICTIONARY[subHqIdOrName.trim()]) return SUB_HEADQUARTERS_NAMES_DICTIONARY[subHqIdOrName.trim()]

  return subHqIdOrName
    .replace(/^shq[-_]?/i, 'Subsede ')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
