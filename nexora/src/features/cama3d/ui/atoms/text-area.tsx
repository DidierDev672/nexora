import { AnimatePresence, motion } from 'motion/react'
import { useId, type TextareaHTMLAttributes } from 'react'
import { fadeIn } from '../../../../design-tokens/motion'
import { cn } from '../lib/cn'

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  required?: boolean
}

export function TextArea({ label, error, hint, required, className, id, ...props }: TextAreaProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={fieldId} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
          {required && (
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
          )}
        </label>
      )}

      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        rows={3}
        className={cn(
          'w-full resize-none rounded-xl border bg-panel px-4 py-2.5 text-sm leading-relaxed text-ink shadow-xs outline-none transition-colors placeholder:text-ink-soft',
          error
            ? 'border-danger/50 focus:border-danger focus:ring-2 focus:ring-danger/20'
            : 'border-line hover:border-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
        )}
        {...props}
      />

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            key={errorId}
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            id={errorId}
            role="alert"
            className="mt-1.5 text-xs font-medium text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {!error && hint != null && <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{hint}</p>}
    </div>
  )
}