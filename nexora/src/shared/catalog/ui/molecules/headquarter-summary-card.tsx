import { useCatalogHeadquarter, useCatalogSubHeadquarter } from '../../application/use-catalog'
import { CatalogStatusBadge } from '../atoms/catalog-status-badge'
import type { HeadquarterCatalogItem, SubHeadquarterCatalogItem } from '../../domain/catalog-types'

export interface HeadquarterSummaryCardProps {
  headquartersId?: string | null
  subHeadquartersId?: string | null
  initialHeadquarter?: HeadquarterCatalogItem | null
  initialSubHeadquarter?: SubHeadquarterCatalogItem | null
  className?: string
}

/**
 * Molécula autónoma para visualizar la Sede Principal y Subsede (GET /headquarters y /sub-headquarters).
 * Muestra: nombre, dirección, ciudad, teléfono y estado sin exponer IDs.
 */
export function HeadquarterSummaryCard({
  headquartersId,
  subHeadquartersId,
  initialHeadquarter,
  initialSubHeadquarter,
  className = '',
}: HeadquarterSummaryCardProps) {
  const hqQuery = useCatalogHeadquarter(initialHeadquarter ? null : headquartersId)
  const subHqQuery = useCatalogSubHeadquarter(initialSubHeadquarter ? null : subHeadquartersId)

  const headquarter = initialHeadquarter ?? hqQuery.data
  const subHeadquarter = initialSubHeadquarter ?? subHqQuery.data
  const loading = (!initialHeadquarter && hqQuery.loading) || (!initialSubHeadquarter && subHqQuery.loading)

  if (loading) {
    return (
      <div className={`rounded-2xl border border-line bg-canvas/30 p-4 animate-pulse space-y-3 ${className}`}>
        <div className="h-4 w-32 bg-line/60 rounded-md" />
        <div className="h-14 bg-line/40 rounded-xl" />
      </div>
    )
  }

  if (!headquarter) {
    return (
      <div className={`rounded-2xl border border-dashed border-line bg-canvas/20 p-4 text-center text-xs text-ink-muted ${className}`}>
        Información de la sede no disponible.
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-line bg-canvas/40 p-4 space-y-4 ${className}`}>
      {/* Sede Principal */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-line/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div>
              <span className="text-xs font-bold text-ink">{headquarter.name}</span>
              <span className="text-[10px] text-ink-muted block">Sede Principal</span>
            </div>
          </div>
          <CatalogStatusBadge status={headquarter.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="rounded-xl border border-line/50 bg-panel/60 p-2.5 space-y-0.5">
            <span className="text-[11px] font-semibold text-ink-muted">Ciudad</span>
            <p className="font-bold text-ink">{headquarter.city}</p>
          </div>
          <div className="rounded-xl border border-line/50 bg-panel/60 p-2.5 space-y-0.5">
            <span className="text-[11px] font-semibold text-ink-muted">Dirección</span>
            <p className="font-semibold text-ink truncate">{headquarter.address}</p>
          </div>
          <div className="rounded-xl border border-line/50 bg-panel/60 p-2.5 space-y-0.5">
            <span className="text-[11px] font-semibold text-ink-muted">Teléfono</span>
            <p className="font-bold text-ink">{headquarter.phone}</p>
          </div>
        </div>
      </div>

      {/* Subsede (si existe) */}
      {subHeadquartersId ? (
        subHeadquarter ? (
          <div className="pt-2 border-t border-line/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-muted flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary/70" />
                Subsede: <strong className="text-ink">{subHeadquarter.name}</strong>
              </span>
              <CatalogStatusBadge status={subHeadquarter.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-ink-muted bg-panel/40 rounded-xl p-2.5 border border-line/40">
              <span>📍 {subHeadquarter.address}</span>
              <span>📞 {subHeadquarter.phone}</span>
            </div>
          </div>
        ) : null
      ) : (
        <div className="pt-2 border-t border-line/40 text-[11px] text-ink-muted flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-primary/40 shrink-0" />
          <span>Punto central único: Sede sin subsedes secundarias asignadas.</span>
        </div>
      )}
    </div>
  )
}
