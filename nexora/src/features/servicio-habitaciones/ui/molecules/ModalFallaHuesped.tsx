import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faTriangleExclamation,
  faRotateRight,
  faUser,
  faXmark,
  faIdCard,
} from '@fortawesome/free-solid-svg-icons'
import { fadeUp } from '../../../../design-tokens/motion'
import type { StatusCodeValidationResult } from '../../../../shared/lib/status-code-validator'
import { Loader } from '../../../tema/ui/atoms/loader'

export interface ModalFallaHuespedProps {
  isOpen: boolean
  onClose: () => void
  validation: StatusCodeValidationResult | null
  personId?: string
  onReintentar?: () => void
  isRetrying?: boolean
}

/**
 * Modal empático para comunicar fallas y contratiempos al consultar los datos del huésped
 * mediante GET /person/{id}, siguiendo las convenciones de src/agent.md y validaciones
 * de src/shared/lib/status-code-validator.ts.
 */
export function ModalFallaHuesped({
  isOpen,
  onClose,
  validation,
  personId,
  onReintentar,
  isRetrying = false,
}: ModalFallaHuespedProps) {
  // Manejo de tecla Escape para accesibilidad
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isRetrying) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isRetrying])

  if (!isOpen || !validation) return null

  const isWarning = validation.category === 'warning' || validation.status >= 400 && validation.status < 500
  const isError = validation.category === 'error' || validation.status >= 500

  // Configuración de paleta semántica y estética acorde a la psicología de retroalimentación
  const themeClasses = isError
    ? {
        badgeBg: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30',
        iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        icon: faCircleExclamation,
        border: 'border-rose-500/30',
      }
    : isWarning
      ? {
          badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
          icon: faTriangleExclamation,
          border: 'border-amber-500/30',
        }
      : {
          badgeBg: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
          iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
          icon: faCircleExclamation,
          border: 'border-sky-500/30',
        }

  const tituloModal =
    validation.title ||
    (isError
      ? 'Contratiempo al consultar huésped'
      : isWarning
        ? 'Aviso de sincronización de huésped'
        : 'Información del servicio')

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-falla-titulo"
      >
        {/* Backdrop desenfocado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isRetrying ? undefined : onClose}
          className="fixed inset-0 bg-ink/60 backdrop-blur-xs transition-opacity cursor-pointer"
          aria-hidden="true"
        />

        {/* Contenedor del Modal con animación fadeUp obligatoria según src/agent.md */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-panel shadow-2xl z-10 my-8 font-mono text-xs"
        >
          {/* Cabecera con iconografía y código de estado HTTP */}
          <div className="p-6 bg-canvas/70 border-b border-line flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`grid size-12 shrink-0 place-items-center rounded-2xl border text-xl ${themeClasses.iconBg}`}
              >
                <FontAwesomeIcon icon={themeClasses.icon} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${themeClasses.badgeBg}`}
                  >
                    <span>HTTP {validation.status}</span>
                  </span>
                  <span className="text-[10px] text-ink-muted uppercase font-bold tracking-wider">
                    Endpoint /person/{'{id}'}
                  </span>
                </div>
                <h3
                  id="modal-falla-titulo"
                  className="font-mono text-base font-black text-ink tracking-tight"
                >
                  {tituloModal}
                </h3>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              type="button"
              onClick={onClose}
              disabled={isRetrying}
              className="grid size-8 place-items-center rounded-xl bg-canvas text-ink-muted hover:text-ink hover:bg-line/40 transition-colors border border-line/60 cursor-pointer disabled:opacity-40"
              title="Cerrar aviso"
            >
              <FontAwesomeIcon icon={faXmark} className="size-3.5" />
            </button>
          </div>

          {/* Cuerpo del Modal con redacción psicológica */}
          <div className="p-6 space-y-4">
            {/* Mensaje validado empático */}
            <div className={`p-4 rounded-2xl border bg-canvas/60 ${themeClasses.border} space-y-2`}>
              <p className="text-xs text-ink leading-relaxed font-sans font-medium">
                {validation.message}
              </p>
            </div>

            {/* Certidumbre psicológica: los datos y comandas siguen intactos */}
            <div className="rounded-2xl border border-line bg-canvas/30 p-3.5 space-y-2">
              <div className="flex items-center gap-2 text-ink">
                <FontAwesomeIcon icon={faUser} className="size-3 text-primary shrink-0" />
                <span className="font-bold text-[11px]">
                  Tus pedidos y comandas continúan operando con normalidad
                </span>
              </div>
              <p className="text-[11px] text-ink-muted leading-relaxed font-sans">
                El sistema de servicio de habitaciones mantendrá en pantalla la asignación con los
                datos de respaldo correspondientes mientras se reintenta la comunicación con el
                servicio central de huéspedes.
              </p>
            </div>

            {/* Metadatos técnicos de referencia */}
            {personId && (
              <div className="rounded-xl border border-line/60 bg-canvas/40 px-3 py-2 flex items-center justify-between text-[11px]">
                <span className="text-ink-muted font-bold flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faIdCard} className="size-2.5 text-primary" />
                  <span>ID de Huésped:</span>
                </span>
                <span className="font-mono font-bold text-ink select-all">{personId}</span>
              </div>
            )}

            {/* Estado de reintento activo con Loader */}
            {isRetrying && (
              <div className="py-2 flex justify-center">
                <Loader
                  size={20}
                  label="Reintentando consulta con el servidor..."
                  className="text-xs"
                />
              </div>
            )}
          </div>

          {/* Pie de acciones */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 border-t border-line bg-canvas/50 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isRetrying}
              className="w-full sm:w-auto rounded-xl border border-line bg-canvas px-4 py-2.5 text-xs font-bold text-ink hover:bg-line/40 transition-all cursor-pointer disabled:opacity-40"
            >
              Cerrar y Continuar
            </button>

            {onReintentar && (
              <button
                type="button"
                onClick={onReintentar}
                disabled={isRetrying}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                <FontAwesomeIcon
                  icon={faRotateRight}
                  className={`size-3 ${isRetrying ? 'animate-spin' : ''}`}
                />
                <span>{isRetrying ? 'Reintentando...' : 'Reintentar Consulta'}</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
