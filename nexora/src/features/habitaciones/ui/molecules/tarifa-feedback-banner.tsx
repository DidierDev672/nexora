import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import type { RoomTariffFeedback } from '../../domain/room-tariff'

interface TarifaFeedbackBannerProps {
  feedback: RoomTariffFeedback
  onDismiss?: () => void
}

export function TarifaFeedbackBanner({
  feedback,
  onDismiss,
}: TarifaFeedbackBannerProps) {
  const isSuccess = feedback.type === 'success'

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -10 }}
      role={isSuccess ? 'status' : 'alert'}
      aria-live="polite"
      className={`relative w-full rounded-2xl border p-5 shadow-sm transition-all sm:p-6 ${
        isSuccess
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icono con psicología visual */}
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl shadow-2xs ${
            isSuccess
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
              : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
          }`}
          aria-hidden="true"
        >
          {isSuccess ? (
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg
              className="size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        {/* Mensaje textual psicológicamente guiado */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                isSuccess
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isSuccess ? 'Confirmación de tarifa' : 'Aviso del sistema'}
            </span>
            {feedback.status ? (
              <span className="text-[11px] font-medium opacity-60">
                HTTP {feedback.status}
              </span>
            ) : null}
          </div>

          <h3 className="mt-1.5 text-base font-bold sm:text-lg">
            {feedback.title}
          </h3>

          <p className="mt-1 text-sm leading-relaxed opacity-90 sm:text-base">
            {feedback.message}
          </p>

          {feedback.subtext && (
            <p className="mt-1.5 text-xs leading-relaxed opacity-75 sm:text-sm">
              {feedback.subtext}
            </p>
          )}
        </div>

        {/* Botón opcional de cerrar */}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Cerrar notificación"
            className="text-ink-muted hover:text-ink -mr-1 -mt-1 rounded-lg p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    </motion.section>
  )
}
