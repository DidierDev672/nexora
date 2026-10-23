import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBed,
  faUser,
  faCalendarDays,
  faUsers,
  faCircleDot,
  faDollarSign,
  faEye,
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '../../../../design-tokens/motion'
import type { ReservaViewItem } from '../../domain/reserva-list-types'
import { ReservaStateBadge } from '../atoms/reserva-state-badge'

interface ReservasTablaViewProps {
  items: ReservaViewItem[]
  onSelect?: (id: string) => void
}

export function ReservasTablaView({ items, onSelect }: ReservasTablaViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-line bg-surface/40 text-xs font-semibold uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBed} className="size-3 text-neutral" />
                  <span>Habitación</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUser} className="size-3 text-neutral" />
                  <span>Huésped</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-neutral" />
                  <span>Entrada</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-neutral" />
                  <span>Salida</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5 text-center">
                <span className="inline-flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faUsers} className="size-3 text-neutral" />
                  <span>Huéspedes</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleDot} className="size-3 text-neutral" />
                  <span>Estado</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                <span className="inline-flex items-center justify-end gap-1.5">
                  <FontAwesomeIcon icon={faDollarSign} className="size-3 text-neutral" />
                  <span>Precio Total</span>
                </span>
              </th>
              <th scope="col" className="px-5 py-3.5 text-center w-14">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <motion.tbody
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.05 }}
            className="divide-y divide-line/60"
          >
            {items.map((item) => (
              <motion.tr
                key={item.id}
                variants={staggerItem}
                className="transition-colors hover:bg-canvas/50"
              >
                {/* Habitación */}
                <td className="px-5 py-4 font-semibold text-ink">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FontAwesomeIcon icon={faBed} className="size-3" />
                    </div>
                    <span className="truncate">{item.roomDisplayName}</span>
                  </div>
                </td>

                {/* Huésped */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="size-3 text-neutral" />
                    <span className="font-medium text-ink truncate">{item.personDisplayName}</span>
                  </div>
                </td>

                {/* Entrada */}
                <td className="px-5 py-4 text-xs text-ink whitespace-nowrap">
                  {item.checkInFormatted}
                </td>

                {/* Salida */}
                <td className="px-5 py-4 text-xs text-ink whitespace-nowrap">
                  <div>
                    <span>{item.checkOutFormatted}</span>
                    <span className="block text-[11px] text-primary font-medium">
                      ({item.nights} {item.nights === 1 ? 'noche' : 'noches'})
                    </span>
                  </div>
                </td>

                {/* Huéspedes */}
                <td className="px-5 py-4 text-center">
                  <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 text-xs font-medium text-ink">
                    <FontAwesomeIcon icon={faUsers} className="size-2.5 text-neutral" />
                    {item.numberOfGuests}
                  </span>
                </td>

                {/* Estado */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <ReservaStateBadge label={item.stateLabel} tone={item.stateTone} />
                </td>

                {/* Precio */}
                <td className="px-5 py-4 text-right font-bold text-primary whitespace-nowrap">
                  {item.totalPriceFormatted}
                </td>

                {/* Acción de visualización de detalle */}
                <td className="px-5 py-4 text-center whitespace-nowrap">
                  {onSelect && (
                    <button
                      type="button"
                      onClick={() => onSelect(item.id)}
                      aria-label="Visualizar detalle de la reserva"
                      title="Visualizar detalle"
                      className="inline-flex size-8 items-center justify-center rounded-xl border border-line bg-surface/60 text-ink-muted hover:border-primary/40 hover:bg-primary hover:text-white transition-all active:scale-95"
                    >
                      <FontAwesomeIcon icon={faEye} className="size-3.5" />
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  )
}
