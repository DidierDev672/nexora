import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { fadeUp } from '../../../../design-tokens/motion'
import { cn } from '../lib/cn'

export interface LoaderProps {
  label?: string
  size?: number
  fullScreen?: boolean
  overlay?: boolean
  visible?: boolean
  className?: string
  children?: ReactNode
}

export function Loader({
  label,
  size = 24,
  fullScreen = false,
  overlay = false,
  visible = true,
  className,
  children,
}: LoaderProps) {
  const spinner = (
    <>
      <motion.span
        className="inline-block rounded-full border-2 border-primary/20 border-t-primary"
        style={{ width: size, height: size }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        aria-hidden="true"
      />
      {label ? <span className="text-sm font-medium text-ink-muted">{label}</span> : null}
      {children}
    </>
  )

  const block = (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="status"
      aria-live="polite"
      aria-label={label ?? 'Cargando'}
      className={cn(
        'inline-flex flex-col items-center justify-center gap-3',
        fullScreen && 'min-h-[60vh] w-full',
        className,
      )}
    >
      {spinner}
    </motion.div>
  )

  if (overlay) {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            aria-hidden={!visible}
          >
            {block}
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return <AnimatePresence>{visible && block}</AnimatePresence>
}
