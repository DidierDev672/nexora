import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useGuestNames } from '../../application/use-guest-names'
import { useRoomNumber } from '../../application/use-room-numbers'
import { RoomDetailModal } from './room-detail-modal'
import {
  calculateStayNights,
  formatPaymentMethod,
  formatSecurityDeposit,
  formatStayDate,
  getStayStatusConfig,
  type StayItem,
} from '../../domain/stay'

export interface RecepcionStayDetailModalProps {
  stay: StayItem | null
  isOpen?: boolean
  onClose: () => void
}

/**
 * Modal para visualizar el detalle completo de la recepción / estancia seleccionada.
 * Implementa ModalPresentationStyle (Estilo tarjeta iOS / Card Stack).
 *
 * Características técnicas implementadas según especificación:
 * 1. AnimatePresence: Envuelve el condicional {isModalOpen && currentStay && (...)}
 *    garantizando el ciclo completo de desmontaje animado sin retornos prematuros.
 * 2. Física Spring iOS: Deslizamiento vertical con amortiguación calibrada
 *    (damping: 28, stiffness: 280, mass: 0.85).
 * 3. Profundidad 3D en pantalla de fondo: Aplica scale(0.93) y rounded-[24px] a #root
 *    con curva cubic-bezier(0.32, 0.72, 0, 1) y restauración en cleanup.
 * 4. Tirador táctil (pill handle) para experiencia nativa iOS en dispositivos móviles.
 * 5. Cumplimiento estricto de las Reglas de Oro:
 *    - NO expone IDs de huésped (person-1, etc.) ni IDs internos.
 *    - NO expone IDs de habitación (room-1, hab-101, etc.) — muestra nombre legible con `number`.
 *    - NO expone creadores de registro (created_by).
 *    - Depósito de garantía en formato de moneda colombiana (COP).
 */
