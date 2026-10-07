import type { UsersViewMode } from '../../domain/user-list'
import { formatFriendlyRoleName } from '../../domain/user-list'
import { UsersViewSwitch } from '../atoms/users-view-switch'

export interface UsersToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
  roleFilter: string
  onRoleChange: (role: string) => void
  availableRoles: string[]
  viewMode: UsersViewMode
  onViewModeChange: (mode: UsersViewMode) => void
  loading?: boolean
  onReload: () => void
  onNewUser?: () => void
}

/**
 * Barra de herramientas interactiva para filtrado, búsqueda y alternancia de vistas (Card / Table).
 */
export function UsersToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  roleFilter,
  onRoleChange,
  availableRoles,
  viewMode,
  onViewModeChange,
  loading = false,
  onReload,
  onNewUser,
}: UsersToolbarProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* 1. Buscador en tiempo real por nombre o correo */}
      <div className="relative flex-1 max-w-md">
        <span className="pointer-events-none absolute inset-y-0 left-3 grid place-items-center text-ink-muted">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar usuario por nombre o correo…"
          aria-label="Buscar usuario"
          className="w-full rounded-xl border border-line bg-canvas pl-9 pr-9 py-2 text-xs text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            title="Limpiar búsqueda"
            className="absolute inset-y-0 right-2.5 my-auto size-5 grid place-items-center rounded-full text-ink-muted hover:bg-line/40 hover:text-ink cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* 2. Controles de filtrado y alternancia de vista */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Filtro de Estado */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filtrar por estado del usuario"
          className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
        >
          <option value="todos">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>

        {/* Filtro de Rol */}
        {availableRoles.length > 0 && (
          <select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            aria-label="Filtrar por rol de usuario"
            className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer shadow-2xs"
          >
            <option value="todos">Todos los roles</option>
            {availableRoles.map((roleId) => (
              <option key={roleId} value={roleId}>
                {formatFriendlyRoleName(roleId)}
              </option>
            ))}
          </select>
        )}

        {/* Control Switch: Cards vs. Table (Requisito clave) */}
        <UsersViewSwitch viewMode={viewMode} onChange={onViewModeChange} />

        {/* Botón de Recarga */}
        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          title="Actualizar listado de usuarios desde /users"
          className="grid size-8 place-items-center rounded-xl border border-line bg-canvas text-ink-muted hover:bg-panel hover:text-primary transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`size-3.5 ${loading ? 'animate-spin text-primary' : ''}`}
          >
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>

        {/* Botón Nuevo Usuario */}
        {onNewUser && (
          <button
            type="button"
            onClick={onNewUser}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Nuevo usuario</span>
          </button>
        )}
      </div>
    </div>
  )
}
