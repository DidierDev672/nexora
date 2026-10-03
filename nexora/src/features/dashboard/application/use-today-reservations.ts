import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { DashboardReservationItem } from '../domain/dashboard-types'
import { DashboardApiError } from '../domain/dashboard-types'
import { ApiDashboardRepository, DEMO_RESERVATIONS_DATA } from '../infrastructure/api-dashboard-repository'

export interface UseTodayReservationsOptions {
  repository?: ApiDashboardRepository
  pageSize?: number
  initialSimulate400?: boolean
}

export function useTodayReservations(options: UseTodayReservationsOptions = {}) {
  const { pageSize = 4, initialSimulate400 = false } = options

  const repo = useMemo(() => options.repository ?? new ApiDashboardRepository(), [options.repository])

  const [rawList, setRawList] = useState<DashboardReservationItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false)
  const [visibleCount, setVisibleCount] = useState<number>(pageSize)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [is400Error, setIs400Error] = useState<boolean>(initialSimulate400)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [simulate400, setSimulate400] = useState<boolean>(initialSimulate400)
  const [usingDemoData, setUsingDemoData] = useState<boolean>(false)

  const isFetchingRef = useRef(false)

  const fetchReservations = useCallback(
    async (isRetry = false) => {
      if (isFetchingRef.current && !isRetry) return
      isFetchingRef.current = true
      setIsLoading(true)
      setErrorMessage(null)
      setIs400Error(false)

      try {
        if (simulate400) {
          // Si está activada la simulación para verificar el comportamiento de UI/UX
          throw new DashboardApiError(400, 'Error 400 simulado para testeo de UX')
        }

        const data = await repo.getTodayReservations()

        if (data.length > 0) {
          setRawList(data)
          setUsingDemoData(false)
        } else {
          // Si el endpoint respondió 200 pero no hay datos aún cargados en el backend,
          // cargamos la muestra inicial para que el usuario pueda apreciar el diseño
          setRawList(DEMO_RESERVATIONS_DATA)
          setUsingDemoData(true)
        }
      } catch (err: unknown) {
        if (err instanceof DashboardApiError && err.statusCode === 400) {
          setIs400Error(true)
          setErrorMessage(
            'Notamos una pequeña interrupción en la solicitud para consultar las reservas de hoy (código 400). Tranquilo/a: no hiciste nada mal y la información de tu hotel sigue intacta en el sistema. Puedes reintentar la sincronización en un instante o activar los datos de demostración.',
          )
        } else {
          // Otros errores de conexión (ej. backend local no levantado aún)
          // Mostramos mensaje psicológico empático
          setErrorMessage(
            'No pudimos conectar de inmediato con el servicio de reservas. Tranquilo/a: tus datos están seguros. Revisa tu conexión o reintenta ahora.',
          )
        }
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    },
    [repo, simulate400],
  )

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  // Filtrado reactivo por texto de búsqueda
  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return rawList

    return rawList.filter(
      (item) =>
        item.guestName.toLowerCase().includes(q) ||
        item.roomName.toLowerCase().includes(q) ||
        item.sede.toLowerCase().includes(q) ||
        item.hora.toLowerCase().includes(q) ||
        (item.guestDocument && item.guestDocument.toLowerCase().includes(q)),
    )
  }, [rawList, searchQuery])

  // Elementos visibles para InfiniteScroll
  const visibleList = useMemo(() => {
    return filteredList.slice(0, visibleCount)
  }, [filteredList, visibleCount])

  const hasMore = visibleCount < filteredList.length

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    // Pequeño delay natural para percibir la fluidez de carga del infinite scroll
    await new Promise((resolve) => setTimeout(resolve, 350))
    setVisibleCount((prev) => Math.min(prev + pageSize, filteredList.length))
    setIsLoadingMore(false)
  }, [hasMore, isLoadingMore, pageSize, filteredList.length])

  // Carga manual de datos de demostración para explorar la UI
  const loadDemoData = useCallback(() => {
    setIs400Error(false)
    setErrorMessage(null)
    setSimulate400(false)
    setRawList(DEMO_RESERVATIONS_DATA)
    setUsingDemoData(true)
  }, [])

  const triggerSimulate400 = useCallback(() => {
    setSimulate400(true)
    setIs400Error(true)
    setErrorMessage(
      'Notamos una pequeña interrupción en la solicitud para consultar las reservas de hoy (código 400). Tranquilo/a: no hiciste nada mal y la información de tu hotel sigue intacta en el sistema. Puedes reintentar la sincronización en un instante o activar los datos de demostración.',
    )
  }, [])

  return {
    reservations: visibleList,
    totalCount: filteredList.length,
    rawCount: rawList.length,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    is400Error,
    errorMessage,
    searchQuery,
    setSearchQuery,
    reload: () => {
      setSimulate400(false)
      fetchReservations(true)
    },
    loadDemoData,
    triggerSimulate400,
    usingDemoData,
  }
}
