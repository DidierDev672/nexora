import { useCallback, useEffect, useRef, useState } from 'react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'

export interface RoomTariffCheckStatus {
  roomId: string
  hasTariff: boolean
  statusCode: number
  rateId?: string | null
  price?: number | null
  name?: string | null
}

interface ExtractedTariff {
  activeTariff: Record<string, unknown> | null
  rateId: string | null
  price: number | null
  name: string | null
}

function isInactiveStatus(statusVal: unknown): boolean {
  if (typeof statusVal !== 'string') return false
  const s = statusVal.toLowerCase().trim()
  return [
    'inactive',
    'inactivo',
    'cancelled',
    'cancelado',
    'disabled',
    'desactivado',
    'deleted',
    'eliminado',
  ].includes(s)
}

function isValidTariffCandidate(item: unknown): item is Record<string, unknown> {
  if (!item || typeof item !== 'object') return false
  const rec = item as Record<string, unknown>

  // 1. Si el estado es explícitamente inactivo o cancelado, no es una tarifa activa
  if (isInactiveStatus(rec.status)) return false

  // 2. Extraer datos anidados si existen
  const nested = rec.data as Record<string, unknown> | undefined
  const rateObj = (rec.rate || rec.tarifa || nested?.rate || nested?.tarifa) as
    | Record<string, unknown>
    | undefined

  // 3. Verificar si posee referencia explícita a una tarifa
  const hasExplicitRateRef = Boolean(
    rec.rate_id ||
    rec.rateId ||
    rec.tarifa_id ||
    rec.tarifaId ||
    nested?.rate_id ||
    nested?.rateId ||
    rateObj?.id
  )

  if (hasExplicitRateRef) return true

  // 4. Si tiene relación con habitación y un id o rate válido
  if (rec.room_id != null && (rec.id != null || rec.rate != null || rec.tarifa != null)) {
    return true
  }

  // 5. Si es directamente un registro de tarifa de catálogo (con precio o modalidad)
  const isDirectRateObject =
    rec.id != null &&
    (rec.price != null ||
      rec.precio != null ||
      rec.modality != null ||
      rec.duration_units != null ||
      (typeof rec.name === 'string' && rec.name.trim().length > 0 && rec.created_at != null))

  if (isDirectRateObject) return true

  return false
}

function parseTariffValues(target: Record<string, unknown>): {
  rateId: string | null
  price: number | null
  name: string | null
} {
  const nested = target.data as Record<string, unknown> | undefined
  const rateObj = (target.rate || target.tarifa || nested?.rate || nested?.tarifa) as
    | Record<string, unknown>
    | undefined

  const rawRateId =
    target.rate_id ||
    target.rateId ||
    target.tarifa_id ||
    target.tarifaId ||
    nested?.rate_id ||
    nested?.rateId ||
    rateObj?.id ||
    target.id

  const rateId = rawRateId ? String(rawRateId) : null

  let price: number | null = null
  const rawPrice = target.price ?? target.precio ?? nested?.price ?? rateObj?.price
  if (typeof rawPrice === 'number') {
    price = rawPrice
  } else if (typeof rawPrice === 'string') {
    const parsed = parseFloat(rawPrice.replace(',', '.'))
    if (!isNaN(parsed)) price = parsed
  }

  let name: string | null = null
  const rawName = target.name ?? target.nombre ?? nested?.name ?? rateObj?.name
  if (typeof rawName === 'string' && rawName.trim().length > 0) {
    name = rawName.trim()
  }

  return { rateId, price, name }
}

/**
 * Inspecciona minuciosamente la respuesta de /room_tariffs/by-room/{room_id}
 * para determinar si realmente contiene una tarifa activa asignada a la habitación.
 */
