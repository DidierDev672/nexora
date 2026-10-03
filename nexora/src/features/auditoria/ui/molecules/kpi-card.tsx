import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { KpiProgressRing } from '../atoms/kpi-progress-ring'
import { SeverityPill } from '../atoms/severity-pill'

export type KpiCardVariant =
  | {
      type: 'continuous'
      value: number
      target: number
    }
  | {
      type: 'discrete'
      count: number
      target: number
      severity: 'baja' | 'media' | 'alta'
    }

export interface KpiCardProps {
  idBadge: string // 'K1', 'K2', etc.
  title: string
  subtext: string
  variant: KpiCardVariant
  onClick?: () => void
  actionLabel?: string
  icon?: ReactNode
}

export function KpiCard({
  idBadge,
  title,
  subtext,
  variant,
  onClick,
  actionLabel = 'Inspeccionar detalle',
  icon,
}: KpiCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.01 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:border-primary/40 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90 dark:hover:border-primary/50"
      aria-label={`${title} (${idBadge}). Clic para ver detalles.`}
    >
      {/* Encabezado de la tarjeta con badge identificador */}
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-bold tracking-wider text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {idBadge}
          </span>
          <h3 className="text-sm font-semibold text-ink group-hover:text-primary dark:text-white transition-colors">
            {title}
          </h3>
        </div>
        {icon && (
          <span className="text-stone-400 group-hover:text-primary transition-colors">
            {icon}
          </span>
        )}
      </div>

      {/* Cuerpo principal del indicador (Anillo de progreso vs Número grande) */}
      <div className="my-4 flex items-center justify-center py-2">
        {variant.type === 'continuous' ? (
          <KpiProgressRing
            value={variant.value}
            target={variant.target}
            label={title}
            size={104}
            strokeWidth={9}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <span
              className={`text-4xl font-extrabold tracking-tight ${
                variant.count === 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : variant.severity === 'alta'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {variant.count}
            </span>
            <div className="mt-1">
              <SeverityPill severity={variant.severity} count={variant.count} />
            </div>
          </div>
        )}
      </div>

      {/* Subtexto y pie con llamado a la acción */}
      <div className="border-t border-stone-100 pt-3 dark:border-stone-800/80">
        <p className="text-xs text-stone-700 dark:text-stone-300 line-clamp-1">
          {subtext}
        </p>
        <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium text-primary">
          <span>{actionLabel}</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </motion.button>
  )
}
