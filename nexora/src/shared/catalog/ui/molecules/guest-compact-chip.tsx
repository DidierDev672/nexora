import { useCatalogPerson } from '../../application/use-catalog'
import type { PersonCatalogItem } from '../../domain/catalog-types'

export interface GuestCompactChipProps {
  personId?: string | null
  initialData?: PersonCatalogItem | null
  onClick?: (person: PersonCatalogItem) => void
  className?: string
}

/**
 * Molécula compacta para representar a un Huésped (GET /person/{id}).
 * Muestra avatar de iniciales y nombre oficial, ocultando IDs técnicos.
 */
export function GuestCompactChip({
  personId,
  initialData,
  onClick,
  className = '',
}: GuestCompactChipProps) {
  const query = useCatalogPerson(initialData ? null : personId)
  const person = initialData ?? query.data
  const loading = !initialData && query.loading

  if (loading) {
    return <span className="inline-block h-6 w-24 bg-line/50 rounded-lg animate-pulse" />
  }

  if (!person) {
    return (
      <span className="text-xs italic text-ink-muted">Huésped no registrado</span>
    )
  }

  const initial = person.name ? person.name.charAt(0).toUpperCase() : 'H'

  const content = (
    <span
      className={`inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/80 px-2.5 py-1 text-xs font-medium text-ink transition-all shadow-2xs ${
        onClick ? 'hover:border-primary/50 hover:bg-primary/5 cursor-pointer' : ''
      } ${className}`}
    >
      <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0">
        {initial}
      </span>
      <span className="max-w-[150px] truncate font-semibold">{person.name}</span>
    </span>
  )

  if (onClick) {
    return (
      <button
        type="button"
        onClick={() => onClick(person)}
        title={`Ver ficha completa de ${person.name}`}
      >
        {content}
      </button>
    )
  }

  return content
}
