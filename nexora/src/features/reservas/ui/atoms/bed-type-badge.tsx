export interface BedTypeBadgeProps {
  typeName: string
  className?: string
  size?: 'sm' | 'md'
}

export function BedTypeBadge({ typeName, className = '', size = 'md' }: BedTypeBadgeProps) {
  const normalized = typeName.toLowerCase()

  let variantStyle = 'bg-primary/10 text-primary border-primary/20'
  let icon = '🛏️'

  if (normalized.includes('king') || normalized.includes('presidencial')) {
    variantStyle = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25'
    icon = '👑'
  } else if (normalized.includes('queen') || normalized.includes('matrimonial')) {
    variantStyle = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25'
    icon = '✨'
  } else if (normalized.includes('sofa') || normalized.includes('sofá')) {
    variantStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
    icon = '🛋️'
  } else if (normalized.includes('twin') || normalized.includes('indiv')) {
    variantStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
    icon = '🌿'
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-wide select-none ${padding} ${variantStyle} ${className}`}
    >
      <span aria-hidden="true" className="text-xs">
        {icon}
      </span>
      <span>{typeName}</span>
    </span>
  )
}
