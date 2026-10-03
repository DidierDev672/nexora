import { motion, AnimatePresence } from 'motion/react'
import type { InputHTMLAttributes } from 'react'

export interface AnimatedCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  checked: boolean
  onChange: () => void
  label?: string
  className?: string
  disabled?: boolean
}

/**
 * Checkbox accesible con microanimación Appear / Disappear mediante AnimatePresence de Motion.
 *
 * Características:
 * 1. Usa AnimatePresence para animar la entrada (appear) y la salida (disappear) del checkmark.
 * 2. Transición suave de escala y opacidad (scale: 0.5 -> 1.0 -> 0.5) en 0.22s.
 * 3. Envoltura accesible mediante input[type="checkbox"] con clase sr-only para navegación por teclado.
 */
export function AnimatedCheckbox({
  checked,
  onChange,
  label,
  className = '',
  disabled = false,
  id,
  ...rest
}: AnimatedCheckboxProps) {
  const inputId = id || `animated-chk-${Math.random().toString(36).substring(2, 9)}`

  return (
    <label
      htmlFor={inputId}
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${
        disabled ? 'cursor-not-allowed opacity-60' : ''
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="peer sr-only"
          {...rest}
        />

        {/* Caja exterior del Checkbox */}
        <div
          className={`grid size-5.5 place-items-center rounded-lg border transition-all duration-200 ${
            checked
              ? 'border-primary bg-primary text-primary-foreground shadow-xs'
              : disabled
              ? 'border-line/60 bg-canvas/40'
              : 'border-line bg-panel hover:border-primary/60 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30'
          }`}
        >
          {/* Animación Appear / Disappear con AnimatePresence */}
          <AnimatePresence mode="wait">
            {checked && (
              <motion.svg
                key="checked-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 15 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="size-3.5"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </div>

      {label && <span className="text-xs font-medium text-ink">{label}</span>}
    </label>
  )
}
