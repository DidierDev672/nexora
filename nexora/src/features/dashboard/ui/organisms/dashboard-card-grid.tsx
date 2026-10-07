import { motion } from 'motion/react'
import { staggerContainer } from '../../../../design-tokens/motion'
import { DASHBOARD_CARDS } from '../../domain/dashboard-card'
import type { NavId } from '../navigation'
import { DashboardNavCard } from '../molecules/dashboard-nav-card'

export interface DashboardCardGridProps {
  onNavigate: (id: NavId) => void
  className?: string
}

export function DashboardCardGrid({ onNavigate, className = '' }: DashboardCardGridProps) {
  return (
    <section
      aria-label="Panel principal de módulos y accesos del hotel"
      className={className}
    >
      <div className="mb-5 flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Módulos del hotel
          </h2>
          <p className="mt-1 text-xs text-ink-muted sm:text-sm">
            Explora y gestiona cada área de tu red hotelera con un solo clic.
          </p>
        </div>
        <div className="mt-2 sm:mt-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1 text-xs font-medium text-ink-muted shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            10 módulos interactivos
          </span>
        </div>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 sm:gap-5 lg:gap-6"
      >
        {DASHBOARD_CARDS.map((card) => (
          <DashboardNavCard
            key={card.id}
            card={card}
            onNavigate={onNavigate}
          />
        ))}
      </motion.div>
    </section>
  )
}
