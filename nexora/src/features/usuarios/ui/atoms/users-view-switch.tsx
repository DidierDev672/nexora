import { motion } from 'motion/react'
import type { UsersViewMode } from '../../domain/user-list'

export interface UsersViewSwitchProps {
  viewMode: UsersViewMode
  onChange: (mode: UsersViewMode) => void
  className?: string
}

/**
 * Control Switch interactivo estilo MUI ToggleButtonGroup para alternar
 * de manera fluida entre vista en Tarjetas (Card) y vista en Tabla (Table).
 */
export function UsersViewSwitch({
  viewMode,
  onChange,
  className = '',
}: UsersViewSwitchProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de visualización de usuarios"
      className={`inline-flex items-center rounded-xl border border-line bg-canvas/80 p-1 shadow-xs backdrop-blur-xs ${className}`}
    >
      {/* Opción 1: Tarjetas */}
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'card'}
        aria-label="Visualizar usuarios en tarjetas"
        title="Visualización en tarjetas"
        onClick={() => onChange('card')}
        className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          viewMode === 'card' ? 'text-primary' : 'text-ink-muted hover:text-ink'
        }`}
      >
        {viewMode === 'card' && (
          <motion.div
            layoutId="activeUsersViewSwitchIndicator"
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute inset-0 rounded-lg bg-panel shadow-xs"
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="5.8" height="5.8" rx="1.5" />
            <rect x="11.2" y="3" width="5.8" height="5.8" rx="1.5" />
            <rect x="3" y="11.2" width="5.8" height="5.8" rx="1.5" />
            <rect x="11.2" y="11.2" width="5.8" height="5.8" rx="1.5" />
          </svg>
          <span>Tarjetas</span>
        </span>
      </button>

      {/* Opción 2: Tabla */}
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'table'}
        aria-label="Visualizar usuarios en tabla"
        title="Visualización en tabla"
        onClick={() => onChange('table')}
        className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          viewMode === 'table' ? 'text-primary' : 'text-ink-muted hover:text-ink'
        }`}
      >
        {viewMode === 'table' && (
          <motion.div
            layoutId="activeUsersViewSwitchIndicator"
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute inset-0 rounded-lg bg-panel shadow-xs"
          />
        )}
        <span className="relative z-10 flex items-center gap-1.5">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 shrink-0"
            aria-hidden="true"
          >
            <rect x="2.5" y="3.5" width="15" height="13" rx="2" />
            <line x1="2.5" y1="8" x2="17.5" y2="8" />
            <line x1="2.5" y1="12.5" x2="17.5" y2="12.5" />
            <line x1="7.5" y1="8" x2="7.5" y2="16.5" />
          </svg>
          <span>Tabla</span>
        </span>
      </button>
    </div>
  )
}
