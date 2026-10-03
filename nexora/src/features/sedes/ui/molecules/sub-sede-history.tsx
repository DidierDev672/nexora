import { motion } from 'motion/react'
import {
  SUB_SEDE_STATUS_LABELS,
  type SubSede,
  type SubSedeStatus,
} from '../../domain/sede'
import { cn } from '../lib/cn'

const statusClasses: Record<SubSedeStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  inactive: 'bg-neutral/15 text-ink-muted',
}

const statusDot: Record<SubSedeStatus, string> = {
  active: 'bg-emerald-500 ring-4 ring-emerald-500/15',
  inactive: 'bg-ink-muted ring-4 ring-ink-muted/10',
}

const statusPillDot: Record<SubSedeStatus, string> = {
  active: 'bg-emerald-500',
  inactive: 'bg-ink-muted',
}

export interface SubSedeHistoryProps {
  parentName: string
  subSedes: SubSede[]
}

export function SubSedeHistory({ parentName, subSedes }: SubSedeHistoryProps) {
  return (
    <ol className="relative" aria-label={`Sub sedes de ${parentName}`}>
      {subSedes.map((sub, index) => (
        <motion.li
          key={sub.id ?? `${parentName}-${sub.name}-${index}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05 }}
          className="relative flex gap-4 pb-5 last:pb-0"
        >
          {index < subSedes.length - 1 ? (
            <span
              aria-hidden="true"
              className="absolute left-[11px] top-8 h-full w-px bg-line"
            />
          ) : null}
          <span
            className={cn(
              'z-10 mt-1.5 size-[23px] shrink-0 rounded-full',
              statusDot[sub.status],
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 rounded-xl border border-primary/10 bg-primary/5 px-4 py-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="min-w-0 truncate font-semibold text-ink">{sub.name}</h4>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                  statusClasses[sub.status],
                )}
              >
                <span
                  className={cn('size-1.5 rounded-full', statusPillDot[sub.status])}
                  aria-hidden="true"
                />
                {SUB_SEDE_STATUS_LABELS[sub.status]}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">{sub.address}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-muted">
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
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              {sub.phone}
            </p>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}