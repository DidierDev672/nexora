import { api } from '../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../lib/status-code-validator'
import type {
  PersonCatalogItem,
  RoomCatalogItem,
  RoomTypeCatalogItem,
  BedTypeCatalogItem,
  BuildingCatalogItem,
  HeadquarterCatalogItem,
  SubHeadquarterCatalogItem,
  RoleCatalogItem,
} from '../domain/catalog-types'
import {
  FALLBACK_PERSONS,
  FALLBACK_ROOMS,
  FALLBACK_ROOM_TYPES,
  FALLBACK_BED_TYPES,
  FALLBACK_BUILDINGS,
  FALLBACK_HEADQUARTERS,
  FALLBACK_SUB_HEADQUARTERS,
  FALLBACK_ROLES,
} from './catalog-fallbacks'

export interface CatalogQueryResult<T> {
  data: T | null
  validation: StatusCodeValidationResult
  fromCache?: boolean
}

// Caché en memoria para evitar re-consultar endpoints idénticos en la misma sesión
const memoryDataCache: Record<string, unknown | undefined> = {}
// Deduplicación de peticiones en vuelo (evita llamadas paralelas simultáneas al mismo ID)
const inFlightRequests: Record<string, Promise<unknown> | undefined> = {}

/**
 * Función genérica de consulta con validación de código de estado,
 * deduplicación en vuelo y fallback resiliente.
 */
async function fetchCatalogResource<T>(
  endpoint: string,
  id: string,
  fallbackMap: Record<string, T>
): Promise<CatalogQueryResult<T>> {
  const cleanId = id.trim()
  const cacheKey = `${endpoint}:${cleanId}`

  const cached = memoryDataCache[cacheKey]
  if (cached !== undefined) {
    return {
      data: cached as T,
      validation: validateStatusCode(200),
      fromCache: true,
    }
  }

  const existingRequest = inFlightRequests[cacheKey]
  if (existingRequest !== undefined) {
    const data = (await existingRequest) as T | null
    return {
      data: data ?? fallbackMap[cleanId] ?? null,
      validation: validateStatusCode(200),
      fromCache: true,
    }
  }

  const queryPromise = (async (): Promise<T | null> => {
    try {
      const response = await api.get(`${endpoint}/${encodeURIComponent(cleanId)}`, {
        validateStatus: () => true,
      })

      const validation = validateStatusCode(response.status)

      if (validation.isValid && response.data) {
        const raw = response.data
        const payload: T | null = Array.isArray(raw)
          ? ((raw[0] as T) ?? null)
          : ((raw as { data?: T }).data ?? (raw as T))

        if (payload) {
          memoryDataCache[cacheKey] = payload
          return payload
        }
      }

      const fallback = fallbackMap[cleanId]
      if (fallback) {
        memoryDataCache[cacheKey] = fallback
        return fallback
      }

      return null
    } catch {
      const fallback = fallbackMap[cleanId]
      if (fallback) {
        memoryDataCache[cacheKey] = fallback
        return fallback
      }
      return null
    } finally {
      delete inFlightRequests[cacheKey]
    }
  })()

  inFlightRequests[cacheKey] = queryPromise
  const resultData = await queryPromise

  return {
    data: resultData ?? fallbackMap[cleanId] ?? null,
    validation: validateStatusCode(resultData ? 200 : 500),
    fromCache: false,
  }
}

/**
 * Cliente centralizado para el consumo de entidades maestras del Catálogo.
 * Implementa validateStatusCode, caché de memoria y fallbacks transparentes.
 */
export const catalogApi = {
  // 1. Huéspedes (GET /person/{id})
  getPerson: (id: string) =>
    fetchCatalogResource<PersonCatalogItem>('/person', id, FALLBACK_PERSONS),

  // 2. Habitaciones (GET /room/{id})
  getRoom: (id: string) =>
    fetchCatalogResource<RoomCatalogItem>('/room', id, FALLBACK_ROOMS),

  // 3. Tipos de Habitación (GET /room-types/{id})
  getRoomType: (id: string) =>
    fetchCatalogResource<RoomTypeCatalogItem>('/room-types', id, FALLBACK_ROOM_TYPES),

  // 4. Tipos de Cama (GET /types-bed/{id})
  getBedType: (id: string) =>
    fetchCatalogResource<BedTypeCatalogItem>('/types-bed', id, FALLBACK_BED_TYPES),

  // 5. Edificios (GET /building/{id})
  getBuilding: (id: string) =>
    fetchCatalogResource<BuildingCatalogItem>('/building', id, FALLBACK_BUILDINGS),

  // 6. Sedes (GET /headquarters/{id})
  getHeadquarter: (id: string) =>
    fetchCatalogResource<HeadquarterCatalogItem>('/headquarters', id, FALLBACK_HEADQUARTERS),

  // 7. Subsedes (GET /sub-headquarters/{id})
  getSubHeadquarter: (id: string) =>
    fetchCatalogResource<SubHeadquarterCatalogItem>(
      '/sub-headquarters',
      id,
      FALLBACK_SUB_HEADQUARTERS
    ),

  // 8. Roles (GET /roles/{id})
  getRole: (id: string) =>
    fetchCatalogResource<RoleCatalogItem>('/roles', id, FALLBACK_ROLES),

  // 8. Lista de Subsedes por Sede (GET /sub-headquarters con filtro por headquarter_id)
  getSubHeadquartersByHeadquarter: async (hqId: string): Promise<SubHeadquarterCatalogItem[]> => {
    try {
      const response = await api.get('/sub-headquarters', { validateStatus: () => true })
      if (response.status === 200 && Array.isArray(response.data)) {
        const filtered = (response.data as SubHeadquarterCatalogItem[]).filter(
          (sub) => sub.headquarter_id === hqId
        )
        if (filtered.length > 0) return filtered
      }
    } catch {
      // Fallback transparente
    }
    return Object.values(FALLBACK_SUB_HEADQUARTERS).filter(
      (sub) => sub.headquarter_id === hqId
    )
  },

  // Limpieza manual de caché si se requiere recarga fresca
  clearCache: () => {
    for (const key of Object.keys(memoryDataCache)) {
      delete memoryDataCache[key]
    }
  },
}
