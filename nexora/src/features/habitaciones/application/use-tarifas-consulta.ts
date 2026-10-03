import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import type { RawTarifaBackend, TarifasErrorState } from '../domain/habitacion-tarifa'

export interface UseTarifasConsultaOptions {
  isOpen: boolean
  initialRateId?: string | null
}

export function useTarifasConsulta({ isOpen, initialRateId }: UseTarifasConsultaOptions) {
  const [loading, setLoading] = useState(false)
  const [rates, setRates] = useState<RawTarifaBackend[]>([])
  const [selectedRateId, setSelectedRateId] = useState<string>('')
  const [errorType, setErrorType] = useState<TarifasErrorState | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setErrorType(null)
    setStatusCode(null)

    try {
      const response = await api.get<unknown>('/rates', {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      const status = response.status
      setStatusCode(status)

      const raw = response.data
      const list: RawTarifaBackend[] = Array.isArray(raw)
        ? (raw as RawTarifaBackend[])
        : raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: unknown }).data)
          ? ((raw as { data: RawTarifaBackend[] }).data)
          : []

      if (list.length > 0) {
        setRates(list)
        // Seleccionamos la tarifa inicial solicitada o la primera por defecto
        const match = initialRateId ? list.find((r) => r.id === initialRateId) : null
        setSelectedRateId(match ? match.id : list[0].id)
        setErrorType(null)
      } else {
        // Status 200 pero sin tarifas registradas en el sistema
        setRates([])
        setSelectedRateId('')
        setErrorType('empty')
      }
    } catch (err: unknown) {
      setRates([])
      setSelectedRateId('')

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
      void fetchRates()
    } else {
      setRates([])
      setSelectedRateId('')
      setErrorType(null)
      setStatusCode(null)
      setLoading(false)
    }
  }, [isOpen, fetchRates])

  const selectedRate = useMemo(() => {
    if (!selectedRateId) return null
    return rates.find((r) => r.id === selectedRateId) ?? null
  }, [rates, selectedRateId])

  const retry = useCallback(() => {
    void fetchRates()
  }, [fetchRates])

  return {
    loading,
    rates,
    selectedRateId,
    setSelectedRateId,
    selectedRate,
    errorType,
    statusCode,
    retry,
  }
}
