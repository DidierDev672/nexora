import { AnimatePresence, motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import type { StatusCodePsychology } from '../../domain/tarifa-lista'

export interface TarifaStatusFeedbackBannerProps {
  feedback: StatusCodePsychology | null
  visible: boolean
  onClose: () => void
  onActionClick?: () => void
}

export function TarifaStatusFeedbackBanner({
  feedback,
  visible,
  onClose,
  onActionClick,
}: TarifaStatusFeedbackBannerProps) {
  if (!feedback || !visible) return null

  // Estilos y paletas según el tipo de feedback psicológico
  const isSuccess = feedback.type === 'success'
  const isWarning = feedback.type === 'warning'
  const isInfo = feedback.type === 'info'
  const isError = feedback.type === 'error'

  const borderClass = isSuccess
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
    : isWarning
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100'
      : isInfo
        ? 'border-sky-500/30 bg-sky-500/10 text-sky-950 dark:text-sky-100'
        : 'border-rose-500/30 bg-rose-500/10 text-rose-950 dark:text-rose-100'

  const iconBg = isSuccess
    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
    : isWarning
      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
      : isInfo
        ? 'bg-sky-500/20 text-sky-600 dark:text-sky-400'
        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'

  return (
    <AnimatePresence>
      <motion.section
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, y: -10 }}
        role={isError ? 'alert' : 'status'}
        aria-live="polite"
        className={`rounded-2xl border p-4 shadow-xs transition-all sm:p-5 ${borderClass}`}
      >
        <div className="flex items-start gap-3.5">
          {/* Icono emocional no amenazante */}
          <div
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${iconBg}`}
            aria-hidden="true"
          >
            {isSuccess ? (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : isWarning || isInfo ? (
              <svg
                className="size-5"
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
            ) : (
              <svg
                className="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          {/* Contenido empático */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-black/10 px-2 py-0.5 text-[11px] font-bold dark:bg-white/10">
                HTTP {feedback.statusCode || 'Conexión'}
              </span>
              <h4 className="text-sm font-bold sm:text-base">{feedback.title}</h4>
            </div>

            <p className="mt-1 text-xs leading-relaxed opacity-90 sm:text-sm">
              {feedback.message}
            </p>

            {feedback.subtext && (
              <p className="mt-1 text-[11px] leading-relaxed opacity-75 sm:text-xs">
                {feedback.subtext}
              </p>
            )}

            {/* Acciones para empoderar al usuario sin frustración */}
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              {feedback.suggestedActionLabel && (
                <button
                  type="button"
                  onClick={onActionClick}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-primary-hover active:scale-95"
                >
                  <span>{feedback.suggestedActionLabel}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-current/20 px-3 py-1.5 text-xs font-medium opacity-80 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5"
              >
                Entendido
              </button>
            </div>
          </div>

          {/* Botón de cerrar discreto */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar aviso"
            className="rounded-lg p-1 opacity-60 transition hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
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
        </div>
      </motion.section>
    </AnimatePresence>
  )
}
