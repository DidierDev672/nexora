import { useEffect, useState, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { cn } from '../lib/cn'

export interface FadeInProps {
  children: ReactNode
  /** Duración del fade-in en milisegundos. */
  duration?: number
  /** Retraso opcional en milisegundos antes de que comience el fade-in. */
  delay?: number
  className?: string
}

export function FadeIn({ children, duration = 300, delay = 0, className }: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const durationSeconds = prefersReducedMotion ? 0 : Math.max(0, duration) / 1000
  const delaySeconds = prefersReducedMotion ? 0 : Math.max(0, delay) / 1000

  return (
    <motion.div
      data-fade-in
      className={cn(className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: durationSeconds, delay: delaySeconds, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}