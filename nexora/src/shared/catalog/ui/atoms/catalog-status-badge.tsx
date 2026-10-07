import { translateCatalogStatus } from '../../domain/catalog-translations'

export interface CatalogStatusBadgeProps {
  status?: string | null
  className?: string
}

/**
 * Átomo para renderizar insignias de estado 100% en español con indicador luminoso.
 */
export function CatalogStatusBadge({ status, className = '' }: CatalogStatusBadgeProps) {
  const config = translateCatalogStatus(status)

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.colorClasses} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  )
}
