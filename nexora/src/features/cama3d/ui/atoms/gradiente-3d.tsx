import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp } from '../../../../design-tokens/motion'
import { cn } from '../lib/cn'

export interface Gradiente3dProps {
  message: string
  className?: string
  children?: ReactNode
}

export function Gradiente3d({ message, className, children }: Gradiente3dProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      role="status"
      className={cn(
        'relative flex min-h-52 w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl bg-linear-to-br from-[#EC6426] via-[#FBA91F] to-[#632713] px-6 py-10 text-center',
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-tl from-[#FDE3CF]/25 to-transparent" />
      <span className="relative grid size-12 place-items-center rounded-full bg-black/10 text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-6"
          aria-hidden="true"
        >
          <path d="M2 20h20" />
          <path d="M5 20V9l7-4 7 4v11" />
          <path d="M9 20v-5h6v5" />
        </svg>
      </span>
      <p className="relative max-w-md text-sm font-medium leading-relaxed text-white/95 drop-shadow-sm">
        {message}
      </p>
      {children ? <div className="relative">{children}</div> : null}
    </motion.div>
  )
}