import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { InfiniteScroll, InfiniteScrollEnd } from '../../../../shared/ui/InfiniteScroll'
import { Button } from '../../../recursos/ui/atoms/button'
import { RecepcionDetalleModal } from '../molecules/recepcion-detalle-modal'
import {
  formatReadableDateTime,
  calcularNoches,
  type Recepcion,
  type SedeInfo,
} from '../../domain/recepcion'

export interface RecepcionesListProps {
  recepciones: Recepcion[]
  totalCount: number
  loading: boolean
  error: string | null
  sedes: SedeInfo[]
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedSedeId: string
  onSedeChange: (sedeId: string) => void
  selectedEstado?: string
  onEstadoChange?: (estado: string) => void
  hasMore: boolean
  onLoadMore: () => void
  onReload: () => void
  onOpenSede: (sedeId: string) => void
  onOpenHabitacion: (roomId: string, camaId?: string) => void
  onNewCheckIn: () => void
}

function getInitials(name?: string): string {
  if (!name) return 'H'
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Skeleton Loader para carga suave de filas de la tabla
 */
function TableSkeletonRows() {
  return (
    <motion.tbody
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="divide-y divide-line"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-line/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded-md bg-line/60" />
                <div className="h-3 w-20 rounded-md bg-line/40" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-28 rounded-lg bg-line/50" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-28 rounded-md bg-line/60" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-28 rounded-md bg-line/60" />
          </td>
          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-8 w-20 rounded-lg bg-line/50" />
          </td>
        </tr>
      ))}
    </motion.tbody>
  )
}

