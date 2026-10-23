import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { ReservaViewItem, ReservaViewMode } from '../domain/reserva-list-types'
import { fetchReservasFromApi } from '../infrastructure/api-reserva-list-repository'

const PAGE_SIZE = 6

export function useReservasList() {
  const [viewMode, setViewMode] = useState<ReservaViewMode>('cards')
  const [items, setItems] = useState<ReservaViewItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [refreshing, setRefreshing] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)

  const loadReservas = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const result = await fetchReservasFromApi()
      setItems(result.items)
      if (result.validation.message) {
        setFeedback(result.validation)
      } else {
        setFeedback(null)
      }
    } catch {
      // Manejo controlado
    } finally {
      setLoading(false)
      setRefreshing(false)
      setVisibleCount(PAGE_SIZE)
    }
  }, [])

  useEffect(() => {
    void loadReservas()
  }, [loadReservas])

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return items.filter((item) => {
      const matchSearch =
        !q ||
        item.personDisplayName.toLowerCase().includes(q) ||
        item.roomDisplayName.toLowerCase().includes(q)

      const matchStatus =
        statusFilter === 'all' ||
        item.state.toLowerCase() === statusFilter.toLowerCase()

      return matchSearch && matchStatus
    })
  }, [items, searchQuery, statusFilter])

  const visibleItems = useMemo(() => {
    return filteredItems.slice(0, visibleCount)
  }, [filteredItems, visibleCount])

  const hasMore = visibleCount < filteredItems.length

  const loadMore = useCallback(async () => {
    if (!hasMore) return
    // Pequeño retardo para suavizar la animación de carga infinita
    await new Promise((resolve) => setTimeout(resolve, 350))
    setVisibleCount((prev) => prev + PAGE_SIZE)
  }, [hasMore])

  const clearFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  const countsByStatus = useMemo(() => {
    const counts: Record<string, number> = { all: items.length }
    items.forEach((item) => {
      const key = item.state.toLowerCase()
      counts[key] = (counts[key] || 0) + 1
    })
    return counts
  }, [items])

  return {
    viewMode,
    setViewMode,
    items,
    filteredItems,
    visibleItems,
    loading,
    refreshing,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    hasMore,
    loadMore,
    feedback,
    clearFeedback,
    refetch: () => loadReservas(true),
    countsByStatus,
    totalCount: items.length,
    filteredCount: filteredItems.length,
  }
}
