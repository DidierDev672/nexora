import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBed,
  faUser,
  faCalendarDays,
  faArrowRight,
  faUsers,
  faDollarSign,
  faEye,
} from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion/react'
import { staggerItem } from '../../../../design-tokens/motion'
import type { ReservaViewItem } from '../../domain/reserva-list-types'
import { ReservaStateBadge } from '../atoms/reserva-state-badge'

interface ReservaCardItemProps {
  item: ReservaViewItem
  onSelect?: (id: string) => void
}

export function ReservaCardItem({ item, onSelect }: ReservaCardItemProps) {
  return (
    <motion.article
      variants={staggerItem}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      {/* Encabezado de la card: Habitación y Estado */}
      <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FontAwesomeIcon icon={faBed} className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-ink text-sm sm:text-base leading-snug">
              {item.roomDisplayName}
            </h3>
            <p className="text-xs text-ink-muted">Alojamiento asignado</p>
          </div>
        </div>

        <ReservaStateBadge label={item.stateLabel} tone={item.stateTone} />
      </div>

      {/* Huésped titular */}
      <div className="mt-3.5 flex items-center gap-2.5 rounded-xl bg-canvas/70 px-3 py-2">
        <FontAwesomeIcon icon={faUser} className="size-3.5 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink">
            {item.personDisplayName}
          </p>
          <p className="text-[11px] text-ink-muted">Huésped principal</p>
        </div>
      </div>

      {/* Fechas de entrada y salida con noches */}
      <div className="mt-3.5 space-y-2 rounded-xl border border-line/50 p-3 text-xs">
        <div className="flex items-center justify-between text-ink-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-neutral" />
            <span>Entrada</span>
          </span>
          <span className="font-semibold text-ink">{item.checkInFormatted}</span>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral/70">
          <div className="h-px flex-1 bg-line/60" />
          <span className="flex items-center gap-1 font-medium text-primary">
            <FontAwesomeIcon icon={faArrowRight} className="size-2.5" />
            <span>{item.nights} {item.nights === 1 ? 'noche' : 'noches'}</span>
          </span>
          <div className="h-px flex-1 bg-line/60" />
        </div>

        <div className="flex items-center justify-between text-ink-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-neutral" />
            <span>Salida</span>
          </span>
          <span className="font-semibold text-ink">{item.checkOutFormatted}</span>
        </div>
      </div>

      {/* Pie de la card: Capacidad de huéspedes y Precio Total */}
      <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-ink-muted">
          <FontAwesomeIcon icon={faUsers} className="size-3.5 text-neutral" />
          <span className="font-medium text-ink">
            {item.numberOfGuests} {item.numberOfGuests === 1 ? 'huésped' : 'huéspedes'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-ink-muted font-medium">Total</p>
            <p className="flex items-center justify-end gap-1 text-sm sm:text-base font-bold text-primary">
              <FontAwesomeIcon icon={faDollarSign} className="size-3" />
              <span>{item.totalPriceFormatted.replace('$', '').trim()}</span>
            </p>
          </div>

          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              aria-label="Visualizar detalle de la reserva"
              title="Visualizar detalle"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl border border-line bg-surface/60 text-ink-muted hover:border-primary/40 hover:bg-primary hover:text-white transition-all active:scale-95"
            >
              <FontAwesomeIcon icon={faEye} className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
