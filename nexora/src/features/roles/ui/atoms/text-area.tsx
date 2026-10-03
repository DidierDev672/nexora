import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '../lib/cn'

export interface TextAreaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
}

export function TextArea({
  label,
  hint,
  error,
  required,
  className,
  id,
  ...props
}: TextAreaProps) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-primary"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </label>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-primary shadow-xs outline-none transition placeholder:text-neutral/60 focus:border-primary focus:ring-2',
          error
            ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
            : 'border-neutral/40 focus:ring-primary/30',
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-neutral">{hint}</p>
      ) : null}
    </div>
  )
}