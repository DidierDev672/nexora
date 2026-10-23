import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBed,
  faUser,
  faCalendarDays,
  faUsers,
  faDollarSign,
  faXmark,
  faArrowRight,
  faCircleInfo,
  faClock,
} from '@fortawesome/free-solid-svg-icons'
import type { StatusCodeValidationResult } from '../../../../shared/lib/status-code-validator'
import type { ReservaViewItem } from '../../domain/reserva-list-types'
import { fetchReservaDetailFromApi } from '../../infrastructure/api-reserva-detail-repository'
import { ReservaStateBadge } from '../atoms/reserva-state-badge'

interface ReservaDetalleModalProps {
  isOpen: boolean
  reservaId: string | null
  onClose: () => void
}

export function ReservaDetalleModal({
  isOpen,
  reservaId,
  onClose,
}: ReservaDetalleModalProps) {
  const [detail, setDetail] = useState<ReservaViewItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<StatusCodeValidationResult | null>(null)

  // 1. Efecto ModalPresentationStyle iOS: Contrae #root con scale(0.93) y rounded-[24px]
  useEffect(() => {
    if (!isOpen) return
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
  }, [isOpen])

  // 2. Cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 3. Cargar detalle de la reserva al abrir
  useEffect(() => {
    if (!isOpen || !reservaId) {
      setDetail(null)
      setFeedback(null)
      return
    }

    let isMounted = true
    setLoading(true)

    fetchReservaDetailFromApi(reservaId)
      .then((res) => {
        if (!isMounted) return
        setDetail(res.item)
        setFeedback(res.validation.message ? res.validation : null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, reservaId])

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="detalle-reserva-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo oscuro con desenfoque (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-reserva-detalle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta Modal estilo iOS Card Sheet (desliza desde abajo con física Spring) */}
          <motion.div
            key="modal-reserva-detalle-content"
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
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl transition-all sm:p-8"
          >
            {/* Tirador superior característico de iOS sheet */}
            <div className="flex justify-center mb-3 sm:hidden">
              <div className="h-1.5 w-12 rounded-full bg-line/80" />
            </div>

            {/* Encabezado del modal */}
            <div className="flex items-start justify-between border-b border-line/60 pb-4">
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
                  <FontAwesomeIcon icon={faCircleInfo} className="size-3" />
                  <span>Estadía confirmada</span>
                </p>
                <h2 id="detalle-reserva-title" className="mt-1 text-xl font-bold text-ink sm:text-2xl">
                  Detalle de la estadía
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar detalle"
                className="rounded-xl border border-line bg-surface/50 p-2 text-ink-muted hover:bg-surface hover:text-ink transition-colors"
              >
                <FontAwesomeIcon icon={faXmark} className="size-4" />
              </button>
            </div>

            {/* Estado de carga con efecto fade in */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <span className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                <p className="mt-3 text-sm font-semibold text-ink">Consultando reserva...</p>
                <p className="text-xs text-ink-muted">Obteniendo los datos más recientes del sistema.</p>
              </motion.div>
            )}

            {/* Contenido del detalle de la reserva con fade in según prompt-fade-in.md */}
            {!loading && detail && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mt-5 space-y-4"
              >
                {/* Habitación y Huésped (sin IDs crudos) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <div className="rounded-2xl border border-line/70 bg-canvas/60 p-3.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                      <FontAwesomeIcon icon={faBed} className="size-3 text-primary" />
                      <span>Habitación</span>
                    </span>
                    <p className="mt-1 font-semibold text-ink text-sm truncate">
                      {detail.roomDisplayName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-line/70 bg-canvas/60 p-3.5">
                    <span className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
                      <FontAwesomeIcon icon={faUser} className="size-3 text-primary" />
                      <span>Huésped titular</span>
                    </span>
                    <p className="mt-1 font-semibold text-ink text-sm truncate">
                      {detail.personDisplayName}
                    </p>
                  </div>
                </motion.div>

                {/* Fechas de entrada y salida con total de noches */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="rounded-2xl border border-line/70 bg-canvas/40 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-neutral" />
                      <span>Fecha de entrada</span>
                    </span>
                    <span className="font-semibold text-ink">{detail.checkInFormatted}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-neutral/70">
                    <div className="h-px flex-1 bg-line/60" />
                    <span className="flex items-center gap-1 font-medium text-primary">
                      <FontAwesomeIcon icon={faArrowRight} className="size-2.5" />
                      <span>{detail.nights} {detail.nights === 1 ? 'noche' : 'noches'}</span>
                    </span>
                    <div className="h-px flex-1 bg-line/60" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <FontAwesomeIcon icon={faCalendarDays} className="size-3 text-neutral" />
                      <span>Fecha de salida</span>
                    </span>
                    <span className="font-semibold text-ink">{detail.checkOutFormatted}</span>
                  </div>
                </motion.div>

                {/* Huéspedes, Estado y Valor a pagar */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="flex flex-col gap-3 rounded-2xl border border-line/70 bg-surface/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                      <FontAwesomeIcon icon={faUsers} className="size-3 text-neutral" />
                      <span>Capacidad</span>
                    </span>
                    <p className="mt-0.5 text-sm font-semibold text-ink">
                      {detail.numberOfGuests} {detail.numberOfGuests === 1 ? 'huésped' : 'huéspedes'}
                    </p>
                  </div>

                  <div className="border-t border-line/60 pt-2 sm:border-0 sm:pt-0">
                    <span className="block text-xs text-ink-muted mb-1">Estado de la reserva</span>
                    <ReservaStateBadge label={detail.stateLabel} tone={detail.stateTone} size="md" />
                  </div>

                  <div className="border-t border-line/60 pt-2 text-left sm:border-0 sm:pt-0 sm:text-right">
                    <span className="block text-[11px] uppercase tracking-wider font-semibold text-ink-muted">
                      Valor a pagar
                    </span>
                    <p className="flex items-center sm:justify-end gap-1 text-base sm:text-lg font-bold text-primary">
                      <FontAwesomeIcon icon={faDollarSign} className="size-3.5" />
                      <span>{detail.totalPriceFormatted.replace('$', '').trim()}</span>
                    </p>
                  </div>
                </motion.div>

                {/* Fecha de registro (created_at) limpia, sin created_by */}
                {detail.createdAt && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex items-center justify-between px-1 text-xs text-ink-muted"
                  >
                    <span className="flex items-center gap-1.5">
                      <FontAwesomeIcon icon={faClock} className="size-3 text-neutral" />
                      <span>Fecha de registro</span>
                    </span>
                    <span className="font-medium text-ink">
                      {new Date(detail.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </motion.div>
                )}

                {/* Feedback empático si aplica */}
                {feedback && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300"
                  >
                    {feedback.message}
                  </motion.p>
                )}
              </motion.div>
            )}

            {/* Pie del modal con botón de cierre */}
            <div className="mt-6 flex justify-end border-t border-line/60 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover active:scale-98 transition-all focus-visible:outline-2 focus-visible:outline-primary"
              >
                Cerrar detalle
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
