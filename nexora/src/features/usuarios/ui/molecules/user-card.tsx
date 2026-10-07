import { motion, type Variants } from 'motion/react'
import { staggerItem } from '../../../../design-tokens/motion'
import {
  useCatalogHeadquarter,
  useCatalogSubHeadquarter,
  useCatalogRole,
} from '../../../../shared/catalog'
import {
  formatFriendlyHeadquarterName,
  formatFriendlyRoleName,
  formatFriendlySubHeadquarterName,
  type UserItem,
} from '../../domain/user-list'
import { UserStatusBadge } from '../atoms/user-status-badge'

export interface UserCardProps {
  user: UserItem
  variants?: Variants
  onSelect?: (user: UserItem) => void
  onInspectHeadquarter?: (headquartersId: string, subHeadquartersId?: string | null) => void
  onInspectRole?: (roleId: string) => void
}

/**
 * Obtiene las iniciales del nombre de usuario para el Avatar MUI-style.
 */
function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Tarjeta interactiva de usuario inspirada en Material UI Card con elevación y tokens Nexora.
 *
 * Muestra de forma destacada:
 * - name (Nombre completo limpio, sin IDs técnicos)
 * - email (Correo electrónico con enlace directo)
 * - role_id (Nombre real del rol consumido de /roles/{id}, interactivo: clic abre modal)
 * - headquarters_id (Sede física real vía Shared Catalog, interactivo: clic abre modal)
 * - sub_headquarters_id (Subsede física real vía Shared Catalog o "Sin subsede asignada")
 * - status (Badge semántico con punto de actividad)
 */
export function UserCard({
  user,
  variants,
  onSelect,
  onInspectHeadquarter,
  onInspectRole,
}: UserCardProps) {
  const { data: roleData, loading: roleLoading } = useCatalogRole(user.role_id)
  const { data: hqData } = useCatalogHeadquarter(user.headquarters_id)
  const { data: subHqData } = useCatalogSubHeadquarter(user.sub_headquarters_id)

  const roleDisplayName = roleData?.name || formatFriendlyRoleName(user.role_id)
  const headquarterName = hqData?.name || formatFriendlyHeadquarterName(user.headquarters_id)
  const subHeadquarterName = subHqData?.name || formatFriendlySubHeadquarterName(user.sub_headquarters_id)
  const initials = getInitials(user.name)

  return (
    <motion.article
      layout
      variants={variants ?? staggerItem}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      onClick={() => onSelect?.(user)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 text-ink shadow-xs transition-all hover:shadow-md hover:border-primary/40"
    >
      {/* Indicador de acento en el borde superior */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />

      <div>
        {/* Cabecera: Avatar MUI + Nombre + Estado (alineados verticalmente) */}
        <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar MUI-inspired */}
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/25 text-primary font-bold text-sm shrink-0 shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
              {initials}
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-ink group-hover:text-primary transition-colors">
                {user.name}
              </h3>
            </div>
          </div>

          {/* Badge de Estado */}
          <UserStatusBadge status={user.status} />
        </div>

        {/* Sección Central de Metadatos */}
        <div className="mt-4 space-y-2.5 text-xs">
          {/* Correo Electrónico */}
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="grid size-6 place-items-center rounded-lg bg-canvas text-primary/80 border border-line/60 shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <a
              href={`mailto:${user.email}`}
              onClick={(e) => e.stopPropagation()}
              className="truncate text-ink font-medium hover:text-primary hover:underline transition-colors"
              title={`Enviar correo a ${user.email}`}
            >
              {user.email}
            </a>
          </div>

          {/* Rol asignado (Interactivo: clic abre el modal de detalle del rol) */}
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="grid size-6 place-items-center rounded-lg bg-canvas text-primary/80 border border-line/60 shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </span>
            <div className="min-w-0">
              <span className="text-[11px] text-ink-muted block">Rol:</span>
              {roleLoading && !roleData ? (
                <span className="text-[11px] text-ink-muted animate-pulse">Cargando rol…</span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectRole?.(user.role_id)
                  }}
                  title={`Consultar información del rol ${roleDisplayName}`}
                  className="group/role inline-flex items-center gap-1.5 font-bold text-ink hover:text-primary transition-colors cursor-pointer text-left truncate max-w-full capitalize"
                >
                  <span className="truncate group-hover/role:underline">{roleDisplayName}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3 text-ink-muted group-hover/role:text-primary opacity-60 group-hover/role:opacity-100 transition-all shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Sede Asignada (Interactivo: clic abre el modal de sede y subsedes) */}
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="grid size-6 place-items-center rounded-lg bg-canvas text-primary/80 border border-line/60 shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
                <path d="M14 9h1" />
                <path d="M14 13h1" />
                <path d="M14 17h1" />
              </svg>
            </span>
            <div className="min-w-0">
              <span className="text-[11px] text-ink-muted block">Sede:</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onInspectHeadquarter?.(user.headquarters_id, user.sub_headquarters_id)
                }}
                title={`Consultar información de la sede ${headquarterName}`}
                className="group/hq inline-flex items-center gap-1.5 font-bold text-ink hover:text-primary transition-colors cursor-pointer text-left truncate max-w-full"
              >
                <span className="truncate group-hover/hq:underline">{headquarterName}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3 text-ink-muted group-hover/hq:text-primary opacity-60 group-hover/hq:opacity-100 transition-all shrink-0"
                  aria-hidden="true"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Subsede Asignada */}
          <div className="flex items-center gap-2 text-ink-muted">
            <span className="grid size-6 place-items-center rounded-lg bg-canvas text-primary/80 border border-line/60 shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <div className="min-w-0">
              <span className="text-[11px] text-ink-muted block">Subsede:</span>
              {user.sub_headquarters_id ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onInspectHeadquarter?.(user.headquarters_id, user.sub_headquarters_id)
                  }}
                  title={`Consultar información de la subsede ${subHeadquarterName}`}
                  className="group/sub inline-flex items-center gap-1 font-semibold text-ink hover:text-primary transition-colors cursor-pointer text-left truncate max-w-full"
                >
                  <span className="truncate group-hover/sub:underline">{subHeadquarterName}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3 text-ink-muted group-hover/sub:text-primary opacity-60 shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </button>
              ) : (
                <span className="text-ink-muted italic block truncate">
                  Sin subsede asignada
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pie de Tarjeta con fecha de registro */}
      <div className="mt-4 pt-3 border-t border-line/50 flex items-center justify-between text-[11px] text-ink-muted">
        <span className="flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3 text-ink-muted/80">
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
          Registrado el {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recientemente'}
        </span>
      </div>
    </motion.article>
  )
}
