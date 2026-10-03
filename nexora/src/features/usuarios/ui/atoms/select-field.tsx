import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '../../../../shared/lib/cn'

export interface SelectFieldProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  label: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function SelectField({
  label,
  error,
  required,
  className,
  id,
  children,
  ...props
}: SelectFieldProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={fieldId} className="block text-sm font-medium text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-lg border bg-panel px-3.5 py-2.5 pr-10 text-sm text-ink shadow-xs outline-none transition focus:border-primary focus:ring-2',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
              : 'border-line focus:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}