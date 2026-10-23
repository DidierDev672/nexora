import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faClock,
  faCircleDot,
  faBan,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import type { ReservaTone } from '../../domain/reserva-list-types'

interface ReservaStateBadgeProps {
  label: string
  tone: ReservaTone
  size?: 'sm' | 'md'
}

const TONE_CLASSES: Record<ReservaTone, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-400',
  blue: 'bg-sky-500/10 text-sky-700 border-sky-500/30 dark:text-sky-400',
  purple: 'bg-purple-500/10 text-purple-700 border-purple-500/30 dark:text-purple-400',
  red: 'bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-400',
  stone: 'bg-stone-500/10 text-stone-700 border-stone-500/30 dark:text-stone-400',
}

function getToneIcon(tone: ReservaTone) {
  switch (tone) {
    case 'emerald':
    case 'purple':
      return faCircleCheck
    case 'amber':
      return faClock
    case 'blue':
      return faCircleDot
    case 'red':
      return faBan
    case 'stone':
    default:
      return faTriangleExclamation
  }
}

export function ReservaStateBadge({ label, tone, size = 'sm' }: ReservaStateBadgeProps) {
  const icon = getToneIcon(tone)
  const toneClass = TONE_CLASSES[tone] || TONE_CLASSES.stone
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs gap-1.5' : 'px-3 py-1 text-xs gap-2'

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${toneClass}`}
    >
      <FontAwesomeIcon icon={icon} className="size-3" />
      <span>{label}</span>
    </span>
  )
}
