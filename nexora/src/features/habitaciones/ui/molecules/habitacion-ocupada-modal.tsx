import { motion, AnimatePresence } from 'motion/react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { HabitacionOcupadaModel } from '../../domain/habitacion-ocupada'
import { HabitacionOcupadaTabla } from './habitacion-ocupada-tabla'

export interface HabitacionOcupadaModalProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  model: HabitacionOcupadaModel
}

/**
 * Modal de Advertencia cuando una habitación se encuentra ocupada:
 * 1. Muestra la advertencia con enfoque psicológico para no alarmar al recepcionista.
 * 2. Bloquea e impide el modal de asignar huéspedes.
 * 3. Incorpora la tabla que dice explícitamente "OCUPADA" con el detalle de la estancia.
 */
export function HabitacionOcupadaModal({
  isOpen,
  onClose,
  onBack,
  model,
}: HabitacionOcupadaModalProps) {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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

          {/* Contenedor del Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-ocupada-title"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 290 }}
            className="relative my-auto w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-rose-500/30 bg-panel/95 p-5 sm:p-8 shadow-2xl backdrop-blur-2xl ring-1 ring-white/10 z-10 space-y-6"
          >
            {/* Resplandor decorativo de cabecera */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 size-72 rounded-full bg-rose-500/15 blur-3xl"
            />

            {/* Botón de cierre superior (X) con z-30 y pointer-events-none */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="absolute top-5 right-5 z-30 grid size-8.5 place-items-center rounded-full border border-line bg-canvas/80 text-ink-muted transition-all hover:bg-panel hover:text-ink hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer shadow-2xs"
              title="Cerrar aviso (Esc)"
              aria-label="Cerrar modal"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Cabecera del Modal con Enfoque Psicológico */}
            <div className="space-y-2 pr-6 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">
                  <span className="size-2 rotate-45 rounded-xs bg-rose-600 shadow-xs" />
                  Habitación {model.roomNumber} · OCUPADA
                </span>
              </div>

              <h2
                id="modal-ocupada-title"
                className="text-2xl sm:text-3xl font-black tracking-tight text-ink"
              >
                Habitación actualmente ocupada
              </h2>
              <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
                Tranquilo(a), tu inventario está protegido. Esta habitación ya cuenta con huéspedes alojados
                en este momento. Por políticas de confort y seguridad, <strong className="text-ink font-semibold">no es posible asignar más huéspedes</strong> mientras la estancia permanezca activa.
              </p>
            </div>

            {/* Tabla que certifica el estado "OCUPADA" y bloquea asignaciones */}
            <HabitacionOcupadaTabla model={model} showDetailedGuests={true} />

            {/* Acciones de Navegación del Modal */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-line/60">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onBack()
                }}
                className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-canvas/80 px-4 py-2.5 text-xs font-semibold text-ink-muted transition-all hover:border-primary/40 hover:bg-panel hover:text-ink active:scale-95"
                title="Volver y seleccionar otra habitación disponible"
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
                }}
                className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-500/50 bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-700 active:scale-95"
              >
                <span>Entendido / Consultar Habitación</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
