import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  compareRoomNumbersDesc,
  type HabitacionesListFilters,
  type RawRoomData,
  type RoomRow,
} from '../domain/habitacion-lista'
import { ApiHabitacionListaRepository } from '../infrastructure/api-habitacion-lista-repository'

const repository = new ApiHabitacionListaRepository()
const PAGE_SIZE = 15

function mapRawToRoomRow(raw: RawRoomData): RoomRow {
  const id = String(raw.id)
  const num = raw.number ? String(raw.number).trim() : id.slice(-4)
  const floor = raw.floor != null ? raw.floor : 1
  const status = raw.status ? String(raw.status).toLowerCase().trim() : 'available'

  // El precio especial es null si no hay override
  let priceOverride: number | null = null
  if (raw.price_override != null && raw.price_override !== '') {
    const parsed = Number(String(raw.price_override).replace(',', '.'))
    if (!isNaN(parsed) && parsed > 0) {
      priceOverride = parsed
    }
  }

  const buildingId = raw.building_id ? String(raw.building_id).trim() : undefined
  const roomTypesId = (raw.room_types_id || raw.room_type_id)
    ? String(raw.room_types_id || raw.room_type_id).trim()
    : undefined

  return {
    id,
    number: num,
    floor,
    status,
    priceOverride,
    updatedAt: raw.updated_at,
    createdAt: raw.created_at,
    roomTypesId,
    buildingId,
    bed: {
      id: roomTypesId,
      name: roomTypesId ? 'Cargando cama…' : 'No asignada',
      loading: Boolean(roomTypesId),
      error: false,
    },
    building: {
      id: buildingId,
      name: buildingId ? 'Cargando edificio…' : 'Sin edificio',
      loading: Boolean(buildingId),
      error: false,
    },
  }
}

