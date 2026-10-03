import { motion } from 'motion/react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  message?: string
  action?: ReactNode
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-primary/25 bg-white/50 px-6 py-14 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-secondary">
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
          <circle cx="9" cy="8" r="3.25" />
          <path d="M3.5 19c.6-3.1 2.9-4.5 5.5-4.5s4.9 1.4 5.5 4.5" />
          <circle cx="17" cy="9.5" r="2.25" />
          <path d="M16 14.6c2.6.2 4.3 1.5 4.9 3.9" />
        </svg>
      </span>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-primary">{title}</h3>
        {message && <p className="text-sm text-neutral">{message}</p>}
      </div>
      {action}
    </motion.div>
  )
}