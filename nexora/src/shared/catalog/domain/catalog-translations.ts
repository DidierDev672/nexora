/**
 * Utilidades de traducción y formateo lingüístico 100% en español.
 * Garantiza que la experiencia de usuario nunca exponga términos técnicos,
 * nombres en inglés o códigos de base de datos.
 */

export interface StatusVisualConfig {
  label: string
  colorClasses: string
  dotClass: string
}

/**
 * Traduce cualquier estado técnico a español comprensible y estilizado.
 */
export function translateCatalogStatus(status?: string | null): StatusVisualConfig {
  const s = (status || '').trim().toLowerCase()

  if (s === 'active' || s === 'activo' || s === 'available' || s === 'disponible') {
    return {
      label: 'Activo / Disponible',
      colorClasses: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      dotClass: 'bg-emerald-500',
    }
  }

  if (s === 'occupied' || s === 'ocupada' || s === 'ocupado') {
    return {
      label: 'Ocupada',
      colorClasses: 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400',
      dotClass: 'bg-blue-500',
    }
  }

  if (s === 'maintenance' || s === 'mantenimiento') {
    return {
      label: 'En mantenimiento',
      colorClasses: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400',
      dotClass: 'bg-amber-500',
    }
  }

  if (s === 'cleaning' || s === 'limpieza') {
    return {
      label: 'En limpieza',
      colorClasses: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-400',
      dotClass: 'bg-cyan-500',
    }
  }

  if (s === 'reserved' || s === 'reservada' || s === 'reservado') {
    return {
      label: 'Reservada',
      colorClasses: 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-400',
      dotClass: 'bg-purple-500',
    }
  }

  if (s === 'inactive' || s === 'inactivo' || s === 'disabled') {
    return {
      label: 'Inactivo',
      colorClasses: 'border-neutral-500/30 bg-neutral-500/10 text-neutral-700 dark:text-neutral-400',
      dotClass: 'bg-neutral-500',
    }
  }

  return {
    label: 'Activo',
    colorClasses: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  }
}

/**
 * Traduce y formatea nombres de tipos de habitación conocidos si se recibe un identificador.
 */
export function formatFriendlyRoomTypeName(nameOrId?: string | null): string {
  if (!nameOrId) return 'Estándar'
  const clean = nameOrId.trim()
  const map: Record<string, string> = {
    'type-1': 'Suite Deluxe',
    'type-2': 'Doble Superior',
    'type-3': 'Habitación Familiar',
    'type-presidential': 'Suite Presidencial Real',
    'type-family': 'Familiar Premium',
    'suite': 'Suite Ejecutiva',
    'standard': 'Estándar Clásica',
    'single': 'Individual',
    'double': 'Doble',
    'matrimonial': 'Matrimonial',
    'deluxe': 'De Lujo',
  }

  return map[clean.toLowerCase()] || map[clean] || clean.replace(/^type[-_]?/i, 'Tipo ').replace(/[-_]/g, ' ')
}

/**
 * Traduce y formatea nombres de edificios conocidos si se recibe un identificador.
 */
export function formatFriendlyBuildingName(nameOrId?: string | null): string {
  if (!nameOrId) return 'Torre Principal'
  const clean = nameOrId.trim()
  const map: Record<string, string> = {
    'building-1': 'Torre A - Principal',
    'building-2': 'Torre B - Norte',
    'building-3': 'Torre C - Sur',
    'torre-1': 'Torre 1',
    'torre-2': 'Torre 2',
    'edificio-1': 'Edificio Central',
  }

  return map[clean.toLowerCase()] || map[clean] || clean.replace(/^building[-_]?/i, 'Torre ').replace(/[-_]/g, ' ')
}

/**
 * Formatea valores numéricos en formato de moneda colombiana (COP).
 */
export function formatCOP(amount?: number | null): string {
  if (amount == null || Number.isNaN(amount)) return '$ 0 COP'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}
