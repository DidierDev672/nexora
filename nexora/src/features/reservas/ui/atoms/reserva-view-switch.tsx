import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGrip, faTable } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion/react'
import type { ReservaViewMode } from '../../domain/reserva-list-types'

interface ReservaViewSwitchProps {
  value: ReservaViewMode
  onChange: (mode: ReservaViewMode) => void
}

export function ReservaViewSwitch({ value, onChange }: ReservaViewSwitchProps) {
  return (
    <div
      role="group"
      aria-label="Selector de vista de reservas"
      className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface/60 p-1 shadow-inner backdrop-blur-xs"
    >
      <button
        type="button"
        onClick={() => onChange('cards')}
        aria-pressed={value === 'cards'}
        className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
          value === 'cards' ? 'text-white' : 'text-ink-muted hover:text-ink'
        }`}
      >
        {value === 'cards' && (
          <motion.span
            layoutId="reservaViewModeActivePill"
            className="absolute inset-0 rounded-lg bg-primary shadow-xs"
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faGrip} className="size-3.5" />
          <span className="hidden sm:inline">Tarjetas</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange('table')}
        aria-pressed={value === 'table'}
        className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
          value === 'table' ? 'text-white' : 'text-ink-muted hover:text-ink'
        }`}
      >
        {value === 'table' && (
          <motion.span
            layoutId="reservaViewModeActivePill"
            className="absolute inset-0 rounded-lg bg-primary shadow-xs"
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faTable} className="size-3.5" />
          <span className="hidden sm:inline">Tabla</span>
        </span>
      </button>
    </div>
  )
}
