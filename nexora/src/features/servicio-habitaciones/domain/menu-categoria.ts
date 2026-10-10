/**
 * Modelo de Dominio para las categorías de menú de servicio a la habitación.
 * Mapea la estructura devuelta por GET /menu-category.
 */
export interface MenuCategoria {
  /** ID de la sede principal a la que pertenece la categoría */
  headquartes_id: string
  /** ID de la subsede asociada */
  sub_headquartes_id: string
  /** ID del edificio donde está disponible el servicio */
  building_id: string
  /** Nombre comercial o título de la categoría gastronómica */
  name: string
  /** Descripción detallada de platos, ingredientes y disponibilidad */
  description: string
  /** Número de orden o secuencia de visualización */
  order: number
  /** URL pública de la fotografía o asset digital */
  asset: string
  /** Correo o usuario que dio de alta la categoría */
  created_by?: string
}

/**
 * Diccionario de mapeo amigable para presentar nombres legibles en la UI
 * en lugar de códigos hash crudos, preservando el ID para la auditoría.
 */
export const MAPA_NOMBRES_CONOCIDOS: Record<string, string> = {
  // Sedes
  '857476d852c2d215': 'Sede Central',
  'hq-2': 'Sede Campestre Sol',
  'hq-3': 'Sede Playa Mirador',
  // Subsedes
  '3964a679462f9efc': 'Sede Norte',
  'sub-2': 'Sede Sur San Isidro',
  'sub-3': 'Anexo Valle Verde',
  'sub-4': 'Pabellón Costa Mar',
  // Edificios
  '161ecb4a52a33a52': 'Edificio A (Torre Principal)',
  'building-2': 'Edificio B (Torre Ejecutiva)',
  'building-3': 'Edificio C (Suites Presidenciales)',
}

/**
 * Resuelve el nombre legible de una sede, subsede o edificio; si no está en el mapa,
 * muestra un identificador acortado y elegante.
 */
export function resolverNombreEntidad(id: string, prefijoPorDefecto: string = 'Ubicación'): string {
  if (!id) return `${prefijoPorDefecto} General`
  if (MAPA_NOMBRES_CONOCIDOS[id]) {
    return MAPA_NOMBRES_CONOCIDOS[id]
  }
  // Si es un hash largo (hexadecimal), acortarlo para UX limpia
  if (id.length > 10) {
    return `${prefijoPorDefecto} · ${id.slice(0, 6)}…${id.slice(-4)}`
  }
  return `${prefijoPorDefecto} #${id}`
}
