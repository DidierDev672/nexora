import { motion } from 'motion/react'
import {
  SEDE_ESTADO_LABELS,
  type Sede,
  type SedeEstado,
} from '../../domain/sede'
import { cn } from '../lib/cn'

const estadoClasses: Record<SedeEstado, string> = {
  activa: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  mantenimiento: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  inactiva: 'bg-neutral/15 text-ink-muted',
}

const estadoDot: Record<SedeEstado, string> = {
  activa: 'bg-emerald-500',
  mantenimiento: 'bg-amber-500',
  inactiva: 'bg-ink-muted',
}

export interface SedeItemProps {
  sede: Sede
  onDelete?: () => void
  onAddSubSede?: () => void
  onViewSubSedes?: () => void
}

export function SedeItem({ sede, onDelete, onAddSubSede, onViewSubSedes }: SedeItemProps) {
  return (
    <motion.li className="overflow-hidden rounded-xl border border-line bg-panel shadow-xs transition-colors hover:border-primary/25">
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h4 className="truncate font-semibold text-ink">{sede.name}</h4>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{sede.address}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {sede.city}
            </span>
            <span className="inline-flex items-center gap-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5"
                aria-hidden="true"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
              </svg>
              {sede.phone}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 self-start">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
              estadoClasses[sede.estado],
            )}
          >
            <span className={cn('size-1.5 rounded-full', estadoDot[sede.estado])} aria-hidden="true" />
            {SEDE_ESTADO_LABELS[sede.estado]}
          </span>
          {onViewSubSedes ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onViewSubSedes}
              aria-label={`Ver sub sedes de ${sede.name}`}
              title="Ver sub sedes"
              className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </motion.button>
          ) : null}
          {onAddSubSede ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onAddSubSede}
              aria-label={`Agregar sub sede a ${sede.name}`}
              title="Agregar sub sede"
              className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </motion.button>
          ) : null}
          {onDelete ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onDelete}
              aria-label={`Eliminar sede ${sede.name}`}
              title="Eliminar sede"
              className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-danger/30"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </motion.button>
          ) : null}
        </div>
      </div>
    </motion.li>
  )
}