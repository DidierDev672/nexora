import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import {
  formatMetodoPago,
  formatPrecioCOP,
  formatReadableDateTime,
  type Recepcion,
} from '../../domain/recepcion'

export interface RecepcionCardProps {
  recepcion: Recepcion
  onOpenSede?: (sedeId: string) => void
  onOpenHabitacion?: (roomId: string, camaId?: string) => void
}

export function RecepcionCard({
  recepcion,
  onOpenSede,
  onOpenHabitacion,
}: RecepcionCardProps) {
  const isEnProgreso = recepcion.estado === 'progreso'
  const isFinalizada = recepcion.estado === 'finalizada'

  const estadoBadgeClass = isEnProgreso
    ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
    : isFinalizada
      ? 'border-neutral/30 bg-neutral/10 text-ink-muted'
      : 'border-danger/25 bg-danger/10 text-danger'

  return (
    <motion.article
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      <div>
        {/* Cabecera de la Card: Huésped y Estado */}
        <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3.5">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-ink group-hover:text-primary transition-colors">
              {recepcion.huesped?.name || recepcion.guestLabel}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              {recepcion.huesped?.documentNumber && (
                <span>CC {recepcion.huesped.documentNumber}</span>
              )}
              {recepcion.huesped?.phoneNumber && (
                <>
                  <span className="text-line">•</span>
                  <span>{recepcion.huesped.phoneNumber}</span>
                </>
              )}
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estadoBadgeClass}`}
          >
            {recepcion.estadoLabel}
          </span>
        </div>

        {/* Bloque Jerárquico de Ubicación (Sede -> Edificio -> Habitación -> Cama) */}
        <div className="mt-3.5 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Ubicación Asignada
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {/* Badge Interactivo de Sede */}
            {recepcion.sede && (
              <button
                type="button"
                onClick={() => onOpenSede?.(recepcion.sede?.id ?? 'sede-01')}
                title="Haz clic para inspeccionar detalles, subsedes y edificios de esta sede"
                className="group/badge inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3.5 transition-transform group-hover/badge:scale-110"
                >
                  <path d="M3 21h18" />
                  <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                </svg>
                <span>{recepcion.sede.name}</span>
                <span className="text-[10px] text-primary/70">🔍</span>
              </button>
            )}

            {/* Badge de Edificio */}
            {recepcion.edificio && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-ink-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3 text-ink-soft"
                >
                  <rect width="16" height="20" x="4" y="2" rx="2" />
                  <path d="M9 22v-4h6v4" />
                </svg>
                <span>
                  {recepcion.edificio.name}
                  {recepcion.habitacion?.floor ? ` · Piso ${recepcion.habitacion.floor}` : ''}
                </span>
              </span>
            )}

            {/* Badge Interactivo de Habitación */}
            <button
              type="button"
              onClick={() => onOpenHabitacion?.(recepcion.habitacion?.id || recepcion.roomId, recepcion.cama?.id)}
              title="Haz clic para inspeccionar camas y tipos de confort de esta habitación"
              className="group/hab inline-flex items-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5 text-blue-600 dark:text-blue-300 transition-transform group-hover/hab:scale-110"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <path d="M3 7h18" />
              </svg>
              <span>
                {recepcion.habitacion?.name || recepcion.roomLabel}
              </span>
              <span className="text-[10px] text-blue-500">🔍</span>
            </button>

            {/* Badge de Cama */}
            {recepcion.cama && (
              <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/5 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3 text-purple-500"
                >
                  <path d="M2 4v16" />
                  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                  <path d="M2 17h20" />
                </svg>
                <span>{recepcion.cama.etiquette}</span>
              </span>
            )}
          </div>
        </div>

        {/* Fechas de Estadía */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-canvas p-3 text-xs">
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Check-in
            </span>
            <span className="font-medium text-ink">
              {formatReadableDateTime(recepcion.checkIn)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">
              Check-out ({recepcion.noches || 1} {recepcion.noches === 1 ? 'noche' : 'noches'})
            </span>
            <span className="font-medium text-ink">
              {formatReadableDateTime(recepcion.checkOut)}
            </span>
          </div>
        </div>

        {/* Observaciones si existen */}
        {recepcion.observaciones && (
          <p className="mt-3 line-clamp-2 text-xs italic text-ink-muted">
            "{recepcion.observaciones}"
          </p>
        )}
      </div>

      {/* Pie de la Card: Depósito y Método de Pago */}
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-xs">
        <div>
          <span className="block text-[10px] text-ink-soft">Depósito de garantía</span>
          <span className="font-bold text-ink">
            {formatPrecioCOP(recepcion.depositoGarantia)}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[10px] text-ink-soft">Pago</span>
          <span className="font-medium text-ink-muted">
            {formatMetodoPago(recepcion.metodoPagoLabel || recepcion.metodoPago)}
          </span>
        </div>
      </div>
    </motion.article>
  )
}
