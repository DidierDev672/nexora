import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { formatPrecioCOP } from '../../domain/recepcion'
import type { RecepcionMetricsData } from '../../application/use-recepciones-list'

export interface RecepcionMetricsProps {
  metrics: RecepcionMetricsData
  loading?: boolean
}

export function RecepcionMetrics({ metrics, loading = false }: RecepcionMetricsProps) {
  const cards = [
    {
      id: 'huespedes',
      label: 'Huéspedes hospedados hoy',
      value: loading ? '—' : `${metrics.huespedesHoy}`,
      badge: 'Estadías activas',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      accent: 'border-primary/20 bg-primary/5 text-primary',
    },
    {
      id: 'habitaciones',
      label: 'Habitaciones en uso',
      value: loading ? '—' : `${metrics.habitacionesEnUso}`,
      badge: 'En ocupación',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9h1" />
          <path d="M9 13h1" />
          <path d="M9 17h1" />
        </svg>
      ),
      accent: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'camas',
      label: 'Camas ocupadas',
      value: loading ? '—' : `${metrics.camasOcupadas}`,
      badge: 'Capacidad asignada',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
          <path d="M2 4v16" />
          <path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" />
          <path d="M6 8v9" />
        </svg>
      ),
      accent: 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
    },
    {
      id: 'depositos',
      label: 'Depósitos en custodia',
      value: loading ? '—' : formatPrecioCOP(metrics.depositosActivos),
      badge: 'Garantía segura',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
      accent: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    },
  ]

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Resumen rápido de recepciones"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="relative overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-sm transition-all hover:border-line/80 hover:shadow-md"
        >
          <div className="flex items-center justify-between gap-3">
            <span className={`grid size-10 place-items-center rounded-xl border ${card.accent}`}>
              {card.icon}
            </span>
            <span className="rounded-full bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
              {card.badge}
            </span>
          </div>

          <div className="mt-4 space-y-1">
            <p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {card.value}
            </p>
            <p className="text-xs font-medium text-ink-muted leading-tight">
              {card.label}
            </p>
          </div>
        </div>
      ))}
    </motion.section>
  )
}
