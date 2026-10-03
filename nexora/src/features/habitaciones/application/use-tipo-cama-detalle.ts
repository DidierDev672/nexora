import { useCallback, useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import type {
  RawBedTypeResponse,
  TipoCamaDetalle,
  TipoCamaErrorState,
} from '../domain/tipo-cama-detalle'

export interface UseTipoCamaDetalleOptions {
  bedId: string | null
  isOpen: boolean
}

export function useTipoCamaDetalle({ bedId, isOpen }: UseTipoCamaDetalleOptions) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<TipoCamaDetalle | null>(null)
  const [errorType, setErrorType] = useState<TipoCamaErrorState | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const fetchBedType = useCallback(async (id: string | null) => {
    const cleanId = id ? String(id).trim() : ''

    // Si no hay ID asociado a la habitación, reflejamos amigablemente que no hay registro asignado
    if (!cleanId) {
      setData(null)
      setErrorType('empty')
      setStatusCode(200)
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorType(null)
    setStatusCode(null)

    try {
      const response = await api.get<unknown>(`/types-bed/${cleanId}`, {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      const status = response.status
      setStatusCode(status)

      const raw = response.data as RawBedTypeResponse | { data?: RawBedTypeResponse }
      const item: RawBedTypeResponse | null =
        raw && typeof raw === 'object' && 'data' in raw && raw.data
          ? (raw.data as RawBedTypeResponse)
          : (raw as RawBedTypeResponse)

      // Verificamos si la respuesta 200 contiene efectivamente la información del tipo de cama
      if (
        item &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        item.name.trim().length > 0
      ) {
        const capacity =
          typeof item.capacity_people === 'number'
            ? item.capacity_people
            : typeof item.capacity === 'number'
              ? item.capacity
              : 1

        setData({
          id: item.id || cleanId,
          name: item.name.trim(),
          capacity_people: capacity,
          description:
            typeof item.description === 'string' && item.description.trim().length > 0
              ? item.description.trim()
              : 'Sin descripción detallada por el momento.',
          created_by: item.created_by,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })
        setErrorType(null)
      } else {
        // Status 200 pero sin tipos de cama registrados / respuesta vacía
        setData(null)
        setErrorType('empty')
      }
    } catch (err: unknown) {
      setData(null)

      if (isAxiosError(err)) {
        const status = err.response?.status ?? 0
        setStatusCode(status)

        if (status === 500) {
          setErrorType('server_error')
        } else if (status === 404 || status === 204) {
          setErrorType('empty')
        } else {
          setErrorType('server_error')
        }
      } else {
        setErrorType('network_error')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      void fetchBedType(bedId)
    } else {
      setData(null)
      setErrorType(null)
      setStatusCode(null)
      setLoading(false)
    }
  }, [isOpen, bedId, fetchBedType])

  const retry = useCallback(() => {
    void fetchBedType(bedId)
  }, [bedId, fetchBedType])

  return {
    loading,
    data,
    errorType,
    statusCode,
    retry,
  }
}
