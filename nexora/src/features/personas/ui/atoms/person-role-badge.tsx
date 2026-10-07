import { usePersonaRole } from '../../application/use-persona-role'
import { formatRoleName } from '../../domain/persona-list'

export interface PersonRoleBadgeProps {
  role?: string
  roleId?: string
  className?: string
  onClick?: (roleId: string) => void
}

/**
 * Badge representativo del Rol de una persona.
 *
 * Cumple con el requerimiento de consumir el endpoint "/roles/{id}",
 * validando los status codes mediante status-code-validator.ts.
 * Cuando el status code es 200, consume exclusivamente el item `name`
 * del objeto resultante y permite abrir el modal con el detalle al hacer clic.
 */
export function PersonRoleBadge({
  role,
  roleId,
  className = '',
  onClick,
}: PersonRoleBadgeProps) {
  const targetId = (roleId ?? role ?? '').trim()
  const { name: fetchedName, loading } = usePersonaRole(targetId)

  // Requisito estricto: solo vamos a utilizar el item `name` entregado por la API
  const roleName = fetchedName || (targetId ? formatRoleName(targetId) : 'Sin rol')

  const normalized = roleName.toLowerCase().trim()
  let colorStyles =
    'bg-stone-500/10 text-stone-700 border-stone-500/20 dark:text-stone-300 dark:border-stone-700'

  if (normalized.includes('admin')) {
    colorStyles =
      'bg-amber-500/10 text-amber-800 border-amber-500/30 dark:text-amber-300 dark:border-amber-600/40'
  } else if (normalized.includes('recepcion') || normalized.includes('recepcionista')) {
    colorStyles =
      'bg-sky-500/10 text-sky-800 border-sky-500/30 dark:text-sky-300 dark:border-sky-600/40'
  } else if (normalized.includes('operaciones')) {
    colorStyles =
      'bg-indigo-500/10 text-indigo-800 border-indigo-500/30 dark:text-indigo-300 dark:border-indigo-600/40'
  } else if (normalized.includes('huesped')) {
    colorStyles =
      'bg-emerald-500/10 text-emerald-800 border-emerald-500/30 dark:text-emerald-300 dark:border-emerald-600/40'
  } else if (normalized.includes('mantenimiento')) {
    colorStyles =
      'bg-orange-500/10 text-orange-800 border-orange-500/30 dark:text-orange-300 dark:border-orange-600/40'
  }

  const isInteractive = Boolean(onClick && targetId)

  const badgeContent = (
    <>
      <span className="size-1.5 rounded-full bg-current opacity-70 shrink-0" />
      <span className="capitalize">{loading && !fetchedName ? 'Cargando…' : roleName}</span>
      {isInteractive && (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="size-2.5 opacity-50 group-hover/role:opacity-100 group-hover/role:translate-x-0.5 transition-all shrink-0"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      )}
    </>
  )

  if (isInteractive) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClick?.(targetId)
        }}
        title={`Consultar información del rol: ${roleName}`}
        className={`group/role inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide transition-all cursor-pointer shadow-2xs hover:shadow-xs hover:scale-105 active:scale-95 ${colorStyles} ${className}`}
      >
        {badgeContent}
      </button>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide transition-colors ${colorStyles} ${className}`}
    >
      {badgeContent}
    </span>
  )
}
