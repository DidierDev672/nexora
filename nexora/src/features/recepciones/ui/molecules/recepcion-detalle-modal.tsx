import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  formatMetodoPago,
  formatPrecioCOP,
  formatReadableDateTime,
  calcularNoches,
  type Recepcion,
} from '../../domain/recepcion'
import { Button } from '../../../recursos/ui/atoms/button'

export interface RecepcionDetalleModalProps {
  recepcion: Recepcion | null
  isOpen?: boolean
  onClose: () => void
  onOpenSede?: (sedeId: string) => void
  onOpenHabitacion?: (roomId: string, camaId?: string) => void
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
 * Modal interactivo para visualizar el detalle de la recepción y estadía
 * implementando ModalPresentationStyle (Estilo tarjeta iOS / Card Stack).
 */
export function RecepcionDetalleModal({
  recepcion,
  isOpen,
  onClose,
  onOpenSede,
  onOpenHabitacion,
}: RecepcionDetalleModalProps) {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(recepcion)
  const [cachedRecepcion, setCachedRecepcion] = useState<Recepcion | null>(recepcion)

  useEffect(() => {
    if (recepcion) {
      setCachedRecepcion(recepcion)
    }
  }, [recepcion])

  const currentRecepcion = recepcion ?? cachedRecepcion

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (scale-[0.93], rounded-[24px], origin-bottom)
  useEffect(() => {
    if (!isModalOpen) return
    const rootEl = document.getElementById('root')
    if (!rootEl) return

    const prevTransition = rootEl.style.transition
    const prevTransform = rootEl.style.transform
    const prevBorderRadius = rootEl.style.borderRadius
    const prevTransformOrigin = rootEl.style.transformOrigin
    const prevOverflow = rootEl.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyBg = document.body.style.backgroundColor

    rootEl.style.transition =
      'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
    rootEl.style.transformOrigin = 'bottom center'
    rootEl.style.transform = 'scale(0.93)'
    rootEl.style.borderRadius = '24px'
    rootEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000000'

    return () => {
      rootEl.style.transition = prevTransition
      rootEl.style.transform = prevTransform
      rootEl.style.borderRadius = prevBorderRadius
      rootEl.style.transformOrigin = prevTransformOrigin
      rootEl.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [isModalOpen])

  // Cerrar con Escape
  useEffect(() => {
    if (!isModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, onClose])

  if (!currentRecepcion) return null

  const isEnProgreso = currentRecepcion.estado === 'progreso'
  const isFinalizada = currentRecepcion.estado === 'finalizada'
  const noches =
    currentRecepcion.noches || calcularNoches(currentRecepcion.checkIn, currentRecepcion.checkOut)

  const estadoBadgeClass = isEnProgreso
    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
    : isFinalizada
      ? 'border-neutral/30 bg-neutral/10 text-ink-muted'
      : 'border-danger/30 bg-danger/10 text-danger'

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-recepcion-detalle-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop con efecto Fade In estilo iOS */}
          <motion.div
            key="backdrop-recepcion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Ventana Modal con efecto iOS Sheet (física Spring) */}
          <motion.div
            key="modal-content-recepcion"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8 space-y-6 text-ink"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* 1. Cabecera del modal */}
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      id="modal-recepcion-detalle-title"
                      className="text-lg font-bold text-ink"
                    >
                      Detalle de recepción y estadía
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estadoBadgeClass}`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          isEnProgreso
                            ? 'bg-emerald-500 animate-pulse'
                            : isFinalizada
                              ? 'bg-neutral'
                              : 'bg-danger'
                        }`}
                      />
                      {currentRecepcion.estadoLabel}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ventana de detalle"
                className="grid size-9 place-items-center rounded-xl text-ink-muted hover:bg-canvas hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-colors"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* 2. Card: Información del Huésped */}
            <div className="rounded-2xl border border-line bg-canvas/60 p-4 sm:p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                Huésped Principal
              </p>
              <div className="flex items-center gap-3.5">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-sm font-bold text-primary shadow-xs">
                  {getInitials(currentRecepcion.huesped?.name || currentRecepcion.guestLabel)}
                </span>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="text-base font-bold text-ink truncate">
                    {currentRecepcion.huesped?.name || currentRecepcion.guestLabel}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                    {currentRecepcion.huesped?.documentNumber && (
                      <span className="font-medium">
                        Documento: <strong className="text-ink">{currentRecepcion.huesped.documentNumber}</strong>
                      </span>
                    )}
                    {currentRecepcion.huesped?.phoneNumber && (
                      <span className="font-medium">
                        Tel: <strong className="text-ink">{currentRecepcion.huesped.phoneNumber}</strong>
                      </span>
                    )}
                    {currentRecepcion.huesped?.email && (
                      <span className="font-medium">
                        Email: <strong className="text-ink">{currentRecepcion.huesped.email}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Ubicación Física Jerárquica */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
                Ubicación Asignada en la Red Hotelera
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Sede */}
                <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-muted">Sede</span>
                    {currentRecepcion.sede && onOpenSede && (
                      <button
                        type="button"
                        onClick={() => onOpenSede(currentRecepcion.sede?.id ?? 'sede-01')}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Inspeccionar sede ➔
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-ink">
                    {currentRecepcion.sede?.name || 'Sede Principal'}
                  </p>
                  {currentRecepcion.sede?.city && (
                    <p className="text-xs text-ink-muted">
                      {currentRecepcion.sede.city} {currentRecepcion.sede.address ? `· ${currentRecepcion.sede.address}` : ''}
                    </p>
                  )}
                </div>

                {/* Edificio / Torre */}
                <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5">
                  <span className="text-xs font-medium text-ink-muted">Edificio / Torre</span>
                  <p className="font-bold text-ink">
                    {currentRecepcion.edificio?.name || 'Torre Principal'}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Piso: {currentRecepcion.edificio?.floor ?? '1'}
                  </p>
                </div>

                {/* Habitación */}
                <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-ink-muted">Habitación</span>
                    {currentRecepcion.roomId && onOpenHabitacion && (
                      <button
                        type="button"
                        onClick={() => onOpenHabitacion(currentRecepcion.roomId, currentRecepcion.cama?.id)}
                        className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                      >
                        Ver habitación ➔
                      </button>
                    )}
                  </div>
                  <p className="font-bold text-ink">
                    {currentRecepcion.habitacion?.name || currentRecepcion.roomLabel}
                  </p>
                  {currentRecepcion.habitacion?.capacity && (
                    <p className="text-xs text-ink-muted">
                      Capacidad: {currentRecepcion.habitacion.capacity} personas
                    </p>
                  )}
                </div>

                {/* Cama */}
                <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5">
                  <span className="text-xs font-medium text-ink-muted">Cama asignada</span>
                  <p className="font-bold text-ink">
                    {currentRecepcion.cama?.etiquette || 'Cama Estándar'}
                  </p>
                  {currentRecepcion.cama?.tipoNombre && (
                    <p className="text-xs text-ink-muted">
                      Tipo: {currentRecepcion.cama.tipoNombre}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 4. Fechas de Entrada y Salida */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Fecha de Entrada */}
              <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1">
                <span className="text-xs font-medium text-ink-muted">Fecha y hora de entrada</span>
                <p className="font-bold text-ink">
                  {formatReadableDateTime(currentRecepcion.checkIn)}
                </p>
              </div>

              {/* Fecha de Salida */}
              <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Fecha y hora de salida</span>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                    {noches} {noches === 1 ? 'noche' : 'noches'}
                  </span>
                </div>
                <p className="font-bold text-ink">
                  {formatReadableDateTime(currentRecepcion.checkOut)}
                </p>
              </div>
            </div>

            {/* 5. Finanzas y Condiciones (Formato COP) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Método de Pago */}
              <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1">
                <span className="text-xs font-medium text-ink-muted">Método de pago</span>
                <p className="font-bold text-ink">
                  {formatMetodoPago(currentRecepcion.metodoPagoLabel || currentRecepcion.metodoPago)}
                </p>
              </div>

              {/* Depósito de Garantía */}
              <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1">
                <span className="text-xs font-medium text-ink-muted">Depósito de garantía (Custodia)</span>
                <p className="text-base font-bold text-ink">
                  {formatPrecioCOP(currentRecepcion.depositoGarantia)}
                </p>
                <p className="text-[11px] text-ink-muted">
                  Custodia activa hasta el check-out
                </p>
              </div>
            </div>

            {/* 6. Card: Observaciones */}
            <div className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1">
              <span className="text-xs font-medium text-ink-muted">Observaciones / Requerimientos</span>
              <p className="text-xs leading-relaxed text-ink italic">
                {currentRecepcion.observaciones ? `"${currentRecepcion.observaciones}"` : 'Sin observaciones registradas.'}
              </p>
            </div>

            {/* 7. Footer con botón Entendido */}
            <div className="flex justify-end pt-2 border-t border-line/60">
              <Button variant="primary" onClick={onClose} className="px-6">
                Entendido
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
