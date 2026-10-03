import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { InfiniteScroll, InfiniteScrollEnd } from '../../../../shared/ui/InfiniteScroll'
import { useTodayReservations } from '../../application/use-today-reservations'
import { type DashboardReservationItem, computeHoraFromDate } from '../../domain/dashboard-types'
import { Button } from '../atoms/button'
import {
  AlertTriangleIcon,
  BedIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  CloseIcon,
  EyeIcon,
  RefreshIcon,
  SearchIcon,
  SparklesIcon,
} from '../icons'
import { SedeDetalleModal } from '../../../recepciones/ui/molecules/sede-detalle-modal'
import { HabitacionDetalleModal } from '../../../recepciones/ui/molecules/habitacion-detalle-modal'

export interface RecentReservationsProps {
  onNavigateToReservas?: () => void
}

function initials(name: string): string {
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
 * Modal de detalle de reserva con psicología del usuario:
 * Presenta toda la información relevante de forma transparente y sin fricción.
 * Animado con variante `fadeUp` según las convenciones de src/agent.md.
 */
function ReservationDetailModal({
  item,
  onClose,
  onInspectHabitacion,
  onInspectSede,
}: {
  item: DashboardReservationItem | null
  onClose: () => void
  onInspectHabitacion?: (roomId: string, camaId?: string) => void
  onInspectSede?: (sedeId: string) => void
}) {
  if (!item) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-reserva-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
      />

      <motion.div
        key="modal-content"
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-panel p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="size-5" />
            </span>
            <div>
              <h3 id="modal-reserva-title" className="text-base font-bold text-ink">
                Detalle de la reserva
              </h3>
              <p className="text-xs text-ink-muted">
                Identificador único: <span className="font-mono">{item.id}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="grid size-8 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-canvas hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <CloseIcon className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          {/* Huésped */}
          <div className="rounded-xl border border-line bg-canvas/60 p-3.5">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {initials(item.guestName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-ink">{item.guestName}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                  {item.guestDocument && <span>Doc: {item.guestDocument}</span>}
                  {item.guestPhone && <span>Tel: {item.guestPhone}</span>}
                  {item.guestEmail && <span>Email: {item.guestEmail}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Habitación y Sede */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-canvas/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-ink-muted">Habitación</span>
                {onInspectHabitacion && item.roomId && (
                  <button
                    type="button"
                    onClick={() => onInspectHabitacion(item.roomId, item.camaId)}
                    aria-label={`Ver detalles de la habitación ${item.roomName} y tipos de cama`}
                    title="Ver detalles de la habitación y tipos de cama"
                    className="group/btn inline-flex items-center gap-1 rounded-lg border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary transition-all hover:border-primary/50 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                  >
                    <span>Ver detalle</span>
                    <ChevronRightIcon className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                )}
              </div>
              <div>
                <p className="font-semibold text-ink">{item.roomName}</p>
                {item.roomDescription && (
                  <p className="mt-0.5 text-xs text-ink-muted line-clamp-2">{item.roomDescription}</p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-line bg-canvas/40 p-3 space-y-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-medium text-ink-muted">Sede</span>
                {onInspectSede && item.headquarterId && (
                  <button
                    type="button"
                    onClick={() => onInspectSede(item.headquarterId!)}
                    aria-label={`Ver información de la sede ${item.sede} y sus subsedes`}
                    title="Ver detalles de la sede y subsedes"
                    className="group/btn inline-flex items-center gap-1 rounded-lg border border-line bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-muted transition-all hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                  >
                    <span>Ver sede</span>
                    <ChevronRightIcon className="size-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </button>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 font-semibold text-ink">
                  <BuildingIcon className="size-4 text-secondary shrink-0" />
                  <span>{item.sede}</span>
                </div>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {item.sedeCity ? `${item.sedeCity}${item.sedeAddress ? ` · ${item.sedeAddress}` : ''}` : 'Sede asignada'}
                </p>
              </div>
            </div>
          </div>

          {/* Fechas y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-canvas/40 p-3">
              <p className="text-xs font-medium text-ink-muted">Hora de llegada (Check-in)</p>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-ink">
                <ClockIcon className="size-4 text-primary" />
                <span>{computeHoraFromDate(item.hora)}</span>
              </div>
              {item.checkInDate && (
                <p className="mt-0.5 text-xs text-ink-muted">Fecha: {item.checkInDate}</p>
              )}
            </div>

            <div className="rounded-xl border border-line bg-canvas/40 p-3">
              <p className="text-xs font-medium text-ink-muted">Salida (Check-out)</p>
              <div className="mt-1 flex items-center gap-1.5 font-semibold text-ink">
                <ClockIcon className="size-4 text-secondary" />
                <span>{item.checkOutDate || 'Sin especificar'}</span>
              </div>
            </div>
          </div>

          {/* Estado y Huéspedes */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-canvas/40 px-4 py-3">
            <div>
              <p className="text-xs text-ink-muted">Estado de la reserva</p>
              <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {item.estado}
              </span>
            </div>

            {item.totalPrice !== undefined && (
              <div className="text-right">
                <p className="text-xs text-ink-muted">Tarifa total</p>
                <p className="text-sm font-bold text-ink">
                  ${item.totalPrice.toLocaleString('es-CO')}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Componente de estado de error con Psicología Positiva (Copywriting para evitar frustración):
 * - No culpa al usuario
 * - Asegura que la información está a salvo
 * - Ofrece acciones claras y tranquilizadoras
 * - Animado con `fadeUp` según src/agent.md
 */
function PsychologicalErrorState({
  is400,
  message,
  onRetry,
  onLoadDemo,
}: {
  is400: boolean
  message: string | null
  onRetry: () => void
  onLoadDemo: () => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="m-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-5 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
          <AlertTriangleIcon className="size-6" />
        </span>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-ink">
              Tus reservas están a salvo, solo necesitamos sincronizarlas
            </h3>
            {is400 && (
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                Código 400
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            {message ||
              'Notamos una pequeña interrupción en la solicitud para consultar las reservas de hoy (código 400). Tranquilo/a: no hiciste nada mal y la información de tu hotel sigue intacta en el sistema. Puedes reintentar la sincronización en un instante o activar los datos de demostración.'}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={onRetry} className="gap-2">
              <RefreshIcon className="size-4" />
              Reintentar sincronización
            </Button>

            <Button variant="secondary" onClick={onLoadDemo} className="gap-2">
              <SparklesIcon className="size-4 text-primary" />
              Ver datos de demostración
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Skeleton Loader para carga suave con efecto fadeUp según src/agent.md
 */
function TableSkeletonRows() {
  return (
    <motion.tbody
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="divide-y divide-line"
    >
      {[1, 2, 3, 4].map((i) => (
        <tr key={i} className="animate-pulse">
          <td className="px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-line/60" />
              <div className="space-y-1.5">
                <div className="h-4 w-28 rounded-md bg-line/60" />
                <div className="h-3 w-20 rounded-md bg-line/40" />
              </div>
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-24 rounded-md bg-line/60" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-16 rounded-md bg-line/60" />
          </td>
          <td className="px-4 py-4">
            <div className="h-6 w-20 rounded-full bg-line/50" />
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-20 rounded-md bg-line/60" />
          </td>
          <td className="px-4 py-4 text-right">
            <div className="ml-auto h-8 w-8 rounded-lg bg-line/50" />
          </td>
        </tr>
      ))}
    </motion.tbody>
  )
}

export function RecentReservations({ onNavigateToReservas }: RecentReservationsProps) {
  const {
    reservations,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    is400Error,
    errorMessage,
    searchQuery,
    setSearchQuery,
    reload,
    loadDemoData,
    triggerSimulate400,
    usingDemoData,
  } = useTodayReservations({ pageSize: 4 })

  const [selectedItem, setSelectedItem] = useState<DashboardReservationItem | null>(null)
  const [inspectSedeId, setInspectSedeId] = useState<string | null>(null)
  const [inspectRoomId, setInspectRoomId] = useState<string | null>(null)
  const [inspectCamaId, setInspectCamaId] = useState<string | null>(null)

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Reservas de hoy"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel shadow-sm"
    >
      {/* Cabecera de la sección con copywriting psicológico */}
      <div className="flex flex-col gap-4 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-ink">Reservas de hoy</h2>
            {usingDemoData && (
              <span className="rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                Modo Demo
              </span>
            )}
            {!isLoading && !is400Error && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                {totalCount} {totalCount === 1 ? 'reserva' : 'reservas'}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-ink-muted sm:text-sm">
            Los próximos huéspedes llegan puntuales. Este es el ritmo de la jornada.
          </p>
        </div>

        {/* Acciones superiores: Búsqueda, recarga y simulador */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador reactivo rápido */}
          <div className="relative w-full sm:w-48 lg:w-56">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar huésped, habitación…"
              aria-label="Filtrar reservas de hoy"
              className="w-full rounded-xl border border-line bg-canvas/60 py-1.5 pr-3 pl-8 text-xs text-ink transition-colors placeholder:text-ink-muted/70 focus:border-primary/50 focus:bg-panel focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botón de recarga en tiempo real */}
          <Button
            variant="ghost"
            onClick={reload}
            disabled={isLoading}
            aria-label="Recargar reservas"
            className="p-2!"
            title="Sincronizar reservas con el servidor"
          >
            <RefreshIcon className={`size-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </Button>

          {/* Botón interactivo para probar el estado psicológico 400 pedido por el usuario */}
          <button
            type="button"
            onClick={triggerSimulate400}
            title="Demostrar cómo responde el panel ante un error 400 con copywriting psicológico"
            className="rounded-lg border border-line/60 bg-canvas/40 px-2 py-1.5 text-[11px] font-medium text-ink-muted transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
          >
            Simular 400
          </button>

          {/* Botón para navegar al módulo de reservas completas */}
          {onNavigateToReservas && (
            <Button variant="ghost" onClick={onNavigateToReservas} className="text-xs">
              Ver todas
              <ChevronRightIcon className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Estado condicional: Error con psicología vs Tabla */}
      {is400Error || (errorMessage && reservations.length === 0) ? (
        <PsychologicalErrorState
          is400={is400Error}
          message={errorMessage}
          onRetry={reload}
          onLoadDemo={loadDemoData}
        />
      ) : (
        /* 
         * Cumplimiento estricto de src/agent.md:
         * 2. Toda lista de cards o tabla usa scroll infinito con el componente InfiniteScroll.tsx.
         * Efecto de entrada de la tabla: fade-in.
         */
        <InfiniteScroll
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoading={isLoadingMore}
          loader={
            <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 py-4 text-xs text-ink-muted">
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
              <span>Sincronizando más reservas…</span>
            </div>
          }
          endMessage={
            reservations.length > 0 ? (
              <InfiniteScrollEnd label="Ya aparecen todas las reservas de hoy." />
            ) : null
          }
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] tracking-wider text-ink-muted uppercase">
                  <th scope="col" className="px-5 py-3.5 font-semibold sm:px-6">
                    Huésped
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Habitación
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Sede
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Estado
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Hora
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right font-semibold">
                    Acción
                  </th>
                </tr>
              </thead>

              {isLoading && reservations.length === 0 ? (
                <TableSkeletonRows />
              ) : reservations.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="mx-auto max-w-sm px-4">
                        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                          <CheckCircleIcon className="size-6" />
                        </span>
                        <h4 className="mt-3 text-sm font-semibold text-ink">
                          {searchQuery ? 'Sin coincidencias para tu búsqueda' : 'Sin reservas pendientes para hoy'}
                        </h4>
                        <p className="mt-1 text-xs text-ink-muted">
                          {searchQuery
                            ? 'Prueba buscando con otro término o limpia el buscador.'
                            : 'Todas las habitaciones se encuentran en orden y preparadas para nuevas asignaciones.'}
                        </p>
                        {searchQuery && (
                          <div className="mt-3">
                            <Button variant="secondary" onClick={() => setSearchQuery('')} className="text-xs">
                              Limpiar búsqueda
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-line">
                  {reservations.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-primary/[0.04]"
                    >
                      {/* HUESPED -> name */}
                      <td className="px-5 py-3.5 sm:px-6">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary shadow-2xs">
                            {initials(item.guestName)}
                          </span>
                          <div className="min-w-0">
                            <span className="block truncate font-semibold text-ink">
                              {item.guestName}
                            </span>
                            {item.guestDocument && (
                              <span className="block text-[11px] text-ink-muted">
                                CC: {item.guestDocument}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Habitacion -> Clicable para abrir inspección de habitación y camas */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setInspectRoomId(item.roomId)
                            setInspectCamaId(item.camaId ?? null)
                          }}
                          aria-label={`Ver detalles de la habitación ${item.roomName} y sus camas`}
                          title="Haz clic para inspeccionar camas y tipos de confort de esta habitación"
                          className="group/room inline-flex items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-1.5 text-left transition-all hover:border-primary/25 hover:bg-primary/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                        >
                          <span className="grid size-7.5 place-items-center rounded-lg bg-primary/10 text-primary transition-all group-hover/room:bg-primary group-hover/room:text-white group-hover/room:shadow-xs">
                            <BedIcon className="size-4 shrink-0" />
                          </span>
                          <div>
                            <span className="block font-medium text-ink transition-colors group-hover/room:text-primary">
                              {item.roomName}
                            </span>
                            <span className="block text-[10px] text-ink-muted transition-colors group-hover/room:text-primary/80">
                              Ver camas y confort ➔
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* SEDE -> Clicable para abrir inspección de sede y sub-sedes */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectSedeId(item.headquarterId || null)}
                          aria-label={`Ver información de la sede ${item.sede} y sus subsedes`}
                          title="Haz clic para consultar detalles de la sede, subsedes y edificios"
                          className="group/sede inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas/70 px-2.5 py-1.5 text-xs font-medium text-ink transition-all hover:border-primary/40 hover:bg-primary/[0.06] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer shadow-2xs"
                        >
                          <BuildingIcon className="size-3.5 text-secondary shrink-0 transition-transform group-hover/sede:scale-110 group-hover/sede:text-primary" />
                          <span className="font-semibold">{item.sede}</span>
                          <span className="text-[10px] text-ink-muted transition-opacity group-hover/sede:text-primary">🔍</span>
                        </button>
                      </td>

                      {/* Estado -> "reserve" */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {item.estado}
                        </span>
                      </td>

                      {/* Hora -> función computable para convertir la fecha a solamente hora */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                          <ClockIcon className="size-3.5 text-primary" />
                          <span>{computeHoraFromDate(item.hora)}</span>
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          aria-label={`Ver detalle de la reserva de ${item.guestName}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-transparent px-2.5 py-1 text-xs font-medium text-ink-muted transition-colors hover:border-line hover:bg-canvas hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                          <EyeIcon className="size-3.5" />
                          <span className="hidden sm:inline">Detalles</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </InfiniteScroll>
      )}

      {/* Modal de Detalle de Reserva con AnimatePresence y fadeUp */}
      <AnimatePresence>
        {selectedItem && (
          <ReservationDetailModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onInspectHabitacion={(roomId, camaId) => {
              setInspectRoomId(roomId)
              setInspectCamaId(camaId ?? null)
            }}
            onInspectSede={(sedeId) => setInspectSedeId(sedeId)}
          />
        )}
      </AnimatePresence>

      {/* Modal Interactivo de Inspección de Sede (Sub-sedes y Edificios) */}
      <SedeDetalleModal
        sedeId={inspectSedeId}
        onClose={() => setInspectSedeId(null)}
      />

      {/* Modal Interactivo de Inspección de Habitación (Camas y Tipos de Cama) */}
      <HabitacionDetalleModal
        roomId={inspectRoomId}
        camaId={inspectCamaId}
        onClose={() => {
          setInspectRoomId(null)
          setInspectCamaId(null)
        }}
      />
    </motion.section>
  )
}