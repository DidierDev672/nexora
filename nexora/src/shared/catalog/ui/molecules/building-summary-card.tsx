import { useCatalogBuilding } from '../../application/use-catalog'
import { CatalogStatusBadge } from '../atoms/catalog-status-badge'
import type { BuildingCatalogItem } from '../../domain/catalog-types'

export interface BuildingSummaryCardProps {
  buildingId?: string | null
  initialData?: BuildingCatalogItem | null
  className?: string
}

/**
 * Molécula autónoma para visualizar el Edificio o Torre (GET /building/{id}).
 * Muestra exclusivamente: nombre, pisos y estado en español.
 */
export function BuildingSummaryCard({
  buildingId,
  initialData,
  className = '',
}: BuildingSummaryCardProps) {
  const query = useCatalogBuilding(initialData ? null : buildingId)
  const building = initialData ?? query.data
  const loading = !initialData && query.loading

  if (loading) {
    return (
      <div className={`rounded-2xl border border-line bg-canvas/30 p-4 animate-pulse space-y-3 ${className}`}>
        <div className="h-4 w-28 bg-line/60 rounded-md" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-line/40 rounded-xl" />
          <div className="h-10 bg-line/40 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!building) {
    return (
      <div className={`rounded-2xl border border-dashed border-line bg-canvas/20 p-4 text-center text-xs text-ink-muted ${className}`}>
        Información del edificio no disponible.
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-line bg-canvas/40 p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-line/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="9" y1="6" x2="9.01" y2="6" />
              <line x1="15" y1="6" x2="15.01" y2="6" />
              <line x1="9" y1="10" x2="9.01" y2="10" />
              <line x1="15" y1="10" x2="15.01" y2="10" />
              <line x1="9" y1="14" x2="9.01" y2="14" />
              <line x1="15" y1="14" x2="15.01" y2="14" />
              <line x1="9" y1="18" x2="15" y2="18" />
            </svg>
          </span>
          <span className="text-xs font-bold text-ink">{building.name}</span>
        </div>
        <CatalogStatusBadge status={building.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-line/60 bg-panel/60 p-2.5 space-y-0.5">
          <span className="text-[11px] font-semibold text-ink-muted">Pisos o plantas</span>
          <p className="font-bold text-ink">
            {building.floor_number} {building.floor_number === 1 ? 'piso' : 'pisos'}
          </p>
        </div>

        <div className="rounded-xl border border-line/60 bg-panel/60 p-2.5 space-y-0.5">
          <span className="text-[11px] font-semibold text-ink-muted">Infraestructura</span>
          <p className="font-semibold text-ink truncate">Torre Habilitada</p>
        </div>
      </div>
    </div>
  )
}
