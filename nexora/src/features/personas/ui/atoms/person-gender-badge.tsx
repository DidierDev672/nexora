import { formatGender } from '../../domain/persona-list'

export interface PersonGenderBadgeProps {
  gender?: string
  className?: string
}

export function PersonGenderBadge({ gender, className = '' }: PersonGenderBadgeProps) {
  const { label, short, tone } = formatGender(gender)

  let badgeClasses = 'bg-stone-500/10 text-stone-700 border-stone-500/20'

  if (tone === 'blue') {
    badgeClasses = 'bg-blue-500/10 text-blue-800 border-blue-500/25 dark:text-blue-300 dark:border-blue-600/30'
  } else if (tone === 'rose') {
    badgeClasses = 'bg-rose-500/10 text-rose-800 border-rose-500/25 dark:text-rose-300 dark:border-rose-600/30'
  } else if (tone === 'amber') {
    badgeClasses = 'bg-amber-500/10 text-amber-800 border-amber-500/25 dark:text-amber-300 dark:border-amber-600/30'
  }

  return (
    <span
      title={`Género: ${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeClasses} ${className}`}
    >
      {/* Icono de género */}
      {tone === 'blue' ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-3"
          aria-hidden="true"
        >
          <circle cx="10" cy="14" r="5" />
          <path d="M19 5l-5.4 5.4" />
          <path d="M19 5h-5" />
          <path d="M19 5v5" />
        </svg>
      ) : tone === 'rose' ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-3"
          aria-hidden="true"
        >
          <circle cx="12" cy="9" r="5" />
          <path d="M12 14v7" />
          <path d="M9 18h6" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-3"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
      )}
      <span>{label}</span>
      <span className="opacity-60 text-[10px]">({short})</span>
    </span>
  )
}
