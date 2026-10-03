import { motion } from 'motion/react'

export type HabitacionesViewMode = 'cards' | 'table'

export interface HabitacionesViewModeToggleProps {
  viewMode: HabitacionesViewMode
  onChange: (mode: HabitacionesViewMode) => void
  className?: string
}

/**
 * Selector de modo de visualización (Tarjetas / Tabla) para el catálogo de habitaciones.
 */
export function HabitacionesViewModeToggle({
  viewMode,
  onChange,
  className = '',
}: HabitacionesViewModeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Modo de visualización de habitaciones"
      className={`inline-flex items-center rounded-xl border border-line bg-canvas/80 p-1 shadow-2xs backdrop-blur-xs ${className}`}
    >
      {/* Botón Modo Tarjetas / Cards (Opción por defecto) */}
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'cards'}
        aria-label="Visualizar en tarjetas"
        title="Visualizar en tarjetas (cards)"
        onClick={() => onChange('cards')}
        className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          viewMode === 'cards'
            ? 'text-primary'
            : 'text-ink-muted hover:text-ink'
        }`}
      >
        {viewMode === 'cards' && (
          <motion.div
            layoutId="activeHabitacionesViewModeIndicator"
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
          <span className="text-xs font-medium">Tarjetas</span>
        </span>
      </button>

      {/* Botón Modo Tabla / Table */}
      <button
        type="button"
        role="radio"
        aria-checked={viewMode === 'table'}
        aria-label="Visualizar en tabla"
        title="Visualizar en tabla"
        onClick={() => onChange('table')}
        className={`relative flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          viewMode === 'table'
            ? 'text-primary'
            : 'text-ink-muted hover:text-ink'
        }`}
      >
        {viewMode === 'table' && (
          <motion.div
            layoutId="activeHabitacionesViewModeIndicator"
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
          <span className="text-xs font-medium">Tabla</span>
        </span>
      </button>
    </div>
  )
}
