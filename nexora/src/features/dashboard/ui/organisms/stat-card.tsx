import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeIn } from '../../../../design-tokens/motion'
import { cn } from '../lib/cn'
import { TrendBadge } from '../atoms/trend-badge'

export interface StatCardProps {
  icon: ReactNode
  label: string
  value: string
  change: number
  hint?: string
  /** Retraso de entrada en ms, para apilar el fade-in de la cuadrícula. */
  delay?: number
  className?: string
}

export function StatCard({
  icon,
  label,
  value,
  change,
  hint = 'vs. el mes anterior',
  delay = 0,
  className,
}: StatCardProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay: delay / 1000, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 400, damping: 24 } }}
      className={cn(
        'rounded-2xl border border-line bg-panel p-5 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-muted">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-ink">{value}</p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <TrendBadge change={change} />
        <span className="truncate text-xs text-ink-muted">{hint}</span>
      </div>
    </motion.div>
  )
}