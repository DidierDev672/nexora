import { cn } from '../lib/cn'
import { TrendingDownIcon, TrendingUpIcon } from '../icons'

export function TrendBadge({
  change,
  className,
}: {
  change: number
  className?: string
}) {
  const up = change >= 0
  const decimals = Number.isInteger(change) ? 0 : 1
  const text = `${Math.abs(change).toFixed(decimals)}%`

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
        up
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
          : 'bg-danger/10 text-danger dark:text-red-300',
        className,
      )}
    >
      {up ? <TrendingUpIcon className="size-3" /> : <TrendingDownIcon className="size-3" />}
      {text}
    </span>
  )
}