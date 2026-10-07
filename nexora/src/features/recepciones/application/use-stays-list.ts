import { useCallback, useEffect, useMemo, useState } from 'react'
import type { RecepcionesViewMode, StayItem } from '../domain/stay'
import { getStaysFromApi } from '../infrastructure/stays-api'
import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'

export interface UseStaysListReturn {
  stays: StayItem[]
  filteredStays: StayItem[]
  loading: boolean
  validationResult: StatusCodeValidationResult | null
  isDemoFallback: boolean
  viewMode: RecepcionesViewMode
  setViewMode: (mode: RecepcionesViewMode) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  paymentFilter: string
  setPaymentFilter: (method: string) => void
  reload: () => Promise<void>
  metrics: {
    total: number
    enProgreso: number
    finalizadas: number
    totalDepositos: number
  }
}

export function useStaysList(): UseStaysListReturn {
  const [stays, setStays] = useState<StayItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [validationResult, setValidationResult] = useState<StatusCodeValidationResult | null>(null)
  const [isDemoFallback, setIsDemoFallback] = useState<boolean>(false)

  // Switch de modo de visualización: por defecto 'card' como solicita el usuario
  const [viewMode, setViewMode] = useState<RecepcionesViewMode>('card')

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [paymentFilter, setPaymentFilter] = useState('todos')

  const fetchStays = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getStaysFromApi()
      setStays(result.data)
      setValidationResult(result.validation)
      setIsDemoFallback(Boolean(result.isDemoFallback))
    } catch {
      // Manejo seguro en caso inesperado
      setStays([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchStays()
  }, [fetchStays])

  // Filtrado reactivo en memoria
  const filteredStays = useMemo(() => {
    return stays.filter((stay) => {
      // Filtro por Estado
      if (statusFilter !== 'todos') {
        const normStatus = (stay.status || '').toLowerCase()
        if (normStatus !== statusFilter.toLowerCase()) return false
      }

      // Filtro por Método de Pago
      if (paymentFilter !== 'todos') {
        const normPay = (stay.payment_method || '').toLowerCase()
        if (!normPay.includes(paymentFilter.toLowerCase())) return false
      }

      // Búsqueda textual por room_id, person_ids, reservation_id o id
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchRoom = stay.room_id.toLowerCase().includes(q)
        const matchId = stay.id.toLowerCase().includes(q)
        const matchReserva = (stay.reservation_id || '').toLowerCase().includes(q)
        const matchPersons = stay.person_ids.some((pid) => pid.toLowerCase().includes(q))
        const matchRemarks = (stay.remarks || '').toLowerCase().includes(q)

        return matchRoom || matchId || matchReserva || matchPersons || matchRemarks
      }

      return true
    })
  }, [stays, statusFilter, paymentFilter, searchQuery])

  // Métricas financieras y operativas
  const metrics = useMemo(() => {
    const enProgreso = stays.filter(
      (s) => s.status.toLowerCase() === 'progress' || s.status.toLowerCase() === 'progreso'
    ).length
    const finalizadas = stays.filter(
      (s) => s.status.toLowerCase() === 'completed' || s.status.toLowerCase() === 'finalizada'
    ).length
    const totalDepositos = stays.reduce((acc, curr) => acc + (Number(curr.security_deposit) || 0), 0)

    return {
      total: stays.length,
      enProgreso,
      finalizadas,
      totalDepositos,
    }
  }, [stays])

  return {
    stays,
    filteredStays,
    loading,
    validationResult,
    isDemoFallback,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    paymentFilter,
    setPaymentFilter,
    reload: fetchStays,
    metrics,
  }
}