function extractActiveTariff(data: unknown): ExtractedTariff {
  if (!data || typeof data !== 'object') {
    return { activeTariff: null, rateId: null, price: null, name: null }
  }

  // 1. Si la respuesta es un arreglo directamente
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return { activeTariff: null, rateId: null, price: null, name: null }
    }
    const candidates = data.filter(isValidTariffCandidate)
    if (candidates.length === 0) {
      return { activeTariff: null, rateId: null, price: null, name: null }
    }
    const chosen =
      candidates.find(
        (c) =>
          c.is_default === true ||
          c.is_default === 1 ||
          c.default === true ||
          c.isDefault === true
      ) || candidates[0]

    const parsed = parseTariffValues(chosen)
    return {
      activeTariff: chosen,
      ...parsed,
    }
  }

  const obj = data as Record<string, unknown>

  // 2. Si viene envuelto en una propiedad de tipo arreglo (data, room_tariffs, tariffs, results, items)
  const arrayProps = ['data', 'room_tariffs', 'tariffs', 'results', 'items']
  for (const prop of arrayProps) {
    if (Array.isArray(obj[prop])) {
      const arr = obj[prop] as unknown[]
      if (arr.length === 0) {
        return { activeTariff: null, rateId: null, price: null, name: null }
      }
      const candidates = arr.filter(isValidTariffCandidate)
      if (candidates.length === 0) {
        return { activeTariff: null, rateId: null, price: null, name: null }
      }
      const chosen =
        candidates.find(
          (c) =>
            c.is_default === true ||
            c.is_default === 1 ||
            c.default === true ||
            c.isDefault === true
        ) || candidates[0]

      const parsed = parseTariffValues(chosen)
      return {
        activeTariff: chosen,
        ...parsed,
      }
    }
  }

  // 3. Si viene envuelto en un objeto anidado en obj.data
  if (obj.data && typeof obj.data === 'object' && !Array.isArray(obj.data)) {
    const nestedObj = obj.data as Record<string, unknown>
    if (isValidTariffCandidate(nestedObj)) {
      const parsed = parseTariffValues(nestedObj)
      return {
        activeTariff: nestedObj,
        ...parsed,
      }
    }
    return { activeTariff: null, rateId: null, price: null, name: null }
  }

  // 4. Si es un único objeto plano
  if (isValidTariffCandidate(obj)) {
    const parsed = parseTariffValues(obj)
    return {
      activeTariff: obj,
      ...parsed,
    }
  }

  return { activeTariff: null, rateId: null, price: null, name: null }
}

/**
 * Consulta el endpoint /room_tariffs/by-room/{room_id} y valida
 * el código de estado retornado mediante un switch exhaustivo.
 *
 * Si el código es 200 y existe una tarifa activa vinculada -> hasTariff: true.
 * Si el código es 200 pero viene vacío ([] o null) o cualquier otro código -> hasTariff: false.
 */
export async function verificarTarifaHabitacion(roomId: string): Promise<RoomTariffCheckStatus> {
  const cleanId = String(roomId).trim()
  if (!cleanId) {
    return { roomId, hasTariff: false, statusCode: 400 }
  }

  try {
    const response = await api.get(`/room_tariffs/by-room/${encodeURIComponent(cleanId)}`, {
      validateStatus: () => true, // Permite capturar cualquier código de respuesta sin que Axios lance excepción
    })

    const statusCode = response.status

    switch (statusCode) {
      case 200: {
        // En status 200, analizamos el cuerpo retornado:
        // Solamente si contiene una tarifa válida y activa marcamos hasTariff: true.
        const { activeTariff, rateId, price, name } = extractActiveTariff(response.data)

        if (activeTariff) {
          return {
            roomId: cleanId,
            hasTariff: true,
            statusCode: 200,
            rateId,
            price,
            name,
          }
        }

        // Si el status es 200 pero la respuesta viene vacía ([]), nula o con registros inactivos
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode: 200,
          rateId: null,
          price: null,
          name: null,
        }
      }

      case 204:
        // Status 204: Sin contenido (no tiene tarifa aplicada)
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode: 204,
          rateId: null,
          price: null,
          name: null,
        }

      case 404:
        // Status 404: No se encontraron tarifas aplicadas a esta habitación
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode: 404,
          rateId: null,
          price: null,
          name: null,
        }

      case 400:
        // Status 400: Solicitud con parámetros o formato de id incorrecto
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode: 400,
          rateId: null,
          price: null,
          name: null,
        }

      case 422:
        // Status 422: Entidad no procesable
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode: 422,
          rateId: null,
          price: null,
          name: null,
        }

      case 500:
        // Status 500: Error interno del servidor
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode: 500,
          rateId: null,
          price: null,
          name: null,
        }

      default:
        // Cualquier otro status code diferente hace referencia a que no tiene tarifa aplicada
        return {
          roomId: cleanId,
          hasTariff: false,
          statusCode,
          rateId: null,
          price: null,
          name: null,
        }
    }
  } catch (error: unknown) {
    let statusCode = 0
    if (isAxiosError(error)) {
      statusCode = error.response?.status ?? 0
    }

    return {
      roomId: cleanId,
      hasTariff: false,
      statusCode,
      rateId: null,
      price: null,
      name: null,
    }
  }
}

export interface UseVerificarHabitacionesTarifasOptions {
  /**
   * Colección de habitaciones visibles en la tabla o lista
   */
  rooms?: Array<{ id: string }>
}

