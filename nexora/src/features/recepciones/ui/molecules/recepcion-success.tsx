import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { Button } from '../../../recursos/ui/atoms/button'
import {
  formatMetodoPago,
  formatPrecioCOP,
  formatReadableDateTime,
  type Recepcion,
} from '../../domain/recepcion'

export interface RecepcionSuccessProps {
  recepcion: Recepcion
  onReset: () => void
}

export function RecepcionSuccess({ recepcion, onReset }: RecepcionSuccessProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-emerald-500/25 bg-panel p-6 shadow-sm sm:p-10 text-center flex flex-col items-center"
    >
      <span className="grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
      </span>

      <div className="mt-4 max-w-lg space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Registro confirmado · Estadía iniciada con éxito
        </span>
        <h3 className="text-2xl font-bold text-ink sm:text-3xl">
          ¡Recepción registrada con éxito! Tu huésped ya tiene su habitación lista
        </h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          Todo ha quedado guardado y sincronizado a la perfección en el sistema. Puedes entregar las
          llaves con total tranquilidad; la estadía ha comenzado y el depósito de garantía quedó
          debidamente respaldado en Nexora.
        </p>
      </div>

      {/* Resumen detallado del check-in */}
      <div className="mt-6 w-full max-w-lg rounded-xl border border-line bg-canvas/60 p-5 text-left text-sm space-y-3">
        <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
          <span className="text-ink-muted">Habitación asignada:</span>
          <strong className="text-ink font-semibold text-right">{recepcion.roomLabel}</strong>
        </div>

        <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
          <span className="text-ink-muted">Huésped principal:</span>
          <strong className="text-ink font-semibold text-right">{recepcion.guestLabel}</strong>
        </div>

        {recepcion.reservaLabel && (
          <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
            <span className="text-ink-muted">Reserva asociada:</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md">
              {recepcion.reservaLabel}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
          <span className="text-ink-muted">Fecha y hora de entrada:</span>
          <strong className="text-ink font-semibold">
            {formatReadableDateTime(recepcion.checkIn)}
          </strong>
        </div>

        <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
          <span className="text-ink-muted">Fecha y hora de salida:</span>
          <strong className="text-ink font-semibold">
            {formatReadableDateTime(recepcion.checkOut)}
          </strong>
        </div>

        <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
          <span className="text-ink-muted">Método de pago:</span>
          <strong className="text-ink font-semibold uppercase text-xs tracking-wider">
            {formatMetodoPago(recepcion.metodoPagoLabel || recepcion.metodoPago)}
          </strong>
        </div>

        <div className="flex justify-between items-center border-b border-line/60 pb-2.5">
          <span className="text-ink-muted">Estado del registro:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            {recepcion.estadoLabel}
          </span>
        </div>

        {recepcion.observaciones && (
          <div className="flex justify-between items-start border-b border-line/60 pb-2.5">
            <span className="text-ink-muted">Observaciones (remarks):</span>
            <span className="text-xs text-ink max-w-[60%] text-right font-medium">
              {recepcion.observaciones}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center pt-1 text-base">
          <span className="font-medium text-ink">Depósito en custodia:</span>
          <strong className="text-primary font-bold text-lg">
            {formatPrecioCOP(recepcion.depositoGarantia)}
          </strong>
        </div>
      </div>

      <Button
        type="button"
        variant="primary"
        onClick={onReset}
        className="mt-8 px-6 py-2.5 font-semibold"
      >
        Registrar otra recepción
      </Button>
    </motion.div>
  )
}
