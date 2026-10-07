import { getUserStatusConfig } from '../../domain/user-list'

export interface UserStatusBadgeProps {
  status?: string | null
  className?: string
}

/**
 * Badge de Estado de Usuario inspirado en los Chips de Material UI (MUI).
 * Ofrece contraste estético, legibilidad y textos 100% en español.
 */
export function UserStatusBadge({ status, className = '' }: UserStatusBadgeProps) {
  const config = getUserStatusConfig(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${config.colorClasses} ${config.bgClass} ${className}`}
      role="status"
      aria-label={`Estado del usuario: ${config.label}`}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${config.dotClass}`} />
      <span>{config.label}</span>
    </span>
  )
}
