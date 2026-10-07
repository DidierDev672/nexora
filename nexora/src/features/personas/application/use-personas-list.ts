import { useState, useEffect, useMemo, useCallback } from 'react'
import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { PersonListItem, PersonViewMode, PersonaRepository } from '../domain/persona-list'
import { ApiPersonaRepository } from '../infrastructure/api-persona-repository'

const DEFAULT_REPOSITORY = new ApiPersonaRepository()
const INITIAL_PAGE_SIZE = 6
const LOAD_MORE_STEP = 6

export interface UsePersonasListOptions {
  repository?: PersonaRepository
  initialViewMode?: PersonViewMode
}

export function usePersonasList(options?: UsePersonasListOptions) {
  const repository = options?.repository ?? DEFAULT_REPOSITORY

  // Modo de visualización: por defecto 'cards' (requisito estricto)
  const [viewMode, setViewMode] = useState<PersonViewMode>(options?.initialViewMode ?? 'cards')

  const [persons, setPersons] = useState<PersonListItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<StatusCodeValidationResult | null>(null)
  const [fromFallback, setFromFallback] = useState<boolean>(false)

  // Filtros interactivos
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('todos')
  const [genderFilter, setGenderFilter] = useState<string>('todos')

  // Paginación reactiva para InfiniteScroll
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)

  const fetchPersons = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await repository.getPersons()
      setPersons(result.data)
      setValidation(result.validation)
      setFromFallback(result.fromFallback)

      if (!result.validation.isValid && result.validation.message) {
        setError(result.validation.message)
      }
    } catch {
      setError('No se pudo establecer conexión con el servidor. Mostrando datos locales.')
    } finally {
      setLoading(false)
      setVisibleCount(INITIAL_PAGE_SIZE)
    }
  }, [repository])

  useEffect(() => {
    void fetchPersons()
  }, [fetchPersons])

  // Filtrado reactivo en memoria
  const filteredPersons = useMemo(() => {
    return persons.filter((person) => {
      // 1. Filtro por término de búsqueda (nombre, documento, email, teléfono)
      const query = searchQuery.trim().toLowerCase()
      if (query) {
        const matchesName = person.name.toLowerCase().includes(query)
        const matchesDoc = person.document_number.toLowerCase().includes(query)
        const matchesEmail = person.email.toLowerCase().includes(query)
        const matchesPhone = person.phone_number.toLowerCase().includes(query)
        if (!matchesName && !matchesDoc && !matchesEmail && !matchesPhone) {
          return false
        }
      }

      // 2. Filtro por rol
      if (roleFilter !== 'todos') {
        const hasRole = person.roles?.some(
          (r) => r.toLowerCase() === roleFilter.toLowerCase()
        )
        if (!hasRole) return false
      }

      // 3. Filtro por género
      if (genderFilter !== 'todos') {
        if (person.gender?.toUpperCase() !== genderFilter.toUpperCase()) {
          return false
        }
      }

      return true
    })
  }, [persons, searchQuery, roleFilter, genderFilter])

  // Elementos visibles para InfiniteScroll
  const visiblePersons = useMemo(() => {
    return filteredPersons.slice(0, visibleCount)
  }, [filteredPersons, visibleCount])

  const hasMore = visibleCount < filteredPersons.length

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return
    setIsLoadingMore(true)
    // Pequeño retardo para dar suavidad visual a la animación
    await new Promise((resolve) => setTimeout(resolve, 250))
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, filteredPersons.length))
    setIsLoadingMore(false)
  }, [hasMore, isLoadingMore, filteredPersons.length])

  // Métricas para la barra de resumen
  const metrics = useMemo(() => {
    const total = persons.length
    const admins = persons.filter((p) => p.roles?.some((r) => r.toLowerCase().includes('admin'))).length
    const recepcion = persons.filter((p) => p.roles?.some((r) => r.toLowerCase().includes('recepcion'))).length
    const huespedes = persons.filter((p) => p.roles?.some((r) => r.toLowerCase().includes('huesped'))).length

    return { total, admins, recepcion, huespedes }
  }, [persons])

  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setRoleFilter('todos')
    setGenderFilter('todos')
    setVisibleCount(INITIAL_PAGE_SIZE)
  }, [])

  return {
    persons,
    filteredPersons,
    visiblePersons,
    loading,
    error,
    validation,
    fromFallback,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    genderFilter,
    setGenderFilter,
    visibleCount,
    hasMore,
    isLoadingMore,
    loadMore,
    metrics,
    resetFilters,
    refetch: fetchPersons,
  }
}
