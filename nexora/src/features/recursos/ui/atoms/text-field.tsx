import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  hint?: ReactNode
  error?: string
  hideLabel?: boolean
  required?: boolean
  className?: string
}

export function TextField({
  label,
  hint,
  error,
  hideLabel,
  required,
  className,
  id,
  ...props
}: TextFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className={hideLabel ? 'sr-only' : 'block text-sm font-medium text-ink'}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full rounded-lg border bg-panel px-3.5 py-2.5 text-sm text-ink shadow-xs outline-none transition placeholder:text-ink-soft focus:border-primary focus:ring-2',
          error
            ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
            : 'border-line focus:ring-primary/30',
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  )
}