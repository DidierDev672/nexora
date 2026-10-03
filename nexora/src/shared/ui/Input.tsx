import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { fadeIn } from '../../design-tokens/motion'
import { cn } from '../lib/cn'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Etiqueta superior del campo. Si se omite, el input queda sin label. */
  label?: string
  /** Mensaje de error de validación, mostrado en rojo. */
  error?: string
  /** Texto de ayuda bajo el campo. Se oculta mientras haya un error. */
  hint?: ReactNode
  /** Icono opcional dentro del input (lado izquierdo o derecho). */
  icon?: ReactNode
  /** Lado donde se coloca el icono. Por defecto `left`. */
  iconPosition?: 'left' | 'right'
  /** Elemento interactivo opcional al final del input (ej. botón para mostrar/ocultar). */
  action?: ReactNode
  required?: boolean
}

export function Input({
  label,
  error,
  hint,
  icon,
  iconPosition = 'left',
  action,
  required,
  className,
  id,
  ...props
}: InputProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`
  const hasIcon = icon != null

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

      <div className="relative">
        {hasIcon && (
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-y-0 flex items-center text-ink-soft',
              iconPosition === 'left' ? 'left-3.5' : 'right-3.5',
            )}
          >
            {icon}
          </span>
        )}

        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full rounded-xl border bg-panel px-4 py-2.5 text-sm text-ink shadow-xs outline-none transition-colors placeholder:text-ink-soft',
            hasIcon && (iconPosition === 'left' ? 'pl-10' : 'pr-10'),
            Boolean(action) && 'pr-11',
            error
              ? 'border-danger/50 focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-line hover:border-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        />

        {action && (
          <span className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center [&_button]:pointer-events-auto">
            {action}
          </span>
        )}
      </div>

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

      {!error && hint != null && (
        <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">{hint}</p>
      )}
    </div>
  )
}