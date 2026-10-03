import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { fadeUp } from '../../../../design-tokens/motion'
import { cn } from '../lib/cn'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  className?: string
  children: ReactNode
}

export function Modal({ isOpen, onClose, title, className, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" onClick={onClose}>
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden="true"
          />
          <div className="relative flex min-h-full items-center justify-center p-4">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label={title}
              onClick={(event) => event.stopPropagation()}
              className={cn(
                'w-full max-w-md rounded-2xl border border-line bg-panel p-5 shadow-2xl sm:p-6',
                className,
              )}
            >
              {title ? (
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-ink">{title}</h2>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={onClose}
                    aria-label="Cerrar"
                    title="Cerrar"
                    className="grid size-8 shrink-0 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:bg-primary/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>
              ) : null}
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}