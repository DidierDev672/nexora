import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  EdificioInfo,
  HabitacionInfo,
  Recepcion,
  SedeInfo,
} from '../domain/recepcion'
import { ApiRecepcionRepository } from '../infrastructure/api-recepcion-repository'

const defaultRepository = new ApiRecepcionRepository()
const ITEMS_PER_PAGE = 6

export interface RecepcionMetricsData {
  huespedesHoy: number
  habitacionesEnUso: number
  camasOcupadas: number
  depositosActivos: number
}

export function useRecepcionesList(repository = defaultRepository) {
  const [recepciones, setRecepciones] = useState<Recepcion[]>([])
  const [sedes, setSedes] = useState<SedeInfo[]>([])
  const [edificios, setEdificios] = useState<EdificioInfo[]>([])
  const [habitaciones, setHabitaciones] = useState<HabitacionInfo[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSedeId, setSelectedSedeId] = useState<string>('todas')
  const [selectedEstado, setSelectedEstado] = useState<string>('todos')

  // Infinite Scroll
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [recList, sedesList, edificiosList, habList] = await Promise.all([
        repository.getRecepciones(),
        repository.getSedes(),
        repository.getEdificios(),
        repository.getHabitaciones(),
      ])

      setRecepciones(recList)
      setSedes(sedesList)
      setEdificios(edificiosList)
      setHabitaciones(habList)
    } catch (err: unknown) {
      console.error('Error al cargar la lista de recepciones:', err)
      setError(
        'Tuvimos una pequeña dificultad al conectar con el registro de recepciones. Tus datos están a salvo; pulsa reintentar cuando gustes.',
      )
    } finally {
      setLoading(false)
    }
  }, [repository])

  useEffect(() => {
    void loadData()
  }, [loadData])

  // Filtrado de recepciones
  const filteredRecepciones = useMemo(() => {
    return recepciones.filter((item) => {
      // Filtro por Estado
      if (selectedEstado !== 'todos' && item.estado !== selectedEstado) {
        return false
      }

      // Filtro por Sede
      if (selectedSedeId !== 'todas') {
        if (item.sede?.id !== selectedSedeId) {
          return false
        }
      }

      // Filtro por Búsqueda (Huésped, Teléfono, CC, Habitación, Sede)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchGuest = item.huesped?.name?.toLowerCase().includes(q)
        const matchDoc = item.huesped?.documentNumber?.toLowerCase().includes(q)
        const matchPhone = item.huesped?.phoneNumber?.toLowerCase().includes(q)
        const matchRoom = item.roomLabel.toLowerCase().includes(q)
        const matchSede = item.sede?.name?.toLowerCase().includes(q)
        const matchEdificio = item.edificio?.name?.toLowerCase().includes(q)

        return (
          Boolean(matchGuest) ||
          Boolean(matchDoc) ||
          Boolean(matchPhone) ||
          Boolean(matchRoom) ||
          Boolean(matchSede) ||
          Boolean(matchEdificio)
        )
      }

      return true
    })
  }, [recepciones, selectedEstado, selectedSedeId, searchQuery])

  // Elementos visibles para InfiniteScroll
  const visibleRecepciones = useMemo(() => {
    return filteredRecepciones.slice(0, visibleCount)
  }, [filteredRecepciones, visibleCount])

  const hasMore = visibleCount < filteredRecepciones.length

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE)
  }, [])

  // Cálculo de métricas rápidas
  const metrics: RecepcionMetricsData = useMemo(() => {
    const activas = recepciones.filter((r) => r.estado === 'progreso')
    const habitacionesOcupadasSet = new Set(activas.map((r) => r.roomId))

    const depositos = activas.reduce((acc, curr) => acc + (Number(curr.depositoGarantia) || 0), 0)

    return {
      huespedesHoy: activas.length,
      habitacionesEnUso: habitacionesOcupadasSet.size,
      camasOcupadas: activas.filter((r) => Boolean(r.cama)).length || activas.length,
      depositosActivos: depositos,
    }
  }, [recepciones])

  const addRecepcionOptimistically = useCallback((nueva: Recepcion) => {
    setRecepciones((prev) => [nueva, ...prev])
  }, [])

  return {
    recepciones: visibleRecepciones,
    allRecepciones: filteredRecepciones,
    totalCount: filteredRecepciones.length,
    loading,
    error,
    metrics,
    sedes,
    edificios,
    habitaciones,
    searchQuery,
    setSearchQuery,
    selectedSedeId,
    setSelectedSedeId,
    selectedEstado,
    setSelectedEstado,
    hasMore,
    loadMore,
    reload: loadData,
    addRecepcionOptimistically,
  }
}
