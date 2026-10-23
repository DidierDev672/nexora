import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
  faCircleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import type { StatusCodeValidationResult } from '../../../../shared/lib/status-code-validator'

interface ReservasFeedbackBannerProps {
  feedback: StatusCodeValidationResult
  onDismiss: () => void
}

const CATEGORY_STYLES = {
  success: {
    container: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200',
    icon: faCircleCheck,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  info: {
    container: 'border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-200',
    icon: faCircleInfo,
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  warning: {
    container: 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200',
    icon: faTriangleExclamation,
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  error: {
    container: 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200',
    icon: faCircleExclamation,
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
}

export function ReservasFeedbackBanner({
  feedback,
  onDismiss,
}: ReservasFeedbackBannerProps) {
  if (!feedback.message) return null

  const style = CATEGORY_STYLES[feedback.category] || CATEGORY_STYLES.info

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`relative flex items-start justify-between gap-3 rounded-2xl border p-4 text-xs sm:text-sm shadow-xs ${style.container}`}
    >
      <div className="flex items-start gap-3">
        <FontAwesomeIcon icon={style.icon} className={`mt-0.5 size-4 shrink-0 ${style.iconColor}`} />
        <div>
          {feedback.title && (
            <h4 className="font-semibold text-ink leading-tight mb-1">{feedback.title}</h4>
          )}
          <p className="leading-relaxed opacity-90">{feedback.message}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Cerrar notificación"
        className="rounded-lg p-1 text-ink-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <FontAwesomeIcon icon={faXmark} className="size-3.5" />
      </button>
    </motion.div>
  )
}
