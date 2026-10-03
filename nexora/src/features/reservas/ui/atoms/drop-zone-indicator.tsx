import { motion } from 'motion/react'

export interface DropZoneIndicatorProps {
  isOver?: boolean
  className?: string
}

export function DropZoneIndicator({ isOver = false, className = '' }: DropZoneIndicatorProps) {
  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      {/* Icono de cama con flecha animada hacia abajo */}
      <motion.div
        animate={isOver ? { scale: [1, 1.15, 1], y: [0, 4, 0] } : { y: [0, -4, 0] }}
        transition={{
          repeat: Infinity,
          duration: isOver ? 0.8 : 2,
          ease: 'easeInOut',
        }}
        className={`grid size-14 place-items-center rounded-2xl border transition-colors ${
          isOver
            ? 'border-primary bg-primary/20 text-primary shadow-md shadow-primary/20'
            : 'border-line bg-panel text-ink-muted shadow-xs'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-7"
          aria-hidden="true"
        >
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <path d="M6 8v9" />
        </svg>
      </motion.div>

      {/* Flecha indicadora pulsante */}
      <motion.div
        animate={{ y: [0, 5, 0], opacity: [0.6, 1, 0.6] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        className="mt-2 text-primary"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
          aria-hidden="true"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </motion.div>
    </div>
  )
}
