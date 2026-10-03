import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp } from '../../../../design-tokens/motion'
import { Button } from './button'

export interface WarningModalProps {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  busy?: boolean
  busyLabel?: string
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function WarningModal({
  open,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  busy = false,
  busyLabel = 'Procesando…',
  onConfirm,
  onCancel,
  children,
}: WarningModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="warning-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={busy ? undefined : onCancel}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              key="warning-modal"
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
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4M12 17h.01" />
                  </svg>
                </span>
                <h2 className="text-lg font-bold text-ink">{title}</h2>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">{message}</p>
              {children && <div className="mt-4">{children}</div>}
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
                  {cancelLabel}
                </Button>
                <Button type="button" variant="danger" onClick={onConfirm} disabled={busy}>
                  {busy ? busyLabel : confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}