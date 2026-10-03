import type { HabitacionesListFilters } from '../../domain/habitacion-lista';
import {
  HabitacionesViewModeToggle,
  type HabitacionesViewMode,
} from './habitaciones-view-mode-toggle';

interface HabitacionesFiltrosBarProps {
  filters: HabitacionesListFilters;
  knownBuildings: { id: string; name: string }[];
  loadedCount: number;
  totalCount: number;
  filteredCount: number;
  onFilterChange: (next: HabitacionesListFilters) => void;
  onReload: () => void;
  isReloading?: boolean;
  viewMode?: HabitacionesViewMode;
  onViewModeChange?: (mode: HabitacionesViewMode) => void;
  onRecheckTarifas?: () => void;
  isVerifyingTarifas?: boolean;
}

export function HabitacionesFiltrosBar({
  filters,
  knownBuildings,
  loadedCount,
  totalCount,
  filteredCount,
  onFilterChange,
  onReload,
  isReloading,
  viewMode,
  onViewModeChange,
}: HabitacionesFiltrosBarProps) {
  const isFiltering =
    Boolean(filters.search.trim()) ||
    filters.status !== 'all' ||
    filters.buildingId !== 'all';

  const handleSearchChange = (value: string) => {
    onFilterChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value });
  };

  const handleBuildingChange = (value: string) => {
    onFilterChange({ ...filters, buildingId: value });
  };

  const handleResetFilters = () => {
    onFilterChange({ search: '', status: 'all', buildingId: 'all' });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* 1. Buscador */}
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por número, piso o nombre…"
            className="border-line bg-panel text-ink placeholder:text-ink-muted focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-2.5 pr-4 pl-10 text-xs font-medium shadow-2xs transition outline-none focus:ring-2"
            aria-label="Buscar habitaciones"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-ink-muted pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {filters.search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="text-ink-muted hover:text-ink absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="Limpiar búsqueda"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* 2. Filtros de Estado y Edificio + Recargar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro Estado */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="border-line bg-panel text-ink focus:border-primary focus:ring-primary/20 cursor-pointer appearance-none rounded-xl border py-2 pr-8 pl-3.5 text-xs font-medium shadow-2xs transition outline-none focus:ring-2"
              aria-label="Filtrar por estado"
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="occupied">Ocupada</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="cleaning">Limpieza</option>
              <option value="inactive">Inactiva</option>
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Filtro Edificio */}
          <div className="relative">
            <select
              value={filters.buildingId}
              onChange={(e) => handleBuildingChange(e.target.value)}
              className="border-line bg-panel text-ink focus:border-primary focus:ring-primary/20 cursor-pointer appearance-none rounded-xl border py-2 pr-8 pl-3.5 text-xs font-medium shadow-2xs transition outline-none focus:ring-2"
              aria-label="Filtrar por edificio"
            >
              <option value="all">Todos los edificios</option>
              {knownBuildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-ink-muted pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2"
              aria-hidden="true"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>

          {/* Botón reset filtros si está activo */}
          {isFiltering && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="border-danger/30 bg-danger/10 text-danger hover:bg-danger/15 cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition"
            >
              Limpiar filtros
            </button>
          )}

          {/* Botón sincronizar/refrescar */}
          <button
            type="button"
            onClick={onReload}
            disabled={isReloading}
            title="Refrescar catálogo de habitaciones"
            className="border-line bg-panel text-ink-muted hover:border-primary/40 hover:text-primary inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-2xs transition disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`size-3.5 ${isReloading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 21h5v-5" />
            </svg>
            <span className="hidden sm:inline">Refrescar</span>
          </button>

          {/* Selector de modo de visualización: Tarjetas / Tabla */}
          {viewMode && onViewModeChange && (
            <div className="border-line border-l pl-2.5">
              <HabitacionesViewModeToggle
                viewMode={viewMode}
                onChange={onViewModeChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Indicador de estado de filtrado y conteo incremental */}
      <div className="text-ink-muted flex flex-wrap items-center justify-between px-1 text-xs">
        <div>
          {isFiltering ? (
            <span>
              Mostrando{' '}
              <strong className="text-ink font-semibold">
                {filteredCount}
              </strong>{' '}
              de {loadedCount} habitaciones cargadas ({totalCount} registradas
              en total)
            </span>
          ) : (
            <span>
              Mostrando{' '}
              <strong className="text-ink font-semibold">{loadedCount}</strong>{' '}
              de{' '}
              <strong className="text-ink font-semibold">{totalCount}</strong>{' '}
              habitaciones en total
            </span>
          )}
        </div>
        {isFiltering && (
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            * Los filtros aplican sobre las habitaciones cargadas en pantalla.
          </span>
        )}
      </div>
    </div>
  );
}
