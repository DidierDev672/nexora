import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import {
  compareRoomNumbersDesc,
  type RawBedTypeData,
  type RawBuildingData,
  type RawRoomData,
} from '../domain/habitacion-lista'

// Cache persistente fuera del ciclo de vida de componentes para evitar peticiones duplicadas (N+1)
const buildingCache = new Map<string, { name: string; floorNumber?: number; headquartersId?: string; subHeadquartersId?: string }>()
const buildingPromises = new Map<string, Promise<{ name: string; floorNumber?: number; headquartersId?: string; subHeadquartersId?: string } | null>>()

const bedCache = new Map<string, { name: string; capacityPeople?: number }>()
const bedPromises = new Map<string, Promise<{ name: string; capacityPeople?: number } | null>>()

/**
 * Función utilitaria para esperar milisegundos (backoff)
 */
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Petición con reintento automático (1 reintento con backoff corto)
 */
async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 1, delayMs = 350): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries <= 0) throw error
    await wait(delayMs)
    return fetchWithRetry(fn, retries - 1, delayMs * 1.5)
  }
}

export class ApiHabitacionListaRepository {
  /**
   * Obtiene la lista cruda de habitaciones desde GET /room
   * y las ordena de mayor a menor según su número.
   */
  async getRooms(): Promise<RawRoomData[]> {
    const response = await api.get<unknown>('/room', {
      validateStatus: (status) => status >= 200 && status < 300,
    })

    let list: RawRoomData[] = []

    if (Array.isArray(response.data)) {
      list = response.data as RawRoomData[]
    } else if (
      response.data &&
      typeof response.data === 'object' &&
      Array.isArray((response.data as { data?: unknown[] }).data)
    ) {
      list = (response.data as { data: RawRoomData[] }).data
    }

    return [...list].sort((a, b) => compareRoomNumbersDesc(a.number, b.number))
  }

  /**
   * Obtiene y enriquece los datos del edificio (GET /building/{id}) con caché y deduplicación en vuelo
   */
  async getBuilding(id: string): Promise<{
    name: string
    floorNumber?: number
    headquartersId?: string
    subHeadquartersId?: string
  } | null> {
    const cleanId = String(id).trim()
    if (!cleanId) return null

    // 1. Revisar caché en memoria
    if (buildingCache.has(cleanId)) {
      return buildingCache.get(cleanId)!
    }

    // 2. Si hay una petición en curso para este mismo edificio, reutilizarla
    if (buildingPromises.has(cleanId)) {
      return buildingPromises.get(cleanId)!
    }

    // 3. Crear nueva promesa deduplicada
    const promise = fetchWithRetry(async () => {
      const response = await api.get<unknown>(`/building/${cleanId}`, {
        validateStatus: (status) => status === 200,
      })

      const raw = response.data as RawBuildingData | { data?: RawBuildingData }
      const item: RawBuildingData =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as RawBuildingData)
          : (raw as RawBuildingData)

      const result = {
        name: typeof item?.name === 'string' && item.name.trim() ? item.name.trim() : 'Edificio',
        floorNumber: typeof item?.floor_number === 'number' ? item.floor_number : undefined,
        headquartersId: typeof item?.headquarters_id === 'string' ? item.headquarters_id : undefined,
        subHeadquartersId: typeof item?.sub_headquarters_id === 'string' ? item.sub_headquarters_id : undefined,
      }

      buildingCache.set(cleanId, result)
      return result
    })
      .catch((error) => {
        // En caso de error, removemos la promesa para permitir reintentos puntuales
        buildingPromises.delete(cleanId)
        throw error
      })
      .finally(() => {
        buildingPromises.delete(cleanId)
      })

    buildingPromises.set(cleanId, promise)
    return promise
  }

  /**
   * Obtiene y enriquece los datos del tipo de cama (GET /types-bed/{id}) con respaldo a /room-types/{id}
   */
  async getBedType(id: string): Promise<{
    name: string
    capacityPeople?: number
  } | null> {
    const cleanId = String(id).trim()
    if (!cleanId) return null

    // 1. Revisar caché en memoria
    if (bedCache.has(cleanId)) {
      return bedCache.get(cleanId)!
    }

    // 2. Si ya hay una promesa en curso para este ID, compartirla
    if (bedPromises.has(cleanId)) {
      return bedPromises.get(cleanId)!
    }

    // 3. Crear promesa deduplicada
    const promise = fetchWithRetry(async () => {
      try {
        const response = await api.get<unknown>(`/types-bed/${cleanId}`, {
          validateStatus: (status) => status === 200,
        })
        const raw = response.data as RawBedTypeData | { data?: RawBedTypeData }
        const item: RawBedTypeData =
          raw && typeof raw === 'object' && 'data' in raw && raw.data
            ? (raw.data as RawBedTypeData)
            : (raw as RawBedTypeData)

        const cap =
          typeof item?.capacity_people === 'number'
            ? item.capacity_people
            : typeof item?.capacity === 'number'
              ? item.capacity
              : undefined

        const result = {
          name: typeof item?.name === 'string' && item.name.trim() ? item.name.trim() : 'Cama estándar',
          capacityPeople: cap,
        }

        bedCache.set(cleanId, result)
        return result
      } catch (err) {
        // Fallback a /room-types/{id} si el endpoint es del tipo de habitación en vez de cama
        const is404 = isAxiosError(err) && err.response?.status === 404
        if (is404) {
          const fallbackResp = await api.get<unknown>(`/room-types/${cleanId}`, {
            validateStatus: (status) => status === 200,
          })
          const fRaw = fallbackResp.data as RawBedTypeData | { data?: RawBedTypeData }
          const fItem =
            fRaw && typeof fRaw === 'object' && 'data' in fRaw && fRaw.data
              ? (fRaw.data as RawBedTypeData)
              : (fRaw as RawBedTypeData)

          const fCap =
            typeof fItem?.capacity_people === 'number'
              ? fItem.capacity_people
              : typeof fItem?.capacity === 'number'
                ? fItem.capacity
                : undefined

          const result = {
            name: typeof fItem?.name === 'string' && fItem.name.trim() ? fItem.name.trim() : 'Habitación estándar',
            capacityPeople: fCap,
          }
          bedCache.set(cleanId, result)
          return result
        }
        throw err
      }
    })
      .catch((error) => {
        bedPromises.delete(cleanId)
        throw error
      })
      .finally(() => {
        bedPromises.delete(cleanId)
      })

    bedPromises.set(cleanId, promise)
    return promise
  }

  /**
   * Forzar reintento de un edificio puntual (limpia caché para ese ID)
   */
  invalidateBuilding(id: string) {
    buildingCache.delete(id)
    buildingPromises.delete(id)
  }

  /**
   * Forzar reintento de un tipo de cama puntual (limpia caché para ese ID)
   */
  invalidateBed(id: string) {
    bedCache.delete(id)
    bedPromises.delete(id)
  }
}