export function RecepcionStayDetailModal({
  stay,
  isOpen,
  onClose,
}: RecepcionStayDetailModalProps) {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(stay)
  const [cachedStay, setCachedStay] = useState<StayItem | null>(stay)
  const [inspectRoomId, setInspectRoomId] = useState<string | null>(null)

  useEffect(() => {
    if (stay) {
      setCachedStay(stay)
    }
  }, [stay])

  const currentStay = stay ?? cachedStay
  const guestNames = useGuestNames(currentStay ? currentStay.person_ids : [])
  const roomNumber = useRoomNumber(currentStay?.room_id)

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (scale-[0.93], rounded-[24px], origin-bottom)
  useEffect(() => {
    if (!isModalOpen) return
    const rootEl = document.getElementById('root')
    if (!rootEl) return

    const prevTransition = rootEl.style.transition
    const prevTransform = rootEl.style.transform
    const prevBorderRadius = rootEl.style.borderRadius
    const prevTransformOrigin = rootEl.style.transformOrigin
    const prevOverflow = rootEl.style.overflow
    const prevBodyOverflow = document.body.style.overflow
    const prevBodyBg = document.body.style.backgroundColor

    rootEl.style.transition =
      'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)'
    rootEl.style.transformOrigin = 'bottom center'
    rootEl.style.transform = 'scale(0.93)'
    rootEl.style.borderRadius = '24px'
    rootEl.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#000000'

    return () => {
      rootEl.style.transition = prevTransition
      rootEl.style.transform = prevTransform
      rootEl.style.borderRadius = prevBorderRadius
      rootEl.style.transformOrigin = prevTransformOrigin
      rootEl.style.overflow = prevOverflow
      document.body.style.overflow = prevBodyOverflow
      document.body.style.backgroundColor = prevBodyBg
    }
  }, [isModalOpen])

  // Soporte para cerrar con la tecla Escape
  useEffect(() => {
    if (!isModalOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, onClose])

  if (!currentStay) return null

  const statusCfg = getStayStatusConfig(currentStay.status)
  const paymentInfo = formatPaymentMethod(currentStay.payment_method)
  const checkIn = formatStayDate(currentStay.check_in_date)
  const checkOut = formatStayDate(currentStay.check_out_date)
  const depositFormatted = formatSecurityDeposit(currentStay.security_deposit)
  const nights = calculateStayNights(currentStay.check_in_date, currentStay.check_out_date)

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-stay-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo oscurecido con desenfoque suave (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-stay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta Modal: estilo iOS sheet con física Spring */}
          <motion.div
            key="modal-stay-content"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl transition-all sm:p-8 text-ink"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* Cabecera del modal */}
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6"
                    aria-hidden="true"
                  >
                    <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                    <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                    <path d="M3 18h18" />
                  </svg>
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
                    Detalle de Recepción
                  </span>
                  <h3 id="modal-stay-title" className="text-xl font-bold text-ink">
                    {roomNumber ? `Habitación ${roomNumber}` : 'Habitación'}
                  </h3>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal de recepción"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-line bg-canvas/80 text-ink-muted hover:border-primary/40 hover:bg-canvas hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4.5"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="mt-5 space-y-4 text-xs">
              {/* Estado de la estancia */}
              <div className="flex items-center justify-between rounded-2xl bg-canvas/60 p-3.5 border border-line">
                <span className="font-semibold text-ink-muted">Estado actual:</span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold ${statusCfg.colorClasses}`}
                >
                  <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                  {statusCfg.label}
                </span>
              </div>

              {/* Habitación asignada (número obtenido vía GET /room/{id} con Axios) */}
              <div className="flex items-center justify-between rounded-2xl bg-canvas/60 p-3.5 border border-line">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
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
                      <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                      <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                      <path d="M3 18h18" />
                    </svg>
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-ink-muted block">
                      Habitación
                    </span>
                    <span className="text-sm font-bold text-ink">
                      {roomNumber ? `Habitación ${roomNumber}` : '—'}
                    </span>
                  </div>
                </div>

                {currentStay.room_id && (
                  <button
                    type="button"
                    onClick={() => setInspectRoomId(currentStay.room_id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    Ver detalle
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Huéspedes asignados (Nombres reales sin IDs técnicos) */}
              <div className="rounded-2xl border border-line bg-canvas/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
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
                    Huéspedes registrados
                  </span>
                  <span className="text-[11px] font-medium text-ink-muted">
                    {currentStay.person_ids.length}{' '}
                    {currentStay.person_ids.length === 1 ? 'huésped' : 'huéspedes'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {currentStay.person_ids.length > 0 ? (
                    currentStay.person_ids.map((pid, idx) => {
                      const guestName = guestNames[pid] || `Huésped ${idx + 1}`
                      const initial = guestNames[pid]
                        ? guestNames[pid].charAt(0).toUpperCase()
                        : String(idx + 1)

                      return (
                        <div
                          key={pid}
                          className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel px-3 py-1.5 shadow-2xs"
                        >
                          <span className="grid size-5 place-items-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                            {initial}
                          </span>
                          <span className="font-semibold text-ink text-xs">{guestName}</span>
                        </div>
                      )
                    })
                  ) : (
                    <span className="text-xs italic text-ink-muted">Sin huéspedes asignados</span>
                  )}
                </div>
              </div>

              {/* Fechas de estancia */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border border-line bg-canvas/40 p-4">
                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
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
                    Fecha de entrada:
                  </span>
                  <p className="font-bold text-ink text-sm">{checkIn.date}</p>
                  <p className="text-[11px] text-ink-muted">{checkIn.time}</p>
                </div>

                <div className="space-y-1">
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted">
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
                  <p className="font-bold text-ink text-sm">{checkOut.date}</p>
                  <p className="text-[11px] text-ink-muted">
                    {checkOut.time} · ({nights} {nights === 1 ? 'noche' : 'noches'})
                  </p>
                </div>
              </div>

              {/* Finanzas: Método de Pago + Depósito de garantía en formato colombiano COP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-canvas/30 p-3.5">
                  <span className="text-[11px] font-semibold text-ink-muted flex items-center gap-1.5 mb-1">
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
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                    Método de pago
                  </span>
                  <p className="font-bold text-ink text-sm mt-0.5">{paymentInfo.label}</p>
                </div>

                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
                  <span className="text-[11px] font-semibold text-primary flex items-center gap-1.5 mb-1">
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
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Depósito de garantía
                  </span>
                  <p className="font-extrabold text-primary text-base mt-0.5">
                    {depositFormatted}
                  </p>
                </div>
              </div>

              {/* Observaciones (si existen) */}
              {currentStay.remarks && (
                <div className="rounded-2xl border border-line bg-canvas/30 p-3.5">
                  <span className="text-[11px] font-semibold text-ink-muted">Observaciones:</span>
                  <p className="text-ink mt-1 italic leading-relaxed">{currentStay.remarks}</p>
                </div>
              )}
            </div>

            {/* Botón de acción inferior */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-white shadow-xs hover:opacity-90 transition cursor-pointer"
              >
                Cerrar detalle
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Modal interactivo para visualizar el detalle de la habitación (GET /room/{id}) */}
    <RoomDetailModal
      roomId={inspectRoomId}
      onClose={() => setInspectRoomId(null)}
    />
  </>
)
}