export function useHabitacionesLista() {
  const [allRawRooms, setAllRawRooms] = useState<RawRoomData[]>([])
  const [rows, setRows] = useState<RoomRow[]>([])
  const [page, setPage] = useState(1)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<HabitacionesListFilters>({
    search: '',
    status: 'all',
    buildingId: 'all',
  })

  const [knownBuildings, setKnownBuildings] = useState<{ id: string; name: string }[]>([])
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  /**
   * Enriquece un conjunto de filas resolviendo en paralelo buildings y beds únicos
   */
  const enrichBatch = useCallback(async (targetRows: RoomRow[]) => {
    // 1. Extraer IDs únicos de building y bed del lote
    const uniqueBuildingIds = Array.from(
      new Set(targetRows.map((r) => r.buildingId).filter((id): id is string => Boolean(id)))
    )
    const uniqueBedIds = Array.from(
      new Set(targetRows.map((r) => r.roomTypesId).filter((id): id is string => Boolean(id)))
    )

    // 2. Resolver edificios únicos en paralelo usando el repositorio con caché
    const buildingPromises = uniqueBuildingIds.map(async (bId) => {
      try {
        const data = await repository.getBuilding(bId)
        if (!isMountedRef.current) return
        if (data) {
          setRows((prev) =>
            prev.map((r) =>
              r.buildingId === bId
                ? {
                    ...r,
                    building: {
                      id: bId,
                      name: data.name,
                      floorNumber: data.floorNumber,
                      headquartersId: data.headquartersId,
                      subHeadquartersId: data.subHeadquartersId,
                      loading: false,
                      error: false,
                    },
                  }
                : r
            )
          )

          // Registrar en la lista de edificios disponibles para el filtro
          setKnownBuildings((prev) => {
            if (prev.some((b) => b.id === bId)) return prev
            return [...prev, { id: bId, name: data.name }]
          })
        }
      } catch {
        if (!isMountedRef.current) return
        setRows((prev) =>
          prev.map((r) =>
            r.buildingId === bId
              ? {
                  ...r,
                  building: {
                    id: bId,
                    name: 'No disponible',
                    loading: false,
                    error: true,
                  },
                }
              : r
          )
        )
      }
    })

    // 3. Resolver tipos de cama únicos en paralelo usando el repositorio con caché
    const bedPromises = uniqueBedIds.map(async (bedId) => {
      try {
        const data = await repository.getBedType(bedId)
        if (!isMountedRef.current) return
        if (data) {
          setRows((prev) =>
            prev.map((r) =>
              r.roomTypesId === bedId
                ? {
                    ...r,
                    bed: {
                      id: bedId,
                      name: data.name,
                      capacityPeople: data.capacityPeople,
                      loading: false,
                      error: false,
                    },
                  }
                : r
            )
          )
        }
      } catch {
        if (!isMountedRef.current) return
        setRows((prev) =>
          prev.map((r) =>
            r.roomTypesId === bedId
              ? {
                  ...r,
                  bed: {
                    id: bedId,
                    name: 'No disponible',
                    loading: false,
                    error: true,
                  },
                }
              : r
          )
        )
      }
    })

    await Promise.allSettled([...buildingPromises, ...bedPromises])
  }, [])

  /**
   * Carga inicial completa de habitaciones desde GET /room
   */
  const loadInitialRooms = useCallback(async () => {
    setInitialLoading(true)
    setError(null)
    try {
      const data = await repository.getRooms()
      if (!isMountedRef.current) return

      const sorted = [...data].sort((a, b) => compareRoomNumbersDesc(a.number, b.number))
      setAllRawRooms(sorted)

      // Primera página visible de inmediato (ordenada de mayor a menor)
      const firstPageRaw = sorted.slice(0, PAGE_SIZE)
      const firstPageRows = firstPageRaw.map(mapRawToRoomRow)

      setRows(firstPageRows)
      setPage(1)

      // Enriquecer la primera página en segundo plano
      void enrichBatch(firstPageRows)
    } catch {
      if (!isMountedRef.current) return
      setError(
        'No pudimos conectar con el servidor para obtener las habitaciones. Verifica tu conexión e inténtalo de nuevo.'
      )
    } finally {
      if (isMountedRef.current) {
        setInitialLoading(false)
      }
    }
  }, [enrichBatch])

  useEffect(() => {
    void loadInitialRooms()
  }, [loadInitialRooms])

  /**
   * Cargar la siguiente página incremental al hacer scroll
   */
  const loadMore = useCallback(async () => {
    if (loadingMore || initialLoading) return

    const startIndex = page * PAGE_SIZE
    if (startIndex >= allRawRooms.length) return

    setLoadingMore(true)

    // Pequeño retardo natural para fluidez de scroll visual
    await new Promise((res) => setTimeout(res, 200))
    if (!isMountedRef.current) return

    const nextBatchRaw = allRawRooms.slice(startIndex, startIndex + PAGE_SIZE)
    const nextBatchRows = nextBatchRaw.map(mapRawToRoomRow)

    setRows((prev) => [...prev, ...nextBatchRows])
    setPage((prev) => prev + 1)
    setLoadingMore(false)

    // Enriquecer el nuevo lote
    void enrichBatch(nextBatchRows)
  }, [loadingMore, initialLoading, page, allRawRooms, enrichBatch])

  /**
   * Reintento de un edificio puntual desde la celda de la fila
   */
  const retryBuilding = useCallback(async (buildingId: string) => {
    if (!buildingId) return

    // Marcar como cargando en las filas correspondientes
    setRows((prev) =>
      prev.map((r) =>
        r.buildingId === buildingId
          ? { ...r, building: { ...r.building, loading: true, error: false, name: 'Reintentando…' } }
          : r
      )
    )

    repository.invalidateBuilding(buildingId)

    try {
      const data = await repository.getBuilding(buildingId)
      if (!isMountedRef.current) return
      if (data) {
        setRows((prev) =>
          prev.map((r) =>
            r.buildingId === buildingId
              ? {
                  ...r,
                  building: {
                    id: buildingId,
                    name: data.name,
                    floorNumber: data.floorNumber,
                    headquartersId: data.headquartersId,
                    subHeadquartersId: data.subHeadquartersId,
                    loading: false,
                    error: false,
                  },
                }
              : r
          )
        )
      }
    } catch {
      if (!isMountedRef.current) return
      setRows((prev) =>
        prev.map((r) =>
          r.buildingId === buildingId
            ? { ...r, building: { ...r.building, loading: false, error: true, name: 'No disponible' } }
            : r
        )
      )
    }
  }, [])

  /**
   * Reintento de una cama puntual desde la celda de la fila
   */
  const retryBed = useCallback(async (bedId: string) => {
    if (!bedId) return

    setRows((prev) =>
      prev.map((r) =>
        r.roomTypesId === bedId
          ? { ...r, bed: { ...r.bed, loading: true, error: false, name: 'Reintentando…' } }
          : r
      )
    )

    repository.invalidateBed(bedId)

    try {
      const data = await repository.getBedType(bedId)
      if (!isMountedRef.current) return
      if (data) {
        setRows((prev) =>
          prev.map((r) =>
            r.roomTypesId === bedId
              ? {
                  ...r,
                  bed: {
                    id: bedId,
                    name: data.name,
                    capacityPeople: data.capacityPeople,
                    loading: false,
                    error: false,
                  },
                }
              : r
          )
        )
      }
    } catch {
      if (!isMountedRef.current) return
      setRows((prev) =>
        prev.map((r) =>
          r.roomTypesId === bedId
            ? { ...r, bed: { ...r.bed, loading: false, error: true, name: 'No disponible' } }
            : r
        )
      )
    }
  }, [])

  /**
   * Filtros aplicados sobre las filas actualmente cargadas
   */
  const filteredRows = useMemo(() => {
    const list = rows.filter((row) => {
      // 1. Búsqueda por número o piso
      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase()
        const matchesNumber = row.number.toLowerCase().includes(query)
        const matchesFloor = String(row.floor).includes(query)
        const matchesBuilding = row.building.name.toLowerCase().includes(query)
        const matchesBed = row.bed.name.toLowerCase().includes(query)
        if (!matchesNumber && !matchesFloor && !matchesBuilding && !matchesBed) {
          return false
        }
      }

      // 2. Filtro por estado
      if (filters.status !== 'all') {
        const rowStatus = row.status.toLowerCase()
        const filterStatus = filters.status.toLowerCase()
        if (rowStatus !== filterStatus) {
          return false
        }
      }

      // 3. Filtro por edificio
      if (filters.buildingId !== 'all') {
        if (row.buildingId !== filters.buildingId) {
          return false
        }
      }

      return true
    })

    // Lista ordenada estrictamente de mayor a menor según el número de la habitación
    return [...list].sort((a, b) => compareRoomNumbersDesc(a.number, b.number))
  }, [rows, filters])

  const hasMore = rows.length < allRawRooms.length

  return {
    rows: filteredRows,
    totalRawCount: allRawRooms.length,
    loadedCount: rows.length,
    initialLoading,
    loadingMore,
    hasMore,
    error,
    filters,
    knownBuildings,
    setFilters,
    loadMore,
    reload: loadInitialRooms,
    retryBuilding,
    retryBed,
  }
}
