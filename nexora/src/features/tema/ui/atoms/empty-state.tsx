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
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2Z" />
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