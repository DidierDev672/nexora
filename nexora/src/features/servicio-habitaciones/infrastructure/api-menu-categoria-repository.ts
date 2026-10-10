import axios from 'axios'
import { api } from '../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../shared/lib/status-code-validator'
import type { MenuCategoria } from '../domain/menu-categoria'

/**
 * Catálogo de respaldo gastronómico de alta calidad (fallback)
 * para garantizar continuidad visual si el backend local no está levantado.
 */
export const FALLBACK_MENU_CATEGORIAS: MenuCategoria[] = [
  {
    headquartes_id: '857476d852c2d215',
    sub_headquartes_id: '3964a679462f9efc',
    building_id: '161ecb4a52a33a52',
    name: 'Panadería y Repostería',
    description:
      'Croissants, pan artesanal, tortas, galletas y postres horneados cada día, para disfrutar en la cafetería o en la mesa del restaurante.',
    order: 24,
    asset:
      'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800',
    created_by: 'ariasdev672@gmail.com',
  },
  {
    headquartes_id: '857476d852c2d215',
    sub_headquartes_id: '3964a679462f9efc',
    building_id: '161ecb4a52a33a52',
    name: 'Bebidas y Coctelería de Autor',
    description:
      'Selección de cocteles de autor, vinos reserva, licores prémium y bebidas refrescantes con entrega directa a la habitación.',
    order: 17,
    asset:
      'https://images.pexels.com/photos/3136318/pexels-photo-3136318.jpeg?auto=compress&cs=tinysrgb&w=800',
    created_by: 'ariasdev672@gmail.com',
  },
  {
    headquartes_id: '857476d852c2d215',
    sub_headquartes_id: 'sub-2',
    building_id: '161ecb4a52a33a52',
    name: 'Desayunos Ejecutivos & Healthy',
    description:
      'Omelettes al gusto, frutas de estación, yogurt griego, tostadas integrales y café recién tostado para empezar la jornada.',
    order: 12,
    asset:
      'https://images.pexels.com/photos/101533/pexels-photo-101533.jpeg?auto=compress&cs=tinysrgb&w=800',
    created_by: 'ariasdev672@gmail.com',
  },
  {
    headquartes_id: '857476d852c2d215',
    sub_headquartes_id: '3964a679462f9efc',
    building_id: 'building-2',
    name: 'Cenas Gourmet & Alta Cocina',
    description:
      'Cortes de carne madurados, pastas caseras, risottos al funghi y maridajes exclusivos diseñados por el chef ejecutivo.',
    order: 35,
    asset:
      'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
    created_by: 'ariasdev672@gmail.com',
  },
]

export interface ObtenerMenuCategoriasRespuesta {
  categorias: MenuCategoria[]
  validation: StatusCodeValidationResult
  usandoFallback: boolean
}

/**
 * Consulta el endpoint GET /menu-category con Axios y valida la respuesta
 * con el validador estricto de códigos de estado HTTP del proyecto.
 */
export async function obtenerMenuCategoriasApi(): Promise<ObtenerMenuCategoriasRespuesta> {
  try {
    const response = await api.get('/menu-category', {
      validateStatus: () => true,
    })

    // Validación formal con status-code-validator
    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      let itemsCrudos: unknown[] = []

      if (Array.isArray(response.data)) {
        itemsCrudos = response.data
      } else if (response.data && typeof response.data === 'object') {
        const payload = response.data as Record<string, unknown>
        if (Array.isArray(payload.data)) {
          itemsCrudos = payload.data
        } else if (Array.isArray(payload.categories)) {
          itemsCrudos = payload.categories
        } else if (Array.isArray(payload.items)) {
          itemsCrudos = payload.items
        }
      }

      if (itemsCrudos.length > 0) {
        const categoriasMapeadas: MenuCategoria[] = itemsCrudos.map((item) => {
          const raw = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>
          const rawOrder = Number(raw.order)

          return {
            headquartes_id: String(raw.headquartes_id ?? raw.headquarter_id ?? '857476d852c2d215'),
            sub_headquartes_id: String(
              raw.sub_headquartes_id ?? raw.sub_headquarter_id ?? '3964a679462f9efc'
            ),
            building_id: String(raw.building_id ?? '161ecb4a52a33a52'),
            name: String(raw.name ?? 'Categoría de Servicio'),
            description: String(raw.description ?? ''),
            order: Number.isFinite(rawOrder) ? rawOrder : 1,
            asset: String(
              raw.asset ||
                'https://images.pexels.com/photos/1855214/pexels-photo-1855214.jpeg?auto=compress&cs=tinysrgb&w=800'
            ),
            created_by: raw.created_by ? String(raw.created_by) : undefined,
          }
        })

        return {
          categorias: categoriasMapeadas,
          validation,
          usandoFallback: false,
        }
      }
    }

    // Si el servidor devolvió éxito pero sin elementos o estructura vacía
    return {
      categorias: FALLBACK_MENU_CATEGORIAS,
      validation,
      usandoFallback: true,
    }
  } catch (error) {
    let status = 500
    if (axios.isAxiosError(error) && error.response?.status) {
      status = error.response.status
    } else if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      status = 408
    }

    const validation = validateStatusCode(status)

    return {
      categorias: FALLBACK_MENU_CATEGORIAS,
      validation,
      usandoFallback: true,
    }
  }
}
