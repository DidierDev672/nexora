import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeIn } from '../../../../design-tokens/motion'

export interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-panel px-6 py-14 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
          aria-hidden="true"
        >
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 21v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4" />
          <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
        </svg>
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {message && <p className="text-sm text-ink-muted">{message}</p>}
      </div>
      {action}
    </motion.div>
  )
}