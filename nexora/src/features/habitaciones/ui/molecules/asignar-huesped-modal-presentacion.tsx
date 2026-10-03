import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { RoomRow } from '../../domain/habitacion-lista'
import { HabitacionStatusBadge } from './habitacion-status-badge'

export interface AsignarHuespedModalPresentacionProps {
  isOpen: boolean
  onClose: () => void
  room: RoomRow
  onBack: () => void
  /** Callback para abrir directamente el formulario de asignación */
  onStartAssignment?: () => void
}

/**
 * Modal de presentación para la Asignación de Huésped.
 * Transforma la información del header en una tarjeta de presentación flotante
 * estilo tarjeta iOS / glassmorphism que no satura la vista de la habitación:
 * - Copywriting psicológico orientado a beneficio y tranquilidad
 * - Resumen contextual (edificio, piso, cama, estado y número)
 * - Acciones claras: comenzar asignación o cambiar de habitación
 * - Animación fluida con física spring y cierre accesible por Escape o backdrop
 * - Renderizado en Portal (document.body) para evitar bloqueo de contexto y clics
 */
export function AsignarHuespedModalPresentacion({
  isOpen,
  onClose,
  room,
  onBack,
  onStartAssignment,
}: AsignarHuespedModalPresentacionProps) {
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop con desenfoque de cristal */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-md cursor-pointer"
            aria-hidden="true"
          />

          {/* Tarjeta de Presentación Estilo iOS Sheet / Glassmorphism */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-presentation-title"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-line/60 bg-panel/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 z-10"
          >
            {/* Resplandor decorativo de cabecera */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-primary/20 blur-3xl"
            />

            {/* Botón de cierre en esquina superior con z-30 y pointer-events-none */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="absolute top-5 right-5 z-30 grid size-8.5 place-items-center rounded-full border border-line bg-canvas/80 text-ink-muted transition-all hover:bg-panel hover:text-ink hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer shadow-2xs"
              title="Cerrar modal de presentación (Esc)"
              aria-label="Cerrar"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 pointer-events-none"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido de Presentación */}
            <div className="relative space-y-6">
              {/* Badge contextual superior */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                  <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  Habitación {room.number}
                </span>

                <HabitacionStatusBadge status={room.status} />
              </div>

              {/* Título y Copywriting Psicológico */}
              <div className="space-y-2">
                <h2
                  id="modal-presentation-title"
                  className="text-2xl sm:text-3xl font-black tracking-tight text-ink"
                >
                  Asigna un huésped a la{' '}
                  <span className="text-primary font-black">Habitación {room.number}</span>
                </h2>
                <p className="text-sm leading-relaxed text-ink-muted">
                  Vincula al huésped titular para preparar su llegada, registrar a sus acompañantes y dejar su estancia lista con total seguridad y confort.
                </p>
              </div>

              {/* Rejilla de Información Contextual de la Habitación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Edificio y Piso */}
                <div className="flex items-center gap-3 rounded-2xl border border-line/60 bg-canvas/70 p-3.5 shadow-2xs">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path d="M3 21h18" />
                      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      Ubicación
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-ink">
                      {room.building.name || 'Edificio principal'} · Piso {room.floor}
                    </span>
                  </div>
                </div>

                {/* Tipo de Cama y Capacidad */}
                <div className="flex items-center gap-3 rounded-2xl border border-line/60 bg-canvas/70 p-3.5 shadow-2xs">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary/15 text-secondary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                      <path d="M2 4v16" />
                      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                      <path d="M2 17h20" />
                      <path d="M6 8v9" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                      Mobiliario
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-ink">
                      {room.bed.name || 'Cama estándar'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-line/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onBack()
                  }}
                  className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-canvas/80 px-4 py-2.5 text-xs font-semibold text-ink-muted transition-all hover:border-primary/40 hover:bg-panel hover:text-ink active:scale-95"
                  title="Elegir otra habitación del catálogo"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none">
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  <span>Cambiar de habitación</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose()
                    onStartAssignment?.()
                  }}
                  className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/50 bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  <span>Continuar con la asignación</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
