import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'

export interface NightBadgeProps {
  nights: number
  className?: string
}

export function NightBadge({ nights, className = '' }: NightBadgeProps) {
  if (nights <= 0) return null

  const label = nights === 1 ? '1 noche' : `${nights} noches`

  return (
    <motion.span
      key={nights}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={`inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary shadow-2xs select-none ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3 text-primary"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
      <span>{label}</span>
    </motion.span>
  )
}
