import { useCatalogRoomType } from '../../application/use-catalog'
import { formatCOP } from '../../domain/catalog-translations'
import type { RoomTypeCatalogItem } from '../../domain/catalog-types'

export interface RoomTypeCardProps {
  roomTypeId?: string | null
  initialData?: RoomTypeCatalogItem | null
  className?: string
}

/**
 * Molécula autónoma para visualizar el Tipo de Habitación (GET /room-types/{id}).
 * Muestra exclusivamente: nombre, capacidad y precio base en moneda colombiana (COP).
 */
export function RoomTypeCard({ roomTypeId, initialData, className = '' }: RoomTypeCardProps) {
  const query = useCatalogRoomType(initialData ? null : roomTypeId)
  const roomType = initialData ?? query.data
  const loading = !initialData && query.loading

  if (loading) {
    return (
      <div className={`rounded-2xl border border-line bg-canvas/30 p-4 animate-pulse space-y-3 ${className}`}>
        <div className="h-4 w-32 bg-line/60 rounded-md" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-10 bg-line/40 rounded-xl" />
          <div className="h-10 bg-line/40 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!roomType) {
    return (
      <div className={`rounded-2xl border border-dashed border-line bg-canvas/20 p-4 text-center text-xs text-ink-muted ${className}`}>
        Información del tipo de habitación no disponible.
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-line bg-canvas/40 p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-line/50 pb-2">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
          </span>
          <span className="text-xs font-bold text-ink">{roomType.name}</span>
        </div>
        <span className="text-[11px] font-semibold text-ink-muted">Tipo de Habitación</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-line/60 bg-panel/60 p-2.5 space-y-0.5">
          <span className="text-[11px] font-semibold text-ink-muted">Capacidad</span>
          <p className="font-bold text-ink">
            {roomType.capacity} {roomType.capacity === 1 ? 'huésped' : 'huéspedes'}
          </p>
        </div>

        <div className="rounded-xl border border-line/60 bg-panel/60 p-2.5 space-y-0.5">
          <span className="text-[11px] font-semibold text-ink-muted">Precio base por noche</span>
          <p className="font-extrabold text-primary">{formatCOP(roomType.base_price)}</p>
        </div>
      </div>
    </div>
  )
}
