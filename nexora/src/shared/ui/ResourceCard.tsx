import { useId, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { fadeIn } from '../../design-tokens/motion'
import { cn } from '../lib/cn'

/* ------------------------------------------------------------------ */
/*  Atoms internos (SelectField inline para no romper Atomic Design)  */
/* ------------------------------------------------------------------ */

interface FieldOption {
  value: string
  label: string
}

interface SelectFieldProps {
  label: string
  options: ReadonlyArray<FieldOption>
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  required,
  error,
  disabled,
  className,
}: SelectFieldProps) {
  const autoId = useId()
  const fieldId = `rc-${autoId}`
  const errorId = `${fieldId}-error`

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-ink"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">*</span>
        )}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          className={cn(
            'w-full cursor-pointer appearance-none rounded-lg border bg-panel px-3.5 py-2.5 pr-10 text-sm text-ink shadow-xs outline-none transition focus:border-primary focus:ring-2',
            error
              ? 'border-danger/60 focus:border-danger focus:ring-danger/25'
              : 'border-line focus:ring-primary/30',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
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

/* ------------------------------------------------------------------ */
/*  ResourceCard — Card reutilizable para crear recursos              */
/* ------------------------------------------------------------------ */

export type RouteType = string
export type ComponentType = string

export interface ResourceCardProps {
  /** Título de la card */
  title: string
  /** Descripción opcional debajo del título */
  description?: string

  /* --- Select: Tipo de ruta --- */
  routeTypeLabel?: string
  routeTypeOptions: ReadonlyArray<FieldOption>
  routeTypeValue: string
  onRouteTypeChange: (value: RouteType) => void
  routeTypePlaceholder?: string
  routeTypeError?: string

  /* --- Select: Tipo de componente --- */
  componentTypeLabel?: string
  componentTypeOptions: ReadonlyArray<FieldOption>
  componentTypeValue: string
  onComponentTypeChange: (value: ComponentType) => void
  componentTypePlaceholder?: string
  componentTypeError?: string

  /* --- Botón crear --- */
  createLabel?: string
  onCreate: () => void
  createDisabled?: boolean
  createLoading?: boolean

  /* --- Layout --- */
  delay?: number
  className?: string
  children?: ReactNode
}

export function ResourceCard({
  title,
  description,
  routeTypeLabel = 'Tipo de ruta',
  routeTypeOptions,
  routeTypeValue,
  onRouteTypeChange,
  routeTypePlaceholder = 'Seleccionar tipo de ruta…',
  routeTypeError,
  componentTypeLabel = 'Tipo de componente',
  componentTypeOptions,
  componentTypeValue,
  onComponentTypeChange,
  componentTypePlaceholder = 'Seleccionar tipo de componente…',
  componentTypeError,
  createLabel = 'Crear recurso',
  onCreate,
  createDisabled = false,
  createLoading = false,
  delay = 0,
  className,
  children,
}: ResourceCardProps) {
  const isValid = routeTypeValue !== '' && componentTypeValue !== ''

  return (
    <motion.article
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35, delay: delay / 1000, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 24 } }}
      className={cn(
        'overflow-hidden rounded-2xl border border-line bg-panel shadow-sm',
        className,
      )}
    >
      {/* Header */}
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>

      {/* Body */}
      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={routeTypeLabel}
            options={routeTypeOptions}
            value={routeTypeValue}
            onChange={onRouteTypeChange}
            placeholder={routeTypePlaceholder}
            required
            error={routeTypeError}
          />
          <SelectField
            label={componentTypeLabel}
            options={componentTypeOptions}
            value={componentTypeValue}
            onChange={onComponentTypeChange}
            placeholder={componentTypePlaceholder}
            required
            error={componentTypeError}
          />
        </div>

        {children ? <div className="mt-4">{children}</div> : null}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            onClick={onCreate}
            disabled={createDisabled || createLoading || !isValid}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold outline-none transition-colors',
              'bg-primary text-white shadow-sm',
              'hover:bg-primary/90 active:bg-primary/95 focus-visible:ring-2 focus-visible:ring-primary/40',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            {createLoading ? (
              <>
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creando…
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                {createLabel}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
