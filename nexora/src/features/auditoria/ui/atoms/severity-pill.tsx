export interface SeverityPillProps {
  severity: 'baja' | 'media' | 'alta'
  count: number
  className?: string
}

export function SeverityPill({ severity, count, className = '' }: SeverityPillProps) {
  if (count === 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 ${className}`}
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Óptimo (0)
      </span>
    )
  }

  switch (severity) {
    case 'alta':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-rose-100/90 px-2.5 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
          Atención Alta ({count})
        </span>
      )
    case 'media':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-amber-100/90 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ${className}`}
        >
          <span className="size-1.5 rounded-full bg-amber-500" />
          Advertencia ({count})
        </span>
      )
    case 'baja':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-300 ${className}`}
        >
          Leve ({count})
        </span>
      )
  }
}
