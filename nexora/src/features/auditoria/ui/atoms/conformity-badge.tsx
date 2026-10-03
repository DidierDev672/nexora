import type { ConformityVerdict } from '../../domain/audit-types'

export interface ConformityBadgeProps {
  verdict: ConformityVerdict
  notes?: string
  className?: string
}

export function ConformityBadge({ verdict, notes, className = '' }: ConformityBadgeProps) {
  switch (verdict) {
    case 'conforme':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-500/30 ${className}`}
          title={notes || 'Estado en sistema coincide con inventario y tarifario'}
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
          <span>✅ Conforme</span>
        </span>
      )
    case 'no_conforme':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/30 ${className}`}
          title={notes || 'Discrepancia detectada en tarifa o estado de sistema'}
        >
          <span className="size-1.5 rounded-full bg-rose-500" aria-hidden="true" />
          <span>❌ No conforme</span>
        </span>
      )
    case 'en_observacion':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-500/30 ${className}`}
          title={notes || 'Habitación con mantenimiento en curso o verificación pendiente'}
        >
          <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
          <span>🔧 En observación</span>
        </span>
      )
  }
}
