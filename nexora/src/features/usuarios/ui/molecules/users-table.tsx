import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '../../../../design-tokens/motion'
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
import { UserCard } from './user-card'

export interface UsersTableProps {
  users: UserItem[]
  onSelectUser?: (user: UserItem) => void
  onInspectHeadquarter?: (headquartersId: string, subHeadquartersId?: string | null) => void
  onInspectRole?: (roleId: string) => void
}

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

interface UserTableRowProps {
  user: UserItem
  onSelectUser?: (user: UserItem) => void
  onInspectHeadquarter?: (headquartersId: string, subHeadquartersId?: string | null) => void
  onInspectRole?: (roleId: string) => void
}

/**
 * Fila individual de usuario que consume reactivamente el Catálogo Maestro
 * para mostrar datos reales de sedes, subsedes y roles con deduplicación y caché.
 */
function UserTableRow({
  user,
  onSelectUser,
  onInspectHeadquarter,
  onInspectRole,
}: UserTableRowProps) {
  const { data: roleData, loading: roleLoading } = useCatalogRole(user.role_id)
  const { data: hqData } = useCatalogHeadquarter(user.headquarters_id)
  const { data: subHqData } = useCatalogSubHeadquarter(user.sub_headquarters_id)

  const roleDisplayName = roleData?.name || formatFriendlyRoleName(user.role_id)
  const headquarterName = hqData?.name || formatFriendlyHeadquarterName(user.headquarters_id)
  const subHeadquarterName = subHqData?.name || formatFriendlySubHeadquarterName(user.sub_headquarters_id)
  const initials = getInitials(user.name)

  return (
    <motion.tr
      layout
      variants={staggerItem}
      whileHover={{ backgroundColor: 'rgba(var(--color-primary-rgb, 90, 49, 31), 0.03)' }}
      onClick={() => onSelectUser?.(user)}
      className="transition-colors hover:bg-primary/5 cursor-pointer"
    >
      {/* 1. Nombre con Avatar */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs shrink-0 shadow-2xs">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-ink block text-xs truncate">
              {user.name}
            </span>
            <span className="text-[11px] text-ink-muted truncate block">
              Alta: {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Reciente'}
            </span>
          </div>
        </div>
      </td>

      {/* 2. Correo electrónico */}
      <td className="px-4 py-4 whitespace-nowrap">
        <a
          href={`mailto:${user.email}`}
          onClick={(e) => e.stopPropagation()}
          className="text-ink font-medium hover:text-primary hover:underline transition-colors flex items-center gap-1.5"
          title={`Enviar correo a ${user.email}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-3.5 text-primary shrink-0"
            aria-hidden="true"
          >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <span>{user.email}</span>
        </a>
      </td>

      {/* 3. Rol asignado (Interactivo: clic abre modal de rol) */}
      <td className="px-4 py-4 whitespace-nowrap">
        {roleLoading && !roleData ? (
          <span className="text-xs text-ink-muted animate-pulse">Cargando…</span>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onInspectRole?.(user.role_id)
            }}
            title={`Consultar información del rol ${roleDisplayName}`}
            className="group/role inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/80 px-2.5 py-1 text-xs font-semibold text-primary hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer shadow-2xs capitalize"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3 text-primary shrink-0"
              aria-hidden="true"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="group-hover/role:underline">{roleDisplayName}</span>
          </button>
        )}
      </td>

      {/* 4. Sede (Interactivo: abre modal de sede y subsedes) */}
      <td className="px-4 py-4 whitespace-nowrap">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onInspectHeadquarter?.(user.headquarters_id, user.sub_headquarters_id)
          }}
          title={`Ver información de ${headquarterName}`}
          className="group/hq inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas/80 px-2.5 py-1 text-xs font-bold text-ink hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shadow-2xs"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-3 text-secondary shrink-0"
            aria-hidden="true"
          >
            <path d="M3 21h18" />
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
          </svg>
          <span>{headquarterName}</span>
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
      </td>

      {/* 5. Subsede (Interactivo si existe) */}
      <td className="px-4 py-4 whitespace-nowrap">
        {user.sub_headquarters_id ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onInspectHeadquarter?.(user.headquarters_id, user.sub_headquarters_id)
            }}
            title={`Ver información de ${subHeadquarterName}`}
            className="group/sub inline-flex items-center gap-1.5 rounded-lg border border-line/60 bg-canvas/60 px-2 py-0.5 text-xs font-medium text-ink hover:border-primary/40 hover:text-primary transition-all cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3 text-primary/70 shrink-0"
              aria-hidden="true"
            >
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{subHeadquarterName}</span>
          </button>
        ) : (
          <span className="text-ink-muted italic text-xs">
            Sin subsede asignada
          </span>
        )}
      </td>

      {/* 6. Estado */}
      <td className="px-5 py-4 whitespace-nowrap text-center">
        <UserStatusBadge status={user.status} />
      </td>
    </motion.tr>
  )
}

/**
 * Tabla interactiva y adaptativa para la lista de usuarios.
 *
 * Características:
 * 1. Visualiza los 6 campos requeridos: name, email, role_id, headquarters_id, sub_headquarters_id, status.
 * 2. Consume el Catálogo Compartido para sedes y subsedes reales con caché y deduplicación.
 * 3. Al hacer clic en la sede, abre el modal detallado de sede y subsedes.
 * 4. Regla de oro: cero IDs técnicos en la interfaz de usuario.
 * 5. Adaptabilidad responsiva: en pantallas pequeñas (< md) se transforma automáticamente en Cards.
 */
export function UsersTable({
  users,
  onSelectUser,
  onInspectHeadquarter,
  onInspectRole,
}: UsersTableProps) {
  return (
    <>
      {/* 1. Vista en Tarjetas / Cards para pantallas pequeñas (< md) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden"
      >
        {users.map((user) => (
          <UserCard
            key={`mobile-user-card-${user.id}`}
            user={user}
            variants={staggerItem}
            onSelect={onSelectUser}
            onInspectHeadquarter={onInspectHeadquarter}
            onInspectRole={onInspectRole}
          />
        ))}
      </motion.div>

      {/* 2. Vista en Tabla completa para pantallas medianas y grandes (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-panel shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink border-collapse">
            <thead className="border-b border-line bg-canvas/70 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Usuario / Nombre
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Correo electrónico
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Rol asignado
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Sede
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Subsede
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Estado
                </th>
              </tr>
            </thead>

            <motion.tbody
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.05 }}
              className="divide-y divide-line/60"
            >
              {users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  onSelectUser={onSelectUser}
                  onInspectHeadquarter={onInspectHeadquarter}
                  onInspectRole={onInspectRole}
                />
              ))}
            </motion.tbody>
          </table>
        </div>
      </div>
    </>
  )
}
