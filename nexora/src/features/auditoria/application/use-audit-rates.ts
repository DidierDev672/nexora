import { useCallback, useEffect, useState } from 'react'
import type { RateAuditItem, RateFilterParams } from '../domain/audit-types'
import { auditRepository } from '../infrastructure/api-audit-repository'
import { useAuditScope } from './audit-scope-context'

export function useAuditRates() {
  const { scope } = useAuditScope()
  const [rates, setRates] = useState<RateAuditItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<RateFilterParams>({
    modality: 'all',
    status: 'all',
    search: '',
  })

  const fetchRates = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await auditRepository.getRates(filters, scope)
      setRates(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar tarifas de auditoría'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [filters, scope])

  useEffect(() => {
    void fetchRates()
  }, [fetchRates])

  const setFilterField = useCallback((field: keyof RateFilterParams, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      modality: 'all',
      status: 'all',
      search: '',
    })
  }, [])

  // Conteo de anomalías financieras detectadas (Regla R14)
  const r14AnomalyCount = rates.filter((r) => r.has_financial_anomaly).length

  return {
    rates,
    loading,
    error,
    filters,
    setFilterField,
    resetFilters,
    refetch: fetchRates,
    r14AnomalyCount,
  }
}
