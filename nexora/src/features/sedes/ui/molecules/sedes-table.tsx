import { motion } from 'motion/react'
import {
  SEDE_ESTADO_LABELS,
  type Sede,
  type SedeEstado,
} from '../../domain/sede'
import { cn } from '../lib/cn'
import { SedeItem } from './sede-item'
import {
  STAGGER_CONTAINER_VARIANTS,
  STAGGER_ROW_VARIANTS,
  STAGGER_ITEM_VARIANTS,
} from '../lib/sedes-motion'

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

export interface SedesTableProps {
  sedes: Sede[]
  onDelete?: (sede: Sede) => void
  onAddSubSede?: (sede: Sede) => void
  onViewSubSedes?: (sede: Sede) => void
}

export function SedesTable({
  sedes,
  onDelete,
  onAddSubSede,
  onViewSubSedes,
}: SedesTableProps) {
  return (
    <>
      {/* 1. Vista adaptable en Tarjetas (Cards) para pantallas móviles / pequeñas (< md) */}
      <motion.ul
        key="sedes-table-responsive-cards"
        variants={STAGGER_CONTAINER_VARIANTS}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:hidden"
      >
        {sedes.map((sede) => (
          <SedeItem
            key={`table-responsive-card-${sede.id}`}
            sede={sede}
            variants={STAGGER_ITEM_VARIANTS}
            onDelete={onDelete ? () => onDelete(sede) : undefined}
            onAddSubSede={onAddSubSede ? () => onAddSubSede(sede) : undefined}
            onViewSubSedes={onViewSubSedes ? () => onViewSubSedes(sede) : undefined}
          />
        ))}
      </motion.ul>

      {/* 2. Vista en Tabla tabular completa para pantallas medianas y grandes (≥ md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-panel shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-line bg-canvas/80 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-5 py-3.5 sm:px-6">
                Sede
              </th>
              <th scope="col" className="px-4 py-3.5">
                Dirección
              </th>
              <th scope="col" className="px-4 py-3.5">
                Ciudad
              </th>
              <th scope="col" className="px-4 py-3.5">
                Teléfono
              </th>
              <th scope="col" className="px-4 py-3.5">
                Estado
              </th>
              <th scope="col" className="px-5 py-3.5 text-right sm:px-6">
                Acciones
              </th>
            </tr>
          </thead>

          <motion.tbody
            key="sedes-table-tbody"
            variants={STAGGER_CONTAINER_VARIANTS}
            initial="hidden"
            animate="visible"
            className="divide-y divide-line/70"
          >
            {sedes.map((sede) => (
              <motion.tr
                key={sede.id}
                variants={STAGGER_ROW_VARIANTS}
                className="group hover:bg-canvas/50 transition-colors"
              >
                {/* 1. Nombre de la Sede */}
                <td className="px-5 py-3.5 whitespace-nowrap sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary shadow-2xs group-hover:bg-primary group-hover:text-white transition-colors">
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
                    <span className="font-semibold text-ink group-hover:text-primary transition-colors">
                      {sede.name}
                    </span>
                  </div>
                </td>

                {/* 2. Dirección */}
                <td className="px-4 py-3.5 text-ink-muted">
                  <span className="block max-w-[240px] truncate" title={sede.address}>
                    {sede.address}
                  </span>
                </td>

                {/* 3. Ciudad */}
                <td className="px-4 py-3.5 whitespace-nowrap text-ink">
                  <span className="inline-flex items-center gap-1.5 font-medium text-ink-muted">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 shrink-0 text-ink-muted/80"
                      aria-hidden="true"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {sede.city}
                  </span>
                </td>

                {/* 4. Teléfono */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1.5 text-ink-muted font-medium">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3.5 shrink-0 text-ink-muted/80"
                      aria-hidden="true"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
                    </svg>
                    {sede.phone}
                  </span>
                </td>

                {/* 5. Estado */}
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                      estadoClasses[sede.estado],
                    )}
                  >
                    <span
                      className={cn('size-1.5 rounded-full', estadoDot[sede.estado])}
                      aria-hidden="true"
                    />
                    {SEDE_ESTADO_LABELS[sede.estado]}
                  </span>
                </td>

                {/* 6. Acciones */}
                <td className="px-5 py-3.5 whitespace-nowrap text-right sm:px-6">
                  <div className="flex items-center justify-end gap-1.5">
                    {onViewSubSedes ? (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onClick={() => onViewSubSedes(sede)}
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
                        onClick={() => onAddSubSede(sede)}
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
                        onClick={() => onDelete(sede)}
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
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
    </>
  )
}
