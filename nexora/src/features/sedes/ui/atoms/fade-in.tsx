import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

export interface FadeInProps {
  duration?: number
  delay?: number
  className?: string
  children: ReactNode
}

export function FadeIn({ duration = 500, delay = 0, className, children }: FadeInProps) {
  const toSeconds = (ms: number) => ms / 1000

  const fade: Variants = {
    hidden: {
      opacity: 0,
      y: 10,
      transition: { type: 'tween', duration: toSeconds(duration), delay: toSeconds(delay), ease: 'easeOut' },
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'tween', duration: toSeconds(duration), delay: toSeconds(delay), ease: 'easeOut' },
    },
    leaving: { opacity: 0, transition: { type: 'tween', duration: 0.18 } },
  }

  return (
    <motion.div layout variants={fade} initial="hidden" animate="visible" exit="leaving" className={className}>
      {children}
    </motion.div>
  )
}