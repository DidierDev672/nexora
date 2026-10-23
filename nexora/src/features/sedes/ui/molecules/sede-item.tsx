import { motion, type Variants } from 'motion/react'
import {
  SEDE_ESTADO_LABELS,
  type Sede,
  type SedeEstado,
} from '../../domain/sede'
import { cn } from '../lib/cn'
import { STAGGER_ITEM_VARIANTS } from '../lib/sedes-motion'

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
  variants?: Variants
  onDelete?: () => void
  onAddSubSede?: () => void
  onViewSubSedes?: () => void
}

export function SedeItem({
  sede,
  variants,
  onDelete,
  onAddSubSede,
  onViewSubSedes,
}: SedeItemProps) {
  return (
    <motion.li
      variants={variants ?? STAGGER_ITEM_VARIANTS}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="group h-full flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
    >
      <div className="space-y-3">
        {/* 1. Cabecera de la tarjeta: Icono, Nombre de la Sede y Badge de Estado */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                <path d="M9 9h1" />
                <path d="M9 13h1" />
                <path d="M9 17h1" />
                <path d="M14 9h1" />
                <path d="M14 13h1" />
                <path d="M14 17h1" />
              </svg>
            </span>
            <div className="min-w-0">
              <h4 className="truncate font-bold text-base text-ink group-hover:text-primary transition-colors">
                {sede.name}
              </h4>
              <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3 text-ink-muted/80"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {sede.city}
              </span>
            </div>
          </div>

          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shrink-0 shadow-2xs',
              estadoClasses[sede.estado],
            )}
          >
            <span className={cn('size-1.5 rounded-full', estadoDot[sede.estado])} aria-hidden="true" />
            {SEDE_ESTADO_LABELS[sede.estado]}
          </span>
        </div>

        {/* 2. Cuerpo: Dirección y Teléfono */}
        <div className="space-y-1.5 pt-1 text-xs text-ink-muted leading-relaxed">
          <p className="flex items-start gap-1.5">
            <span className="font-semibold text-ink shrink-0">Dirección:</span>
            <span className="line-clamp-2">{sede.address}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-ink shrink-0">Teléfono:</span>
            <span className="truncate">{sede.phone}</span>
          </p>
        </div>
      </div>

      {/* 3. Pie de la tarjeta: Acciones */}
      <div className="mt-4 pt-3.5 border-t border-line/70 flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium text-ink-muted">Opciones</span>
        <div className="flex items-center gap-1.5">
          {onViewSubSedes ? (
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={onViewSubSedes}
              aria-label={`Ver sub sedes de ${sede.name}`}
              title="Ver sub sedes"
              className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer shadow-2xs"
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
              className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer shadow-2xs"
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
              className="grid size-8 place-items-center rounded-lg border border-line text-ink-muted outline-none transition-colors hover:border-danger/40 hover:bg-danger/10 hover:text-danger focus-visible:ring-2 focus-visible:ring-danger/30 cursor-pointer shadow-2xs"
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