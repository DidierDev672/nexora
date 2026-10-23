import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faMagnifyingGlass,
  faXmark,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons'
import type { ReservaViewMode } from '../../domain/reserva-list-types'
import { ReservaViewSwitch } from '../atoms/reserva-view-switch'

interface ReservasListaToolbarProps {
  viewMode: ReservaViewMode
  onViewModeChange: (mode: ReservaViewMode) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  refreshing: boolean
  onRefresh: () => void
  totalCount: number
  filteredCount: number
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Todas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'in progress', label: 'En curso' },
  { id: 'completed', label: 'Finalizadas' },
  { id: 'canceled', label: 'Canceladas' },
]

export function ReservasListaToolbar({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  refreshing,
  onRefresh,
  totalCount,
  filteredCount,
}: ReservasListaToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 shadow-2xs sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Campo de búsqueda por huésped o habitación */}
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="size-3.5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por huésped o habitación..."
            className="w-full rounded-xl border border-line bg-canvas py-2 pl-9 pr-9 text-sm text-ink placeholder:text-neutral/70 focus:border-primary focus:bg-panel focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral hover:text-ink transition-colors"
            >
              <FontAwesomeIcon icon={faXmark} className="size-3.5" />
            </button>
          )}
        </div>

        {/* Controles de actualización, contador y switch de vista */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-xs font-medium text-ink-muted">
            {filteredCount === totalCount ? (
              <span>{totalCount} reservas</span>
            ) : (
              <span>{filteredCount} de {totalCount}</span>
            )}
          </span>

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Actualizar listado de reservas"
            className="inline-flex size-9 items-center justify-center rounded-xl border border-line bg-surface/50 text-ink-muted hover:bg-surface hover:text-ink transition-colors disabled:opacity-50"
            title="Recargar reservas"
          >
            <FontAwesomeIcon
              icon={faRotateRight}
              className={`size-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`}
            />
          </button>

          {/* Switch de visualización (cards vs table) */}
          <ReservaViewSwitch value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {/* Píldoras de filtro por estado */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-line/60 pt-3">
        {FILTER_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusFilterChange(opt.id)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface/50 text-ink-muted hover:bg-surface hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
