import { motion, AnimatePresence } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import type { StatusCodeValidationResult } from '../../../../shared/lib/status-code-validator'

export interface PersonasStatusBannerProps {
  validation: StatusCodeValidationResult | null
  fromFallback?: boolean
  onDismiss?: () => void
  onRetry?: () => void
}

export function PersonasStatusBanner({
  validation,
  fromFallback,
  onDismiss,
  onRetry,
}: PersonasStatusBannerProps) {
  // Para status 200 el mensaje es estrictamente null según regla de status-code-validator.
  // Solo se muestra si hay un mensaje o si estamos usando datos de demostración con un status diferente a 200.
  if (!validation || (!validation.message && !fromFallback)) {
    return null
  }

  // Si fue 200 y no hay mensaje, no mostrar nada
  if (validation.status === 200) {
    return null
  }

  const isWarning = validation.category === 'warning'
  const isError = validation.category === 'error'

  const borderClass = isError
    ? 'border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200'
    : isWarning
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
      : 'border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200'

  const badgeClass = isError
    ? 'bg-red-500/20 text-red-700 dark:text-red-300'
    : isWarning
      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
      : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'

  return (
    <AnimatePresence>
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        role="alert"
        className={`flex items-start justify-between gap-3 p-4 rounded-2xl border shadow-xs ${borderClass}`}
      >
        <div className="flex items-start gap-3">
          <span className={`grid size-9 place-items-center rounded-xl shrink-0 ${badgeClass}`}>
            {isError ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            ) : isWarning ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="size-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
          </span>

          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {validation.title ?? `Aviso de respuesta HTTP (${validation.status})`}
            </h4>
            <p className="text-xs leading-relaxed opacity-90 max-w-2xl">
              {validation.message ?? 'Mostrando datos locales de demostración mientras el servidor procesa peticiones.'}
            </p>
            {fromFallback && (
              <span className="inline-block text-[11px] font-semibold text-primary/80 mt-1">
                ✦ Modo de demostración activo con datos de prueba seguros.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-current hover:bg-current/10 transition cursor-pointer"
            >
              Reintentar
            </button>
          )}
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-current/10 opacity-70 hover:opacity-100 transition cursor-pointer"
              title="Cerrar aviso"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
