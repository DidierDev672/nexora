import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '../../../../design-tokens/motion'
import { useGuestNames } from '../../application/use-guest-names'
import { useRoomNumbers } from '../../application/use-room-numbers'
import { HuespedDetalleModal } from './huesped-detalle-modal'
import { RoomDetailModal } from './room-detail-modal'
import { RecepcionStayCard } from './recepcion-stay-card'
import {
  calculateStayNights,
  formatPaymentMethod,
  formatSecurityDeposit,
  formatStayDate,
  getStayStatusConfig,
  type StayItem,
} from '../../domain/stay'

export interface RecepcionStayTableProps {
  stays: StayItem[]
  onSelectStay?: (stay: StayItem) => void
}

/**
 * Tabla interactiva para la visualización de recepciones y estancias.
 * Muestra las columnas requeridas: Habitación, Huéspedes, Fecha de ingreso,
 * Fecha de salida, Método de pago, Depósito de garantía y Estado sin IDs crudos.
 * En pantallas pequeñas (< md), se adapta automáticamente visualizándose en formato Card.
 * Implementa Stagger Reveal con motion.tbody y motion.tr orquestados.
 */
export function RecepcionStayTable({ stays, onSelectStay }: RecepcionStayTableProps) {
  const [inspectPersonId, setInspectPersonId] = useState<string | null>(null)
  const [inspectRoomId, setInspectRoomId] = useState<string | null>(null)

  const allPersonIds = useMemo(
    () => Array.from(new Set(stays.flatMap((s) => s.person_ids))),
    [stays]
  )
  const guestNames = useGuestNames(allPersonIds)

  const allRoomIds = useMemo(
    () => Array.from(new Set(stays.map((s) => s.room_id))),
    [stays]
  )
  const roomNumbers = useRoomNumbers(allRoomIds)

  return (
    <>
      {/* 1. Vista en Tarjetas / Cards para pantallas pequeñas (< md) */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden"
      >
        {stays.map((stay) => (
          <RecepcionStayCard
            key={`mobile-table-card-${stay.id}`}
            stay={stay}
            variants={staggerItem}
            onClick={(item) => onSelectStay?.(item)}
          />
        ))}
      </motion.div>

      {/* 2. Vista en Tabla completa para pantallas medianas y grandes (>= md) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-line bg-panel shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-ink border-collapse">
          {/* Encabezado fijo con backdrop blur */}
          <thead className="border-b border-line bg-canvas/70 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <tr>
              <th scope="col" className="px-5 py-3.5">
                Habitación
              </th>
              <th scope="col" className="px-4 py-3.5">
                Huéspedes
              </th>
              <th scope="col" className="px-4 py-3.5">
                Fecha de ingreso
              </th>
              <th scope="col" className="px-4 py-3.5">
                Fecha de salida
              </th>
              <th scope="col" className="px-4 py-3.5">
                Método de pago
              </th>
              <th scope="col" className="px-4 py-3.5 text-right">
                Depósito garantía
              </th>
              <th scope="col" className="px-5 py-3.5 text-center">
                Estado
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
            {stays.map((stay) => {
              const statusCfg = getStayStatusConfig(stay.status)
              const paymentInfo = formatPaymentMethod(stay.payment_method)
              const checkIn = formatStayDate(stay.check_in_date)
              const checkOut = formatStayDate(stay.check_out_date)
              const depositFormatted = formatSecurityDeposit(stay.security_deposit)
              const nights = calculateStayNights(stay.check_in_date, stay.check_out_date)

              return (
                <motion.tr
                  key={stay.id}
                  layout
                  variants={staggerItem}
                  whileHover={{ backgroundColor: 'rgba(var(--color-primary-rgb, 90, 49, 31), 0.03)' }}
                  onClick={() => onSelectStay?.(stay)}
                  className="transition-colors hover:bg-primary/5 cursor-pointer"
                >
                  {/* 1. Habitación (item de la tabla: number) */}
                  <td className="px-5 py-4 whitespace-nowrap font-medium">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setInspectRoomId(stay.room_id)
                      }}
                      title={`Ver detalle de la habitación ${roomNumbers[stay.room_id] || ''}`}
                      className="group/room inline-flex items-center gap-2 rounded-xl border border-line bg-canvas/80 px-2.5 py-1 text-xs font-semibold text-ink hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer shadow-2xs"
                    >
                      <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover/room:bg-primary group-hover/room:text-white transition-colors shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-3"
                          aria-hidden="true"
                        >
                          <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                          <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                          <path d="M3 18h18" />
                        </svg>
                      </span>
                      <span className="font-bold text-ink group-hover/room:text-primary transition-colors">
                        {roomNumbers[stay.room_id] ? `Habitación ${roomNumbers[stay.room_id]}` : 'Habitación'}
                      </span>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-3 text-ink-muted group-hover/room:text-primary transition-colors shrink-0 opacity-60 group-hover/room:opacity-100"
                        aria-hidden="true"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  </td>

                  {/* 2. person_ids */}
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                      {stay.person_ids.length > 0 ? (
                        stay.person_ids.map((pid, idx) => {
                          const guestName = guestNames[pid] || `Huésped ${idx + 1}`
                          const initial = guestNames[pid]
                            ? guestNames[pid].charAt(0).toUpperCase()
                            : String(idx + 1)

                          return (
                            <button
                              key={pid}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setInspectPersonId(pid)
                              }}
                              className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                              title={`Ver ficha completa de ${guestName}`}
                            >
                              <span className="grid size-3.5 place-items-center rounded-full bg-primary/10 text-primary text-[9px] font-bold">
                                {initial}
                              </span>
                              <span className="truncate max-w-[110px]">{guestName}</span>
                            </button>
                          )
                        })
                      ) : (
                        <span className="text-ink-muted italic text-[11px]">Sin asignar</span>
                      )}
                    </div>
                  </td>

                  {/* 3. check_in_date */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-ink">{checkIn.date}</div>
                    <div className="text-[11px] text-ink-muted">{checkIn.time}</div>
                  </td>

                  {/* 4. check_out_date */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-semibold text-ink">{checkOut.date}</div>
                    <div className="text-[11px] text-ink-muted flex items-center gap-1">
                      <span>{checkOut.time}</span>
                      <span className="text-primary font-medium">
                        ({nights} {nights === 1 ? 'noche' : 'noches'})
                      </span>
                    </div>
                  </td>

                  {/* 5. payment_method */}
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/80 px-2.5 py-1 text-xs font-medium text-ink">
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
                      {paymentInfo.label}
                    </span>
                  </td>

                  {/* 6. security_deposit */}
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className="inline-block font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                      {depositFormatted}
                    </span>
                  </td>

                  {/* 7. Estado */}
                  <td className="px-5 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusCfg.colorClasses}`}
                    >
                      <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>
                  </td>
                </motion.tr>
              )
            })}
          </motion.tbody>
        </table>
      </div>
    </div>

    {/* Modal interactivo con los datos del huésped */}
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
