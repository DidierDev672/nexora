import { useEffect } from 'react'
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
export function RecepcionDetalleModal({
  recepcion,
  onClose,
  onOpenSede,
  onOpenHabitacion,
}: RecepcionDetalleModalProps) {
  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!recepcion) return null

  const isEnProgreso = recepcion.estado === 'progreso'
  const isFinalizada = recepcion.estado === 'finalizada'
  const noches =
    recepcion.noches || calcularNoches(recepcion.checkIn, recepcion.checkOut)

  const estadoBadgeClass = isEnProgreso
    ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-800 dark:text-emerald-300'
    : isFinalizada
      ? 'border-neutral/30 bg-neutral/10 text-ink-muted'
      : 'border-danger/30 bg-danger/10 text-danger'

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-recepcion-detalle-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop con efecto Fade In */}
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Ventana Modal con efecto Fade In */}
        <motion.div
          key="modal-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8 space-y-6"
        >
          {/* 1. Cabecera del modal con efecto Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-start justify-between gap-4 border-b border-line pb-4"
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary">
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
                    {recepcion.estadoLabel}
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
          </motion.div>

          {/* 2. Card: Información del Huésped con efecto Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-2xl border border-line bg-canvas/60 p-4 sm:p-5 space-y-3"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Huésped Principal
            </p>
            <div className="flex items-center gap-3.5">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/15 text-sm font-bold text-primary shadow-xs">
                {getInitials(recepcion.huesped?.name || recepcion.guestLabel)}
              </span>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-base font-bold text-ink truncate">
                  {recepcion.huesped?.name || recepcion.guestLabel}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
                  {recepcion.huesped?.documentNumber && (
                    <span className="font-medium">
                      Documento: <strong className="text-ink">{recepcion.huesped.documentNumber}</strong>
                    </span>
                  )}
                  {recepcion.huesped?.phoneNumber && (
                    <span className="font-medium">
                      Tel: <strong className="text-ink">{recepcion.huesped.phoneNumber}</strong>
                    </span>
                  )}
                  {recepcion.huesped?.email && (
                    <span className="font-medium">
                      Email: <strong className="text-ink">{recepcion.huesped.email}</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* 3. Ubicación Física Jerárquica */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-3"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Ubicación Asignada en la Red Hotelera
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Sede con efecto Fade In */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Sede</span>
                  {recepcion.sede && onOpenSede && (
                    <button
                      type="button"
                      onClick={() => onOpenSede(recepcion.sede?.id ?? 'sede-01')}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Inspeccionar sede ➔
                    </button>
                  )}
                </div>
                <p className="font-bold text-ink">
                  {recepcion.sede?.name || 'Sede Principal'}
                </p>
                {recepcion.sede?.city && (
                  <p className="text-xs text-ink-muted">
                    {recepcion.sede.city} {recepcion.sede.address ? `· ${recepcion.sede.address}` : ''}
                  </p>
                )}
              </motion.div>

              {/* Edificio / Torre con efecto Fade In */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5"
              >
                <span className="text-xs font-medium text-ink-muted">Edificio / Torre</span>
                <p className="font-bold text-ink">
                  {recepcion.edificio?.name || 'Torre Principal'}
                </p>
                <p className="text-xs text-ink-muted">
                  Piso: {recepcion.edificio?.floor ?? '1'}
                </p>
              </motion.div>

              {/* Habitación con efecto Fade In */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-ink-muted">Habitación</span>
                  {recepcion.roomId && onOpenHabitacion && (
                    <button
                      type="button"
                      onClick={() => onOpenHabitacion(recepcion.roomId, recepcion.cama?.id)}
                      className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                    >
                      Ver habitación ➔
                    </button>
                  )}
                </div>
                <p className="font-bold text-ink">
                  {recepcion.habitacion?.name || recepcion.roomLabel}
                </p>
                {recepcion.habitacion?.capacity && (
                  <p className="text-xs text-ink-muted">
                    Capacidad: {recepcion.habitacion.capacity} personas
                  </p>
                )}
              </motion.div>

              {/* Cama con efecto Fade In */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1.5"
              >
                <span className="text-xs font-medium text-ink-muted">Cama asignada</span>
                <p className="font-bold text-ink">
                  {recepcion.cama?.etiquette || 'Cama Estándar'}
                </p>
                {recepcion.cama?.tipoNombre && (
                  <p className="text-xs text-ink-muted">
                    Tipo: {recepcion.cama.tipoNombre}
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* 4. Fechas de Entrada y Salida */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Fecha de Entrada con efecto Fade In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1"
            >
              <span className="text-xs font-medium text-ink-muted">Fecha y hora de entrada</span>
              <p className="font-bold text-ink">
                {formatReadableDateTime(recepcion.checkIn)}
              </p>
            </motion.div>

            {/* Fecha de Salida con efecto Fade In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-ink-muted">Fecha y hora de salida</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                  {noches} {noches === 1 ? 'noche' : 'noches'}
                </span>
              </div>
              <p className="font-bold text-ink">
                {formatReadableDateTime(recepcion.checkOut)}
              </p>
            </motion.div>
          </div>

          {/* 5. Finanzas y Condiciones */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Método de Pago con efecto Fade In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1"
            >
              <span className="text-xs font-medium text-ink-muted">Método de pago</span>
              <p className="font-bold text-ink">
                {formatMetodoPago(recepcion.metodoPagoLabel || recepcion.metodoPago)}
              </p>
            </motion.div>

            {/* Depósito de Garantía con efecto Fade In */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1"
            >
              <span className="text-xs font-medium text-ink-muted">Depósito de garantía (Custodia)</span>
              <p className="text-base font-bold text-ink">
                {formatPrecioCOP(recepcion.depositoGarantia)}
              </p>
              <p className="text-[11px] text-ink-muted">
                Custodia activa hasta el check-out
              </p>
            </motion.div>
          </div>

          {/* 6. Card: Observaciones con efecto Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="rounded-xl border border-line bg-canvas/40 p-3.5 space-y-1"
          >
            <span className="text-xs font-medium text-ink-muted">Observaciones / Requerimientos</span>
            <p className="text-xs leading-relaxed text-ink italic">
              {recepcion.observaciones ? `"${recepcion.observaciones}"` : 'Sin observaciones registradas.'}
            </p>
          </motion.div>

          {/* 7. Footer con efecto Fade In */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex justify-end pt-2 border-t border-line/60"
          >
            <Button variant="primary" onClick={onClose} className="px-6">
              Entendido
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
