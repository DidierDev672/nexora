import { motion } from 'motion/react'
import { cn } from '../lib/cn'

export interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Switch({ checked, onChange, label, description, disabled, className }: SwitchProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-panel px-4 py-3.5 transition-colors',
        checked ? 'border-primary/40 bg-primary/5' : 'hover:border-primary/25',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-xs text-ink-muted">{description}</span>
        ) : null}
      </span>

      <motion.button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        whileTap={{ scale: 0.92 }}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/40',
          checked ? 'bg-primary' : 'bg-neutral/35',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'inline-block size-4 rounded-full bg-white shadow-sm',
            checked ? 'ml-6' : 'ml-1',
          )}
        />
      </motion.button>
    </label>
  )
}