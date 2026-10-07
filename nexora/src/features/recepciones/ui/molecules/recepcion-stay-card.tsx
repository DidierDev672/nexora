import { useState } from 'react'
import { motion, type Variants } from 'motion/react'
import { staggerItem } from '../../../../design-tokens/motion'
import { useGuestNames } from '../../application/use-guest-names'
import { useRoomNumber } from '../../application/use-room-numbers'
import { HuespedDetalleModal } from './huesped-detalle-modal'
import { RoomDetailModal } from './room-detail-modal'
import {
  calculateStayNights,
  formatPaymentMethod,
  formatSecurityDeposit,
  formatStayDate,
  getStayStatusConfig,
  type StayItem,
} from '../../domain/stay'

export interface RecepcionStayCardProps {
  stay: StayItem
  onClick?: (stay: StayItem) => void
  variants?: Variants
}

/**
 * Card de visualización para una estancia/recepción.
 * Contiene de forma destacada y accesible los 6 campos requeridos:
 * 1. Habitación (número legible vía GET /room/{id}, sin IDs técnicos)
 * 2. person_ids (interactivo: clic abre ficha del huésped vía GET /person/{id})
 * 3. check_in_date
 * 4. check_out_date
 * 5. payment_method
 * 6. security_deposit
 */
export function RecepcionStayCard({ stay, onClick, variants }: RecepcionStayCardProps) {
  const [inspectPersonId, setInspectPersonId] = useState<string | null>(null)
  const [inspectRoomId, setInspectRoomId] = useState<string | null>(null)
  const guestNames = useGuestNames(stay.person_ids)
  const roomNumber = useRoomNumber(stay.room_id)

  const statusCfg = getStayStatusConfig(stay.status)
  const paymentInfo = formatPaymentMethod(stay.payment_method)
  const checkIn = formatStayDate(stay.check_in_date)
  const checkOut = formatStayDate(stay.check_out_date)
  const depositFormatted = formatSecurityDeposit(stay.security_deposit)
  const nights = calculateStayNights(stay.check_in_date, stay.check_out_date)

  return (
    <>
      <motion.article
        layout
        variants={variants ?? staggerItem}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        onClick={() => onClick?.(stay)}
        tabIndex={0}
        role="button"
        aria-label={roomNumber ? `Estancia en Habitación ${roomNumber}` : 'Estancia'}
        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-panel p-5 text-ink shadow-xs transition-shadow hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
      {/* Indicador de acento en el borde superior */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30 opacity-0 transition-opacity group-hover:opacity-100" />

      <div>
        {/* Cabecera: Habitación + Status Badge */}
        <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setInspectRoomId(stay.room_id)
            }}
            title={roomNumber ? `Ver detalle de la habitación ${roomNumber}` : 'Ver detalle de la habitación'}
            className="group/room flex items-center gap-2.5 text-left rounded-xl p-1 -m-1 hover:bg-primary/5 transition-colors cursor-pointer"
          >
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0 group-hover/room:bg-primary group-hover/room:text-white transition-colors">
              {/* Icono de Habitación */}
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
                <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                <path d="M3 18h18" />
              </svg>
            </span>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted block group-hover/room:text-primary transition-colors">
                Habitación
              </span>
              <p className="text-sm font-bold text-ink group-hover/room:text-primary transition-colors">
                {roomNumber ? roomNumber : '—'}
              </p>
            </div>
          </button>

          {/* Badge de Estado */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusCfg.colorClasses}`}
          >
            <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
            {statusCfg.label}
          </span>
        </div>

        {/* Sección: person_ids (Huéspedes asignados) */}
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-primary"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Huéspedes
            </span>
            <span className="text-[11px] font-medium text-ink-muted/80">
              {stay.person_ids.length} {stay.person_ids.length === 1 ? 'huésped' : 'huéspedes'}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {stay.person_ids.length > 0 ? (
              stay.person_ids.map((personId, index) => {
                const guestName = guestNames[personId] || `Huésped ${index + 1}`
                const initial = guestNames[personId]
                  ? guestNames[personId].charAt(0).toUpperCase()
                  : String(index + 1)

                return (
                  <button
                    key={personId}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setInspectPersonId(personId)
                    }}
                    className="group/guest inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/80 px-2.5 py-1 text-xs font-medium text-ink hover:border-primary/50 hover:text-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-2xs"
                    title={`Ver ficha completa de ${guestName}`}
                  >
                    <span className="grid size-4 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold group-hover/guest:bg-primary group-hover/guest:text-white transition-colors">
                      {initial}
                    </span>
                    <span className="max-w-[130px] sm:max-w-[160px] truncate font-medium">
                      {guestName}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-3 text-ink-muted group-hover/guest:text-primary transition-colors shrink-0"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                )
              })
            ) : (
              <span className="text-xs italic text-ink-muted">Sin huéspedes asignados</span>
            )}
          </div>
        </div>

        {/* Sección: check_in_date & check_out_date */}
        <div className="mt-4 rounded-xl border border-line/70 bg-canvas/40 p-3 space-y-2">
          {/* Ingreso */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-ink-muted">
              {/* Icono Check-in */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Fecha de ingreso:
            </span>
            <span className="font-semibold text-ink" title={stay.check_in_date}>
              {checkIn.full}
            </span>
          </div>

          {/* Salida */}
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-ink-muted">
              {/* Icono Check-out */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Fecha de salida:
            </span>
            <span className="font-semibold text-ink" title={stay.check_out_date}>
              {checkOut.full}
            </span>
          </div>

          <div className="border-t border-line/40 pt-1.5 flex items-center justify-between text-[11px] text-ink-muted">
            <span>Estadía estimada:</span>
            <span className="font-semibold text-primary">
              {nights} {nights === 1 ? 'noche' : 'noches'}
            </span>
          </div>
        </div>

        {/* Sección: payment_method & security_deposit */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {/* Método de pago */}
          <div className="flex flex-col rounded-xl border border-line bg-canvas/30 p-2.5">
            <span className="text-[11px] font-medium text-ink-muted flex items-center gap-1 mb-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 text-primary"
                aria-hidden="true"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Método de pago
            </span>
            <span className="text-xs font-bold text-ink truncate" title={paymentInfo.label}>
              {paymentInfo.label}
            </span>
          </div>

          {/* Depósito de garantía */}
          <div className="flex flex-col rounded-xl border border-primary/20 bg-primary/5 p-2.5">
            <span className="text-[11px] font-medium text-primary flex items-center gap-1 mb-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 text-primary"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Depósito garantía
            </span>
            <span className="text-xs font-bold text-primary truncate">
              {depositFormatted}
            </span>
          </div>
        </div>
      </div>
    </motion.article>

      {/* Modal interactivo para visualizar la información del huésped */}
      <HuespedDetalleModal
        personId={inspectPersonId}
        onClose={() => setInspectPersonId(null)}
      />

      {/* Modal interactivo para visualizar el detalle de la habitación (GET /room/{id}) */}
      <RoomDetailModal
        roomId={inspectRoomId}
        onClose={() => setInspectRoomId(null)}
      />
    </>
  )
}
