import type { ReactNode } from 'react'

export interface CatalogPillProps {
  label: string
  value: ReactNode
  icon?: ReactNode
  className?: string
}

/**
 * Átomo para renderizar un micro-dato estructurado (etiqueta + valor) sin IDs técnicos.
 */
export function CatalogPill({ label, value, icon, className = '' }: CatalogPillProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/60 px-3 py-1.5 text-xs text-ink ${className}`}
    >
      {icon && <span className="text-primary shrink-0">{icon}</span>}
      <span className="text-[11px] font-semibold text-ink-muted">{label}:</span>
      <span className="font-bold text-ink truncate">{value}</span>
    </div>
  )
}
