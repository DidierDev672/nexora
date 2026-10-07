import { useCatalogBedType } from '../../application/use-catalog'
import type { BedTypeCatalogItem } from '../../domain/catalog-types'

export interface BedTypeCardProps {
  bedTypeId?: string | null
  initialData?: BedTypeCatalogItem | null
  className?: string
}

/**
 * Molécula autónoma para visualizar el Tipo de Cama (GET /types-bed/{id}).
 */
export function BedTypeCard({ bedTypeId, initialData, className = '' }: BedTypeCardProps) {
  const query = useCatalogBedType(initialData ? null : bedTypeId)
  const bedType = initialData ?? query.data
  const loading = !initialData && query.loading

  if (loading) {
    return (
      <div className={`rounded-2xl border border-line bg-canvas/30 p-4 animate-pulse space-y-2 ${className}`}>
        <div className="h-4 w-28 bg-line/60 rounded-md" />
        <div className="h-6 w-44 bg-line/40 rounded-lg" />
      </div>
    )
  }

  if (!bedType) {
    return (
      <div className={`rounded-2xl border border-dashed border-line bg-canvas/20 p-3 text-center text-xs text-ink-muted ${className}`}>
        Información del tipo de cama no disponible.
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-line bg-canvas/40 p-3.5 space-y-1.5 ${className}`}>
      <span className="text-[11px] font-semibold text-ink-muted block">Tipo de Cama</span>
      <p className="font-bold text-ink text-sm">{bedType.name}</p>
      <p className="text-xs text-ink-muted">
        Capacidad para {bedType.capacity_people} {bedType.capacity_people === 1 ? 'persona' : 'personas'}
      </p>
      {bedType.description && (
        <p className="text-xs text-ink-muted italic pt-1">{bedType.description}</p>
      )}
    </div>
  )
}
