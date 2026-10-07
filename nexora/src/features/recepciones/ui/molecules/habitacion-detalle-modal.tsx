import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { formatPrecioCOP } from '../../domain/recepcion'
import { useHabitacionDetalle } from '../../application/use-habitacion-detalle'
import { formatRoomDisplayName } from '../../application/use-room-name'

export interface HabitacionDetalleModalProps {
  roomId: string | null
  camaId?: string | null
  onClose: () => void
}

export function HabitacionDetalleModal({
  roomId,
  camaId,
  onClose,
}: HabitacionDetalleModalProps) {
  const { loading, error, habitacion, camas } = useHabitacionDetalle(roomId)

  // Filtrado de cama asignada a la reserva:
  // Si camaId está presente (invocado desde una reserva o recepción), se visualiza ÚNICAMENTE la cama asignada y su tipo de confort.
  // Esto previene errores de asignación física en recepciones cuando una habitación dispone de varias camas.
  const camasMostradas = useMemo(() => {
    if (!camaId) return camas
    const asignada = camas.filter((c) => String(c.id) === String(camaId))
    return asignada.length > 0 ? asignada : (camas.length > 0 ? [camas[0]] : [])
  }, [camas, camaId])

  const cleanRoomTitle = useMemo(() => {
    if (!habitacion) return ''
    const base = formatRoomDisplayName(habitacion.name)
    if (habitacion.number && !base.includes(String(habitacion.number))) {
      return `${base} · Hab. ${habitacion.number}`
    }
    return base
  }, [habitacion])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!roomId) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="habitacion-modal-title"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Ventana Modal */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8"
        >
          {/* Botón de Cierre */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de habitación"
            className="absolute top-5 right-5 grid size-9 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <span className="size-8 animate-spin rounded-full border-3 border-blue-500/20 border-t-blue-500" />
              <p className="text-xs text-ink-muted">Cargando inventario de camas y confort…</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-center text-sm text-danger">
              {error}
            </div>
          ) : habitacion ? (
            <div className="space-y-6">
              {/* Encabezado de la Habitación */}
              <div className="border-b border-line/60 pb-4 pr-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  Ficha de Habitación
                </span>
                <h2 id="habitacion-modal-title" className="mt-2 text-2xl font-bold text-ink">
                  {cleanRoomTitle}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
                  <span>Piso {habitacion.floor ?? 1}</span>
                  <span className="text-line">•</span>
                  <span>Capacidad: {habitacion.capacity ?? 2} personas</span>
                  {habitacion.price && (
                    <>
                      <span className="text-line">•</span>
                      <span className="font-semibold text-ink">
                        Tarifa: {formatPrecioCOP(habitacion.price)} / noche
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Camas Físicas Instaladas y sus Tipos de Confort */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                      {camaId ? 'Cama y Tipo de Cama Asignada' : `Camas y Confort Asignado (${camas.length})`}
                    </h3>
                    {camaId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                        Asignada a la reserva
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-ink-soft">Configuración de descanso</span>
                </div>

                {camaId && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs text-ink-muted">
                    <span className="font-semibold text-primary">Asignación exclusiva:</span> Mostrando únicamente la cama y su tipo de cama vinculados a la reserva para evitar confusiones con otras plazas de la habitación.
                  </div>
                )}

                {camasMostradas.length === 0 ? (
                  <div className="rounded-xl border border-line/60 bg-canvas p-4 text-center text-xs text-ink-muted">
                    No se han registrado camas físicas para esta habitación todavía.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {camasMostradas.map((cama) => (
                      <div
                        key={cama.id}
                        className="rounded-2xl border border-line bg-canvas p-4 space-y-3 shadow-2xs"
                      >
                        {/* Fila superior de la Cama */}
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="grid size-8 place-items-center rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-300">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                                <path d="M2 4v16" />
                                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                                <path d="M2 17h20" />
                              </svg>
                            </span>
                            <div>
                              <p className="text-sm font-bold text-ink">{cama.etiquette}</p>
                              <p className="text-[11px] text-ink-muted">
                                Capacidad total: {cama.capacidadTotal} {cama.capacidadTotal === 1 ? 'huésped' : 'huéspedes'}
                              </p>
                            </div>
                          </div>

                          <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {cama.status === 'active' ? 'Disponible' : cama.status}
                          </span>
                        </div>

                        {/* Desglose de Tipos de Cama asociados a esta cama física */}
                        {cama.tiposDetalle.length > 0 && (
                          <div className="rounded-xl bg-panel border border-line/60 p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                                Tipo de cama y confort
                              </p>
                              <span className="text-[10px] font-semibold text-primary">
                                {cama.tiposDetalle.length === 1 ? '1 tipo asignado' : `${cama.tiposDetalle.length} tipos`}
                              </span>
                            </div>
                            <div className="space-y-2">
                              {cama.tiposDetalle.map((tipo) => (
                                <div key={tipo.id} className="text-xs space-y-0.5">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-ink">{tipo.name}</span>
                                    <span className="text-[11px] text-primary font-medium">
                                      {tipo.capacity_people} {tipo.capacity_people === 1 ? 'persona' : 'personas'}
                                    </span>
                                  </div>
                                  {tipo.description && (
                                    <p className="text-ink-muted text-[11px]">
                                      {tipo.description}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
