import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'
import { Button } from '../../../recursos/ui/atoms/button'

export interface RecepcionHeaderProps {
  onNewCheckIn?: () => void
  title?: string
  subtitle?: string
  badgeText?: string
}

export function RecepcionHeader({
  onNewCheckIn,
  title = 'Recepción y bienvenida de huéspedes',
  subtitle = 'Supervisa las estadías activas en toda tu red y realiza nuevos check-ins con asignación precisa de sede, edificio, habitación y cama.',
  badgeText = 'Recepción · Gestión integral de huéspedes',
}: RecepcionHeaderProps) {
  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-sm sm:px-10 sm:py-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
      />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {badgeText}
          </p>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        </div>

        {onNewCheckIn && (
          <div className="shrink-0">
            <Button
              type="button"
              variant="primary"
              onClick={onNewCheckIn}
              className="group flex items-center gap-2 px-5 py-2.5 text-sm font-semibold shadow-md transition-all hover:scale-[1.02]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                className="size-4 transition-transform group-hover:rotate-90"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Nuevo recepcion</span>
            </Button>
          </div>
        )}
      </div>
    </motion.header>
  )
}
