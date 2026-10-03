import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchTarifasRegistradas,
  type GetRatesResult,
} from '../infrastructure/api-tarifa-service'
import type {
  StatusCodePsychology,
  TarifaItemResponse,
} from '../domain/tarifa-lista'
import { getSedeDisplayName } from '../domain/tarifa-sede'
import { getBedTypeDisplayName } from '../domain/tarifa-cama'

export interface TarifaFiltrosState {
  busqueda: string
  modalidad: string
  estado: string
}

export function useTarifasLista() {
  const [rates, setRates] = useState<TarifaItemResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [statusCode, setStatusCode] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<StatusCodePsychology | null>(null)
  const [showFeedbackBanner, setShowFeedbackBanner] = useState<boolean>(true)

  // Filtros interactivos
  const [filtros, setFiltros] = useState<TarifaFiltrosState>({
    busqueda: '',
    modalidad: 'todas',
    estado: 'todos',
  })

  // Tarifa seleccionada para modal de detalle rápido
  const [selectedTarifa, setSelectedTarifa] = useState<TarifaItemResponse | null>(null)

  const loadRates = useCallback(async () => {
    setLoading(true)
    try {
      const result: GetRatesResult = await fetchTarifasRegistradas()
      setRates(result.data)
      setStatusCode(result.statusCode)
      setFeedback(result.feedback)
      setShowFeedbackBanner(result.statusCode !== 200 && result.feedback !== null)
    } catch {
      // Manejo de emergencia por si ocurre un fallo no capturado
      setStatusCode(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRates()
  }, [loadRates])

  // Filtrado reactivo en memoria
  const filteredRates = useMemo(() => {
    return rates.filter((rate) => {
      // Filtro por texto (nombre, created_by, headquarter_id, room_type_id)
      if (filtros.busqueda.trim() !== '') {
        const query = filtros.busqueda.toLowerCase().trim()
        const matchesName = rate.name.toLowerCase().includes(query)
        const hqDisplayName = getSedeDisplayName(rate.headquarter_id).toLowerCase()
        const matchesHq =
          rate.headquarter_id.toLowerCase().includes(query) ||
          hqDisplayName.includes(query)
        const bedDisplayName = getBedTypeDisplayName(rate.room_type_id).toLowerCase()
        const matchesRoom =
          (rate.room_type_id || '').toLowerCase().includes(query) ||
          bedDisplayName.includes(query)
        const matchesCreator = (rate.created_by || '').toLowerCase().includes(query)
        if (!matchesName && !matchesHq && !matchesRoom && !matchesCreator) {
          return false
        }
      }

      // Filtro por modalidad
      if (filtros.modalidad !== 'todas') {
        const modKey = rate.modality.toLowerCase()
        if (filtros.modalidad === 'daily' && !modKey.includes('day') && !modKey.includes('daily')) return false
        if (filtros.modalidad === 'nightly' && !modKey.includes('night')) return false
        if (filtros.modalidad === 'hourly' && !modKey.includes('hour')) return false
        if (filtros.modalidad === 'weekly' && !modKey.includes('week')) return false
      }

      // Filtro por estado
      if (filtros.estado !== 'todos') {
        if (rate.status.toLowerCase() !== filtros.estado.toLowerCase()) {
          return false
        }
      }

      return true
    })
  }, [rates, filtros])

  // Métricas rápidas para el encabezado UX
  const stats = useMemo(() => {
    const total = rates.length
    const active = rates.filter((r) => r.status.toLowerCase() === 'active').length
    const inactive = total - active
    const totalPrices = rates.reduce((acc, curr) => acc + (curr.price || 0), 0)
    const avgPrice = total > 0 ? totalPrices / total : 0

    return { total, active, inactive, avgPrice }
  }, [rates])

  const setBusqueda = (val: string) => setFiltros((prev) => ({ ...prev, busqueda: val }))
  const setModalidad = (val: string) => setFiltros((prev) => ({ ...prev, modalidad: val }))
  const setEstado = (val: string) => setFiltros((prev) => ({ ...prev, estado: val }))
  const resetFiltros = () => setFiltros({ busqueda: '', modalidad: 'todas', estado: 'todos' })

  const updateRateInList = useCallback((updatedTarifa: TarifaItemResponse) => {
    setRates((prev) =>
      prev.map((r) => (r.id === updatedTarifa.id ? updatedTarifa : r)),
    )
  }, [])

  return {
    rates: filteredRates,
    allRatesCount: rates.length,
    loading,
    statusCode,
    feedback,
    showFeedbackBanner,
    dismissFeedbackBanner: () => setShowFeedbackBanner(false),
    refetch: loadRates,
    filtros,
    setBusqueda,
    setModalidad,
    setEstado,
    resetFiltros,
    stats,
    selectedTarifa,
    setSelectedTarifa,
    updateRateInList,
  }
}

