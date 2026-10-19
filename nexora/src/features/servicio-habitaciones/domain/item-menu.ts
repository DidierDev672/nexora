/**
 * Modelo de Dominio para los productos y platillos individuales del menú de Room Service.
 * Mapea la estructura devuelta por GET /item-menu.
 */
export interface ItemMenuProducto {
  /** ID interno del producto (SOLO para desarrollador / claves técnicas, NUNCA visible al usuario) */
  id?: string
  /** ID de la categoría a la que pertenece (SOLO para desarrollador) */
  category_id?: string
  /** Nombre comercial del producto gastronómico */
  name: string
  /** Descripción detallada, notas de cata e ingredientes */
  description?: string
  /** Precio en pesos colombianos (COP) */
  price: number
  /** Porcentaje de impuesto aplicable (ej. 10%) */
  tax_percentage?: number
  /** Tiempo estimado de preparación en cocina (minutos) */
  prep_time?: number
  /** Indica si es apto para dietas vegetarianas */
  isVegetarian?: boolean
  /** Indica si es apto para dietas veganas */
  isVegan?: boolean
  /** URL pública de la fotografía o asset servido desde Supabase Storage */
  imageURL: string
  /** Hora de inicio del servicio (formato HH:mm) */
  start_time?: string
  /** Hora de finalización del servicio (formato HH:mm) */
  end_time?: string
  /** Estado de disponibilidad actual para pedidos */
  available?: boolean
  /** Usuario creador (SOLO para desarrollador / auditoría interna) */
  created_by?: string

  // Propiedades alternativas por resiliencia con el backend
  image_url?: string
  is_vegetarian?: boolean
  is_vegan?: boolean
}

/**
 * Formatea un valor numérico al formato oficial de la moneda colombiana (Peso Colombiano - COP).
 * Ejemplo: 5500 -> "$ 5.500" o "$ 5.500 COP"
 */
export function formatearMonedaCOP(valor: number): string {
  if (isNaN(valor) || valor === null || valor === undefined) {
    return '$ 0'
  }

  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor)
  } catch {
    return `$ ${Math.round(valor).toLocaleString('es-CO')}`
  }
}

/**
 * Resuelve la URL de la imagen del producto, garantizando siempre una URL válida y segura.
 */
export function resolverImagenProducto(producto: ItemMenuProducto): string {
  const url = producto.imageURL || producto.image_url
  if (url && typeof url === 'string' && url.trim().length > 0) {
    return url.trim()
  }
  return 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
}
