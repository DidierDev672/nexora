import { PersonasViewSwitch } from '../atoms/personas-view-switch'
import type { PersonViewMode } from '../../domain/persona-list'

export interface PersonasToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  roleFilter: string
  onRoleFilterChange: (role: string) => void
  genderFilter: string
  onGenderFilterChange: (gender: string) => void
  viewMode: PersonViewMode
  onViewModeChange: (mode: PersonViewMode) => void
  totalCount: number
  filteredCount: number
  onResetFilters: () => void
}

export function PersonasToolbar({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  genderFilter,
  onGenderFilterChange,
  viewMode,
  onViewModeChange,
  totalCount,
  filteredCount,
  onResetFilters,
}: PersonasToolbarProps) {
  const hasActiveFilters = searchQuery !== '' || roleFilter !== 'todos' || genderFilter !== 'todos'

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-panel p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Barra de búsqueda interactiva */}
        <div className="relative flex-1 min-w-[260px]">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-muted">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M13.5 13.5L17 17" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre, documento, correo o teléfono..."
            className="w-full rounded-xl border border-line bg-canvas py-2 pl-10 pr-9 text-xs sm:text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-ink-muted hover:text-ink cursor-pointer"
              title="Limpiar búsqueda"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Grupo de Filtros y Switch de Modo de Vista */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-2.5">
          {/* Selector de Rol */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="rounded-xl border border-line bg-canvas py-2 pl-3 pr-8 text-xs font-semibold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
              aria-label="Filtrar por rol"
            >
              <option value="todos">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="recepcion">Recepción</option>
              <option value="operaciones">Operaciones</option>
              <option value="huesped">Huésped</option>
              <option value="mantenimiento">Mantenimiento</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-muted">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          {/* Selector de Género */}
          <div className="relative">
            <select
              value={genderFilter}
              onChange={(e) => onGenderFilterChange(e.target.value)}
              className="rounded-xl border border-line bg-canvas py-2 pl-3 pr-8 text-xs font-semibold text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
              aria-label="Filtrar por género"
            >
              <option value="todos">Todos los géneros</option>
              <option value="M">Masculino (M)</option>
              <option value="F">Femenino (F)</option>
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-ink-muted">
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          </div>

          {/* Switch de Modo de Vista (Tarjetas / Tabla) */}
          <PersonasViewSwitch viewMode={viewMode} onChange={onViewModeChange} />
        </div>
      </div>

      {/* Resumen de resultados y botón de reset */}
      <div className="flex items-center justify-between text-xs text-ink-muted border-t border-line/60 pt-2.5">
        <span>
          Mostrando <strong className="text-ink">{filteredCount}</strong> de {totalCount} personas registradas
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}
