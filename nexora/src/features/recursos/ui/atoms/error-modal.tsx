import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp } from '../../../../design-tokens/motion'

export interface ErrorModalProps {
  open: boolean
  onClose: () => void
  title?: string
  message?: string
  children?: ReactNode
}

export function ErrorModal({
  open,
  onClose,
  title = 'Algo no salió como esperábamos',
  message = 'No es tu culpa: nada se perdió. Probá de nuevo en un instante y seguimos.',
  children,
}: ErrorModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="error-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="error-modal"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="alertdialog"
              aria-modal="true"
              aria-label={title}
              className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5"
                    aria-hidden="true"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                </span>
                <h2 className="text-lg font-bold text-ink">{title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{message}</p>
              {children && <div className="mt-4">{children}</div>}
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-cream shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
