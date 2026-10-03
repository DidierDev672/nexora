import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import type {
  RawHeadquarterTarifa,
  RawSubHeadquarterTarifa,
} from '../domain/habitacion-tarifa'

export interface UseTarifaSedeOptions {
  headquarterId?: string | null
  isOpen: boolean
}

export function useTarifaSede({ headquarterId, isOpen }: UseTarifaSedeOptions) {
  // Estados para la Sede
  const [sedeLoading, setSedeLoading] = useState(false)
  const [sedeData, setSedeData] = useState<RawHeadquarterTarifa | null>(null)
  const [sedeError, setSedeError] = useState<string | null>(null)
  const [sedeStatusCode, setSedeStatusCode] = useState<number | null>(null)

  // Estados para la Sub-Sede
  const [subSedeLoading, setSubSedeLoading] = useState(false)
  const [subSedeData, setSubSedeData] = useState<RawSubHeadquarterTarifa | null>(null)
  const [subSedeError, setSubSedeError] = useState<string | null>(null)
  const [subSedeStatusCode, setSubSedeStatusCode] = useState<number | null>(null)

  const cleanHqId = headquarterId ? String(headquarterId).trim() : ''

  // Consulta de la Sede Principal
  const fetchSede = useCallback(async (id: string) => {
    setSedeLoading(true)
    setSedeError(null)
    setSedeStatusCode(null)

    try {
      const response = await api.get<unknown>(`/headquarters/${id}`, {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      const status = response.status
      setSedeStatusCode(status)

      const raw = response.data
      const item: RawHeadquarterTarifa | null = Array.isArray(raw)
        ? ((raw[0] as RawHeadquarterTarifa) ?? null)
        : raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as RawHeadquarterTarifa)
          : (raw as RawHeadquarterTarifa)

      if (item && (item.id || item.name)) {
        setSedeData({
          id: item.id || id,
          name: item.name || 'Sede Central',
          address: item.address || 'Dirección no registrada',
          city: item.city || 'Ciudad no registrada',
          phone: item.phone || 'Teléfono no registrado',
          status: item.status || 'active',
          created_by: item.created_by,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
        setSedeError(null)
      } else {
        // Status 200 pero sin contenido válido
        setSedeData(null)
        setSedeError(
          'Se presentó un detalle al obtener la sede: no se encontraron registros activos en el sistema (código 200). Tu tarifa sigue completamente disponible.'
        )
      }
    } catch (err: unknown) {
      setSedeData(null)

      if (isAxiosError(err)) {
        const status = err.response?.status ?? 0
        setSedeStatusCode(status)

        if (status === 404) {
          setSedeError(
            'Se presentó un inconveniente: la sede vinculada no fue encontrada en el sistema (código 404). Despreocúpate, las condiciones de tu tarifa siguen intactas.'
          )
        } else if (status === 500) {
          setSedeError(
            'Se presentó un problema en el servidor al consultar la sede (código 500). No es tu culpa; tus datos continúan a salvo.'
          )
        } else {
          setSedeError(
            `Se presentó una eventualidad al consultar la sede (código ${status || 'desconocido'}). La tarifa sigue disponible.`
          )
        }
      } else {
        setSedeError(
          'Se presentó una dificultad de conexión al consultar la sede. La información de tu tarifa se mantiene activa.'
        )
      }
    } finally {
      setSedeLoading(false)
    }
  }, [])

  // Consulta de la Sub-Sede por ID de Sede
  const fetchSubSede = useCallback(async (id: string) => {
    setSubSedeLoading(true)
    setSubSedeError(null)
    setSubSedeStatusCode(null)

    try {
      const response = await api.get<unknown>(`/sub-headquarters/by-headquarter/${id}`, {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      const status = response.status
      setSubSedeStatusCode(status)

      const raw = response.data
      const item: RawSubHeadquarterTarifa | null = Array.isArray(raw)
        ? ((raw[0] as RawSubHeadquarterTarifa) ?? null)
        : raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)
          ? (((raw as { data: RawSubHeadquarterTarifa[] }).data[0]) ?? null)
          : raw && typeof raw === 'object' && 'data' in raw && raw.data
            ? (raw.data as RawSubHeadquarterTarifa)
            : (raw as RawSubHeadquarterTarifa)

      if (item && (item.id || item.name)) {
        setSubSedeData({
          id: item.id,
          headquarter_id: item.headquarter_id || id,
          name: item.name || 'Sub Sede Vinculada',
          address: item.address || 'Dirección no especificada',
          phone: item.phone || 'Teléfono no registrado',
          status: item.status || 'active',
          created_by: item.created_by,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
        setSubSedeError(null)
      } else {
        // Status 200 pero sin subsedes
        setSubSedeData(null)
        setSubSedeError(
          'Se verificó la información (código 200): esta sede opera de manera directa sin subsedes secundarias asignadas.'
        )
      }
    } catch (err: unknown) {
      setSubSedeData(null)

      if (isAxiosError(err)) {
        const status = err.response?.status ?? 0
        setSubSedeStatusCode(status)

        if (status === 404) {
          setSubSedeError(
            'Se presentó un inconveniente: no se localizó la subsede en el sistema (código 404). Tu tarifa continúa vigente.'
          )
        } else if (status === 500) {
          setSubSedeError(
            'Se presentó un problema en el servidor al consultar la subsede (código 500). Esto no interfiere con tu tarifa.'
          )
        } else {
          setSubSedeError(
            `Se presentó una eventualidad al consultar la subsede (código ${status || 'desconocido'}). La tarifa sigue disponible.`
          )
        }
      } else {
        setSubSedeError(
          'Se presentó una dificultad de conexión al consultar la subsede. La información principal continúa disponible.'
        )
      }
    } finally {
      setSubSedeLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && cleanHqId) {
      void fetchSede(cleanHqId)
      void fetchSubSede(cleanHqId)
    } else {
      setSedeData(null)
      setSedeError(null)
      setSedeStatusCode(null)
      setSedeLoading(false)

      setSubSedeData(null)
      setSubSedeError(null)
      setSubSedeStatusCode(null)
      setSubSedeLoading(false)
    }
  }, [isOpen, cleanHqId, fetchSede, fetchSubSede])

  const retrySede = useCallback(() => {
    if (cleanHqId) void fetchSede(cleanHqId)
  }, [cleanHqId, fetchSede])

  const retrySubSede = useCallback(() => {
    if (cleanHqId) void fetchSubSede(cleanHqId)
  }, [cleanHqId, fetchSubSede])

  return {
    sedeLoading,
    sedeData,
    sedeError,
    sedeStatusCode,
    subSedeLoading,
    subSedeData,
    subSedeError,
    subSedeStatusCode,
    retrySede,
    retrySubSede,
  }
}