export function RecepcionesList({
  recepciones,
  totalCount,
  loading,
  error,
  sedes,
  searchQuery,
  onSearchChange,
  selectedSedeId,
  onSedeChange,
  hasMore,
  onLoadMore,
  onReload,
  onOpenSede,
  onOpenHabitacion,
  onNewCheckIn,
}: RecepcionesListProps) {
  // Modal de detalle de la recepción seleccionada
  const [selectedRecepcion, setSelectedRecepcion] = useState<Recepcion | null>(null)

  // Estado de ordenamiento interactivo
  const [sortBy, setSortBy] = useState<'nombre' | 'checkIn' | 'checkOut'>('checkIn')
  const [sortAsc, setSortAsc] = useState<boolean>(false)


  // Función para alternar ordenamiento al pulsar encabezados
  const handleSort = (field: 'nombre' | 'checkIn' | 'checkOut') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(field)
      setSortAsc(true)
    }
  }

  // Lista ordenada interactivamente
  const sortedRecepciones = useMemo(() => {
    const list = [...recepciones]
    list.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'nombre') {
        const nameA = (a.huesped?.name || a.guestLabel || '').toLowerCase()
        const nameB = (b.huesped?.name || b.guestLabel || '').toLowerCase()
        comparison = nameA.localeCompare(nameB)
      } else if (sortBy === 'checkIn') {
        const dateA = new Date(a.checkIn).getTime() || 0
        const dateB = new Date(b.checkIn).getTime() || 0
        comparison = dateA - dateB
      } else if (sortBy === 'checkOut') {
        const dateA = new Date(a.checkOut).getTime() || 0
        const dateB = new Date(b.checkOut).getTime() || 0
        comparison = dateA - dateB
      }
      return sortAsc ? comparison : -comparison
    })
    return list
  }, [recepciones, sortBy, sortAsc])

  return (
    <section aria-label="Listado de recepciones" className="space-y-6">
      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Buscador reactivo */}
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-soft">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por huésped, documento, teléfono, habitación o sede…"
            className="w-full rounded-xl border border-line bg-canvas py-2 pl-9 pr-8 text-xs text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-3 flex items-center text-ink-soft hover:text-ink cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros por Sede y Estado */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Sede */}
          <div className="flex items-center gap-2">
            <label htmlFor="filtro-sede-tabla" className="text-xs text-ink-soft whitespace-nowrap font-medium">
              Sede:
            </label>
            <select
              id="filtro-sede-tabla"
              value={selectedSedeId}
              onChange={(e) => onSedeChange(e.target.value)}
              className="rounded-xl border border-line bg-canvas px-3 py-1.5 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="todas">Todas las sedes</option>
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Recarga */}
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            aria-label="Recargar recepciones"
            title="Recargar datos del servidor"
            className="grid size-8 place-items-center rounded-xl border border-line bg-canvas text-ink-muted hover:bg-panel hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`size-3.5 ${loading ? 'animate-spin text-primary' : ''}`}
            >
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Alerta en caso de error de sincronización */}
      {error && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          role="alert"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-xs text-amber-800 dark:text-amber-300"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-6 place-items-center rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-200 font-bold">
              !
            </span>
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onReload}
            disabled={loading}
            className="text-xs shrink-0"
          >
            Reintentar
          </Button>
        </motion.div>
      )}

      {/* Contador interactivo */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-ink-muted">
          Mostrando <span className="font-bold text-ink">{sortedRecepciones.length}</span> de{' '}
          <span className="font-bold text-ink">{totalCount}</span> recepciones encontradas
        </p>

        <span className="text-[11px] text-ink-soft hidden sm:inline">
          💡 Haz clic en una fila o en &quot;Detalles&quot; para consultar el registro completo
        </span>
      </div>

      {/* Tabla Interactiva de Recepciones con Scroll Infinito */}
      {loading && sortedRecepciones.length === 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] tracking-wider text-ink-muted uppercase">
                <th scope="col" className="px-5 py-3.5 font-semibold sm:px-6">Nombre</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Sede</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Fecha entrada</th>
                <th scope="col" className="px-4 py-3.5 font-semibold">Fecha salida</th>
                <th scope="col" className="px-4 py-3.5 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <TableSkeletonRows />
          </table>
        </div>
      ) : sortedRecepciones.length === 0 ? (
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel px-6 py-16 text-center shadow-sm"
        >
          <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </span>
          <h3 className="mt-4 text-base font-bold text-ink">
            No encontramos recepciones con los filtros actuales
          </h3>
          <p className="mt-1 max-w-sm text-xs text-ink-muted">
            Intenta cambiar los términos de búsqueda o registra una nueva recepción para comenzar.
          </p>
          <div className="mt-5 flex items-center gap-3">
            {searchQuery && (
              <Button
                variant="secondary"
                onClick={() => onSearchChange('')}
                className="text-xs px-3.5 py-1.5"
              >
                Limpiar búsqueda
              </Button>
            )}
            <Button
              variant="primary"
              onClick={onNewCheckIn}
              className="text-xs px-4 py-2"
            >
              Nuevo recepcion
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-sm">
          <InfiniteScroll
            hasMore={hasMore}
            isLoading={loading}
            onLoadMore={onLoadMore}
            threshold={200}
            endMessage={<InfiniteScrollEnd label="Ya visualizas todas las recepciones registradas." />}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm divide-y divide-line">
                <thead className="bg-canvas/50">
                  <tr className="text-[11px] tracking-wider text-ink-muted uppercase">
                    {/* 1. NOMBRE (ORDENABLE) */}
                    <th
                      scope="col"
                      onClick={() => handleSort('nombre')}
                      className="px-5 py-3.5 font-semibold sm:px-6 cursor-pointer select-none hover:text-primary transition-colors"
                      title="Haz clic para ordenar por nombre"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Nombre</span>
                        {sortBy === 'nombre' && (
                          <span className="text-primary font-bold text-xs">
                            {sortAsc ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* 2. SEDE */}
                    <th scope="col" className="px-4 py-3.5 font-semibold">
                      Sede
                    </th>

                    {/* 3. FECHA ENTRADA (ORDENABLE) */}
                    <th
                      scope="col"
                      onClick={() => handleSort('checkIn')}
                      className="px-4 py-3.5 font-semibold cursor-pointer select-none hover:text-primary transition-colors"
                      title="Haz clic para ordenar por fecha de entrada"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Fecha entrada</span>
                        {sortBy === 'checkIn' && (
                          <span className="text-primary font-bold text-xs">
                            {sortAsc ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* 4. FECHA SALIDA (ORDENABLE) */}
                    <th
                      scope="col"
                      onClick={() => handleSort('checkOut')}
                      className="px-4 py-3.5 font-semibold cursor-pointer select-none hover:text-primary transition-colors"
                      title="Haz clic para ordenar por fecha de salida"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Fecha salida</span>
                        {sortBy === 'checkOut' && (
                          <span className="text-primary font-bold text-xs">
                            {sortAsc ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>

                    {/* 5. BOTÓN DETALLE */}
                    <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                      Acción
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-line bg-panel">
                  {sortedRecepciones.map((item) => {
                    const guestName = item.huesped?.name || item.guestLabel || 'Huésped registrado'
                    const documentNumber = item.huesped?.documentNumber
                    const isEnProgreso = item.estado === 'progreso'
                    const isFinalizada = item.estado === 'finalizada'
                    const noches = item.noches || calcularNoches(item.checkIn, item.checkOut)

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedRecepcion(item)}
                        className="group transition-colors hover:bg-primary/[0.04] cursor-pointer"
                        title="Haz clic para ver el detalle de esta estadía"
                      >
                        {/* 1. NOMBRE */}
                        <td className="px-5 py-3.5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary shadow-2xs">
                              {getInitials(guestName)}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="block truncate font-semibold text-ink group-hover:text-primary transition-colors">
                                  {guestName}
                                </span>
                                <span
                                  className={`size-2 shrink-0 rounded-full ${
                                    isEnProgreso
                                      ? 'bg-emerald-500 animate-pulse'
                                      : isFinalizada
                                        ? 'bg-neutral'
                                        : 'bg-danger'
                                  }`}
                                  title={`Estado: ${item.estadoLabel}`}
                                />
                              </div>
                              {documentNumber && (
                                <span className="block text-[11px] text-ink-muted">
                                  CC {documentNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 2. SEDE */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {item.sede ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpenSede(item.sede?.id ?? 'sede-01')
                              }}
                              title="Inspeccionar sede y edificios"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/80 px-2.5 py-1 text-xs font-semibold text-ink hover:border-primary/40 hover:bg-primary/10 hover:text-primary transition-all cursor-pointer"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-secondary shrink-0">
                                <path d="M3 21h18" />
                                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                              </svg>
                              <span>{item.sede.name}</span>
                              <span className="text-[10px] text-primary/70">🔍</span>
                            </button>
                          ) : (
                            <span className="text-xs text-ink-muted">Sede Principal</span>
                          )}
                          {item.sede?.city && (
                            <span className="block text-[11px] text-ink-soft mt-0.5">
                              {item.sede.city}
                            </span>
                          )}
                        </td>

                        {/* 3. FECHA ENTRADA */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-medium text-ink text-xs">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-primary shrink-0">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span>{formatReadableDateTime(item.checkIn)}</span>
                          </div>
                        </td>

                        {/* 4. FECHA SALIDA */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 font-medium text-ink text-xs">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5 text-secondary shrink-0">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span>{formatReadableDateTime(item.checkOut)}</span>
                            </div>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                              {noches} {noches === 1 ? 'noche' : 'noches'}
                            </span>
                          </div>
                        </td>

                        {/* 5. BOTÓN DETALLE */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRecepcion(item)
                            }}
                            aria-label={`Ver detalle de la recepción de ${guestName}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-xs font-semibold text-ink-muted hover:border-line hover:bg-canvas hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                            <span>Detalle</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </InfiniteScroll>
        </div>
      )}

      {/* Modal de Detalle con AnimatePresence y fadeUp */}
      <AnimatePresence>
        {selectedRecepcion && (
          <RecepcionDetalleModal
            recepcion={selectedRecepcion}
            onClose={() => setSelectedRecepcion(null)}
            onOpenSede={onOpenSede}
            onOpenHabitacion={onOpenHabitacion}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
