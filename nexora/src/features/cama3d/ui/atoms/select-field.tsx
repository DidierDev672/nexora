import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface SelectFieldOption {
  value: string
  label: string
}

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string
  placeholder?: string
  error?: string
  hint?: ReactNode
  required?: boolean
  className?: string
  options: ReadonlyArray<SelectFieldOption>
  emptyLabel?: string
  icon?: ReactNode
}

export function SelectField({
  label,
  placeholder = 'Seleccionar…',
  error,
  hint,
  required,
  className,
  id,
  options,
  emptyLabel,
  icon,
  disabled,
  ...props
}: SelectFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>

      {options.length === 0 && emptyLabel && !disabled ? (
        <div className="rounded-xl border border-dashed border-line bg-panel/60 px-4 py-2.5 text-sm text-ink-muted">
          {emptyLabel}
        </div>
      ) : (
        <div className="relative">
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-soft"
            >
              {icon}
            </span>
          )}

          <select
            id={fieldId}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              'w-full cursor-pointer appearance-none rounded-xl border bg-panel px-4 py-2.5 pr-10 text-sm text-ink shadow-xs outline-none transition-colors',
              icon ? 'pl-10' : 'pl-4',
              error
                ? 'border-danger/60 focus:border-danger focus:ring-2 focus:ring-danger/25'
                : 'border-line hover:border-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      )}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
}
