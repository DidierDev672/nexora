import type { TarifaFiltrosState } from '../../application/use-tarifas-lista'
import {
  TarifasViewModeToggle,
  type TarifaViewMode,
} from './tarifas-view-mode-toggle'

export interface TarifasListaFiltrosProps {
  filtros: TarifaFiltrosState
  onSearchChange: (val: string) => void
  onModalityChange: (val: string) => void
  onStatusChange: (val: string) => void
  onReset: () => void
  onRefresh: () => void
  isLoading: boolean
  totalFiltered: number
  viewMode?: TarifaViewMode
  onViewModeChange?: (mode: TarifaViewMode) => void
}

export function TarifasListaFiltros({
  filtros,
  onSearchChange,
  onModalityChange,
  onStatusChange,
  onReset,
  onRefresh,
  isLoading,
  totalFiltered,
  viewMode,
  onViewModeChange,
}: TarifasListaFiltrosProps) {
  const hasActiveFilters =
    filtros.busqueda.trim() !== '' ||
    filtros.modalidad !== 'todas' ||
    filtros.estado !== 'todos'

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-stone-900/90 sm:flex-row sm:items-center sm:justify-between">
      {/* Grupo de filtros interactivos */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Campo de búsqueda */}
        <div className="relative min-w-[220px] flex-1 sm:flex-initial">
          <input
            type="text"
            value={filtros.busqueda}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, sede o tipo..."
            className="h-9 w-full rounded-xl border border-stone-300 bg-stone-50/50 pl-8 pr-3 text-xs text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          />
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-700 dark:text-stone-300">
            🔍
          </span>
        </div>

        {/* Filtro por modalidad */}
        <select
          value={filtros.modalidad}
          onChange={(e) => onModalityChange(e.target.value)}
          aria-label="Filtrar por modalidad"
          className="h-9 rounded-xl border border-stone-300 bg-stone-50/50 px-3 text-xs font-medium text-ink focus:border-primary focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
        >
          <option value="todas">Todas las modalidades</option>
          <option value="daily">Por día / Diario</option>
          <option value="nightly">Por noche</option>
          <option value="hourly">Por horas</option>
          <option value="weekly">Semanal</option>
        </select>

        {/* Filtro por estado */}
        <select
          value={filtros.estado}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filtrar por estado"
          className="h-9 rounded-xl border border-stone-300 bg-stone-50/50 px-3 text-xs font-medium text-ink focus:border-primary focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
        >
          <option value="todos">Todos los estados</option>
          <option value="active">Activas</option>
          <option value="inactive">Inactivas</option>
        </select>

        {/* Botón de limpiar filtros */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-primary transition hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Contador, menú de visualización por iconos y botón de refrescar */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
        <span className="text-xs text-stone-700 dark:text-stone-300">
          Mostrando <strong>{totalFiltered}</strong> tarifas
        </span>

        {viewMode && onViewModeChange && (
          <TarifasViewModeToggle
            viewMode={viewMode}
            onChange={onViewModeChange}
          />
        )}

        <button
          type="button"
          disabled={isLoading}
          onClick={onRefresh}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 text-xs font-medium text-stone-700 shadow-xs transition hover:bg-stone-50 active:scale-95 disabled:opacity-50 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
          title="Actualizar catálogo desde el servidor"
        >
          <span className={isLoading ? 'animate-spin' : ''}>🔄</span>
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>
    </div>
  )
}