export function useVerificarHabitacionesTarifas({ rooms = [] }: UseVerificarHabitacionesTarifasOptions = {}) {
  // Mapa de roomId -> boolean indicando si tiene tarifa aplicada
  const [tariffsByRoom, setTariffsByRoom] = useState<Record<string, boolean>>({})
  // Mapa de roomId -> rateId de la tarifa aplicada
  const [rateIdsByRoom, setRateIdsByRoom] = useState<Record<string, string>>({})
  // Mapa de roomId -> precio numérico de la tarifa aplicada
  const [pricesByRoom, setPricesByRoom] = useState<Record<string, number>>({})
  // Mapa de roomId -> nombre de la tarifa aplicada
  const [namesByRoom, setNamesByRoom] = useState<Record<string, string>>({})
  // Mapa de roomId -> statusCode retornado por el endpoint
  const [statusCodesByRoom, setStatusCodesByRoom] = useState<Record<string, number>>({})
  const [isVerifying, setIsVerifying] = useState(false)

  // Referencia para evitar re-consultar habitaciones que ya fueron verificadas
  const checkedRoomsRef = useRef<Set<string>>(new Set())
  const ratesCatalogRef = useRef<Record<string, { id: string; name: string; price: number }>>({})
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Obtiene o consulta el catálogo de tarifas disponibles (/rates) para
   * asegurar que siempre tengamos el precio y nombre de cualquier tarifa asociada.
   */
  const fetchRatesCatalog = useCallback(async () => {
    if (Object.keys(ratesCatalogRef.current).length > 0) return ratesCatalogRef.current
    try {
      const res = await api.get<unknown>('/rates', {
        validateStatus: (status) => status >= 200 && status < 300,
      })
      const list = Array.isArray(res.data)
        ? res.data
        : res.data && typeof res.data === 'object' && Array.isArray((res.data as Record<string, unknown>).data)
          ? ((res.data as Record<string, unknown>).data as unknown[])
          : []

      const map: Record<string, { id: string; name: string; price: number }> = {}
      list.forEach((raw) => {
        const item = raw as Record<string, unknown>
        if (item && item.id != null) {
          const rawPrice = item.price
          let price = 0
          if (typeof rawPrice === 'number') price = rawPrice
          else if (typeof rawPrice === 'string') {
            const p = parseFloat(rawPrice.replace(',', '.'))
            if (!isNaN(p)) price = p
          }
          map[String(item.id)] = {
            id: String(item.id),
            name: typeof item.name === 'string' ? item.name : 'Tarifa',
            price,
          }
        }
      })
      ratesCatalogRef.current = map
      return map
    } catch {
      return ratesCatalogRef.current
    }
  }, [])

  /**
   * Ejecuta la verificación para una lista de IDs de habitación
   */
  const triggerVerificar = useCallback(
    async (roomIds: string[]) => {
      const validIds = roomIds
        .map((id) => String(id).trim())
        .filter((id) => id.length > 0)

      if (validIds.length === 0) return

      setIsVerifying(true)

      // Marcamos los IDs en el Set de ya revisados
      validIds.forEach((id) => checkedRoomsRef.current.add(id))

      try {
        const [results, catalog] = await Promise.all([
          Promise.all(validIds.map((id) => verificarTarifaHabitacion(id))),
          fetchRatesCatalog(),
        ])

        if (!isMountedRef.current) return

        setTariffsByRoom((prev) => {
          const next = { ...prev }
          results.forEach((r) => {
            next[r.roomId] = r.hasTariff
          })
          return next
        })

        setRateIdsByRoom((prev) => {
          const next = { ...prev }
          results.forEach((r) => {
            if (r.hasTariff && r.rateId) {
              next[r.roomId] = r.rateId
            } else {
              delete next[r.roomId]
            }
          })
          return next
        })

        setPricesByRoom((prev) => {
          const next = { ...prev }
          results.forEach((r) => {
            if (r.hasTariff) {
              const resolvedPrice =
                r.price != null
                  ? r.price
                  : r.rateId && catalog[r.rateId]
                    ? catalog[r.rateId].price
                    : null
              if (resolvedPrice != null) {
                next[r.roomId] = resolvedPrice
              } else {
                delete next[r.roomId]
              }
            } else {
              delete next[r.roomId]
            }
          })
          return next
        })

        setNamesByRoom((prev) => {
          const next = { ...prev }
          results.forEach((r) => {
            if (r.hasTariff) {
              const resolvedName =
                r.name != null
                  ? r.name
                  : r.rateId && catalog[r.rateId]
                    ? catalog[r.rateId].name
                    : null
              if (resolvedName != null) {
                next[r.roomId] = resolvedName
              } else {
                delete next[r.roomId]
              }
            } else {
              delete next[r.roomId]
            }
          })
          return next
        })

        setStatusCodesByRoom((prev) => {
          const next = { ...prev }
          results.forEach((r) => {
            next[r.roomId] = r.statusCode
          })
          return next
        })
      } finally {
        if (isMountedRef.current) {
          setIsVerifying(false)
        }
      }
    },
    [fetchRatesCatalog]
  )

  /**
   * Efecto disparador automático: cuando cambian o se añaden habitaciones en la tabla,
   * dispara la consulta por cada habitación que aún no haya sido verificada.
   */
  useEffect(() => {
    if (!rooms || rooms.length === 0) return

    const pendingIds = rooms
      .map((r) => String(r.id).trim())
      .filter((id) => id.length > 0 && !checkedRoomsRef.current.has(id))

    if (pendingIds.length > 0) {
      triggerVerificar(pendingIds)
    }
  }, [rooms, triggerVerificar])

  /**
   * Helper para saber si una habitación tiene tarifa activa aplicada
   */
  const hasTariff = useCallback(
    (roomId: string | undefined | null): boolean => {
      if (!roomId) return false
      return Boolean(tariffsByRoom[String(roomId).trim()])
    },
    [tariffsByRoom]
  )

  /**
   * Obtiene el identificador de tarifa aplicada si existe
   */
  const getRateId = useCallback(
    (roomId: string | undefined | null): string | null => {
      if (!roomId) return null
      return rateIdsByRoom[String(roomId).trim()] ?? null
    },
    [rateIdsByRoom]
  )

  /**
   * Obtiene el precio de la tarifa aplicada para una habitación
   */
  const getTariffPrice = useCallback(
    (roomId: string | undefined | null): number | null => {
      if (!roomId) return null
      return pricesByRoom[String(roomId).trim()] ?? null
    },
    [pricesByRoom]
  )

  /**
   * Obtiene el nombre de la tarifa aplicada para una habitación
   */
  const getTariffName = useCallback(
    (roomId: string | undefined | null): string | null => {
      if (!roomId) return null
      return namesByRoom[String(roomId).trim()] ?? null
    },
    [namesByRoom]
  )

  /**
   * Marca inmediatamente una habitación como que tiene tarifa aplicada
   * (muy útil tras un status 201 en el modal de asignación)
   */
  const markRoomWithTariff = useCallback(
    (roomId: string, rateId?: string, price?: number | null, name?: string | null) => {
      const cleanId = String(roomId).trim()
      if (!cleanId) return

      checkedRoomsRef.current.add(cleanId)
      setTariffsByRoom((prev) => ({ ...prev, [cleanId]: true }))
      setStatusCodesByRoom((prev) => ({ ...prev, [cleanId]: 201 }))
      if (rateId) {
        setRateIdsByRoom((prev) => ({ ...prev, [cleanId]: rateId }))
      }
      const finalPrice =
        price != null
          ? price
          : rateId && ratesCatalogRef.current[rateId]
            ? ratesCatalogRef.current[rateId].price
            : null
      if (finalPrice != null) {
        setPricesByRoom((prev) => ({ ...prev, [cleanId]: finalPrice }))
      }
      const finalName =
        name != null
          ? name
          : rateId && ratesCatalogRef.current[rateId]
            ? ratesCatalogRef.current[rateId].name
            : null
      if (finalName != null) {
        setNamesByRoom((prev) => ({ ...prev, [cleanId]: finalName }))
      }
    },
    []
  )

  /**
   * Fuerza el re-chequeo de una habitación específica
   */
  const recheckRoom = useCallback(
    async (roomId: string) => {
      const cleanId = String(roomId).trim()
      if (!cleanId) return

      checkedRoomsRef.current.delete(cleanId)
      await triggerVerificar([cleanId])
    },
    [triggerVerificar]
  )

  /**
   * Fuerza el re-chequeo de todas las habitaciones actualmente registradas
   */
  const recheckAll = useCallback(async () => {
    if (!rooms || rooms.length === 0) return
    checkedRoomsRef.current.clear()
    const allIds = rooms.map((r) => r.id).filter(Boolean)
    await triggerVerificar(allIds)
  }, [rooms, triggerVerificar])

  return {
    tariffsByRoom,
    rateIdsByRoom,
    pricesByRoom,
    namesByRoom,
    statusCodesByRoom,
    isVerifying,
    hasTariff,
    getRateId,
    getTariffPrice,
    getTariffName,
    triggerVerificar,
    markRoomWithTariff,
    recheckRoom,
    recheckAll,
  }
}
