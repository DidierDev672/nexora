export interface GuestStepperProps {
  value: number
  onChange: (value: number) => void
  maxGuests?: number
  disabled?: boolean
  className?: string
  hasBedAssigned?: boolean
}

export function GuestStepper({
  value,
  onChange,
  maxGuests = 10,
  disabled = false,
  className = '',
  hasBedAssigned = true,
}: GuestStepperProps) {
  const isAtMin = value <= 1
  const isAtMax = value >= maxGuests

  const handleDecrease = () => {
    if (!isAtMin && !disabled) {
      onChange(value - 1)
    }
  }

  const handleIncrease = () => {
    if (!isAtMax && !disabled) {
      onChange(value + 1)
    }
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleDecrease}
          disabled={isAtMin || disabled}
          aria-label="Disminuir número de huéspedes"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-panel text-ink transition-all hover:bg-black/5 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <div className="flex min-w-[70px] flex-col items-center justify-center rounded-xl border border-line bg-canvas/70 px-3 py-1.5 text-center">
          <span className="text-base font-bold text-ink leading-tight">{value}</span>
          <span className="text-[10px] uppercase font-semibold text-ink-muted tracking-wider">
            {value === 1 ? 'Huésped' : 'Huéspedes'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={isAtMax || disabled}
          aria-label="Aumentar número de huéspedes"
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-panel text-ink transition-all hover:bg-black/5 active:scale-95 disabled:pointer-events-none disabled:opacity-40 dark:hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-primary shadow-2xs"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Indicadores contextuales */}
      {!hasBedAssigned ? (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">
          ⚠️ Arrastra una cama para definir la capacidad máxima de tu estadía.
        </p>
      ) : isAtMax ? (
        <p className="text-[11px] text-ink-muted">
          ✓ Capacidad física máxima alcanzada para esta cama ({maxGuests} pers.).
        </p>
      ) : (
        <p className="text-[11px] text-ink-muted">
          Hasta {maxGuests} personas permitidas según las dimensiones de la cama.
        </p>
      )}
    </div>
  )
}
