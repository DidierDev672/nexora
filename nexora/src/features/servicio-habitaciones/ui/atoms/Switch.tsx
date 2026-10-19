import { motion } from 'motion/react'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
  id?: string
}

/**
 * Componente Switch interactivo para conmutar entre true y false.
 * Implementa microanimación fluida con física de resorte (spring) de Framer Motion
 * y soporte de accesibilidad (role="switch", aria-checked).
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className = '',
  id,
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-line bg-panel px-4 py-3.5 transition-all select-none ${
        checked
          ? 'border-primary/40 bg-primary/5 shadow-2xs'
          : 'hover:border-primary/25 hover:bg-canvas/50'
      } ${disabled ? 'pointer-events-none opacity-50' : ''} ${className}`}
    >
      <span className="min-w-0 pr-2">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-ink-muted leading-relaxed">
            {description}
          </span>
        ) : null}
      </span>

      <motion.button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-hidden transition-colors focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer ${
          checked ? 'bg-primary' : 'bg-line/80'
        }`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`inline-block size-4.5 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'ml-5.5' : 'ml-1'
          }`}
        />
      </motion.button>
    </label>
  )
}
