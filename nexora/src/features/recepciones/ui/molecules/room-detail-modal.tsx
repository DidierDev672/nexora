import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  useCatalogRoom,
  useCatalogBuildingHierarchy,
  RoomTypeCard,
  BuildingSummaryCard,
  HeadquarterSummaryCard,
  CatalogStatusBadge,
  formatCOP,
  type RoomCatalogItem,
} from '../../../../shared/catalog'

export interface RoomDetailModalProps {
  roomId: string | null
  isOpen?: boolean
  onClose: () => void
}

/**
 * Modal interactivo para visualizar el detalle completo de la habitación seleccionada.
 * Implementa ModalPresentationStyle (Estilo tarjeta iOS / Card Stack).
 *
 * Utiliza el Catálogo Maestro Compartido (Shared Catalog Kernel + Atomic Design):
 * - Huéspedes, Habitaciones, Tipos de Habitación, Edificios y Sedes.
 * - Moléculas reutilizables: <RoomTypeCard />, <BuildingSummaryCard />, <HeadquarterSummaryCard />.
 * - Validación de códigos de estado mediante `validateStatusCode`.
 * - 100% en español, sin exposición de IDs técnicos en la interfaz de usuario.
 */
export function RoomDetailModal({ roomId, isOpen, onClose }: RoomDetailModalProps) {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(roomId)
  const [cachedRoom, setCachedRoom] = useState<RoomCatalogItem | null>(null)

  // Consulta reactiva de la habitación con caché y deduplicación en vuelo
  const { data: room, loading: roomLoading, validation: roomValidation } = useCatalogRoom(roomId)

  useEffect(() => {
    if (room) {
      setCachedRoom(room)
    }
  }, [room])

  const displayRoom = room ?? cachedRoom

  // Resuelve la jerarquía del edificio, sede y subsede de forma automática
  const {
    building,
    headquarter,
    subHeadquarter,
  } = useCatalogBuildingHierarchy(displayRoom?.building_id)

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

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-room-detail-title"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo oscurecido con desenfoque suave (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-room-detail"
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
            key="modal-room-detail-content"
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl transition-all sm:p-8 space-y-6 text-ink"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* Cabecera del modal */}
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0 border border-primary/20">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-5.5"
                    aria-hidden="true"
                  >
                    <path d="M3 20v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8" />
                    <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                    <path d="M3 18h18" />
                  </svg>
                </span>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary mb-1">
                    Detalle de Habitación
                  </span>
                  <h3 id="modal-room-detail-title" className="text-xl font-bold text-ink">
                    {displayRoom ? `Habitación ${displayRoom.number}` : 'Cargando información…'}
                  </h3>
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar ventana de detalle de habitación"
                className="grid size-9 place-items-center rounded-xl border border-line bg-canvas/80 text-ink-muted hover:border-primary/40 hover:bg-canvas hover:text-ink transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Estado de carga general */}
            {roomLoading && !displayRoom ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <span className="size-8 animate-spin rounded-full border-3 border-primary/25 border-t-primary" />
                <p className="text-xs text-ink-muted">Consultando información de la habitación…</p>
              </div>
            ) : roomValidation && !roomValidation.isValid ? (
              /* Error o advertencia según validateStatusCode */
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 text-center space-y-2">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                  {roomValidation.title || 'Aviso al consultar la habitación'}
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {roomValidation.message || 'No fue posible cargar los datos de la habitación.'}
                </p>
              </div>
            ) : displayRoom ? (
              <div className="space-y-5 text-xs">
                {/* 1. SECCIÓN: Datos Principales de la Habitación */}
                <div className="space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Información de la Habitación
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Número */}
                    <div className="rounded-2xl border border-line bg-canvas/50 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Número de habitación
                      </span>
                      <p className="text-base font-bold text-ink">{displayRoom.number}</p>
                    </div>

                    {/* Piso */}
                    <div className="rounded-2xl border border-line bg-canvas/50 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Piso asignado
                      </span>
                      <p className="text-base font-bold text-ink">Piso {displayRoom.floor}</p>
                    </div>

                    {/* Tarifa especial */}
                    <div className="rounded-2xl border border-line bg-canvas/50 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Tarifa especial personalizada
                      </span>
                      <p className="text-sm font-bold text-primary">
                        {displayRoom.price_override != null
                          ? formatCOP(displayRoom.price_override)
                          : 'Sin tarifa especial'}
                      </p>
                    </div>

                    {/* Estado de disponibilidad */}
                    <div className="rounded-2xl border border-line bg-canvas/50 p-3.5 space-y-1">
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Estado de la habitación
                      </span>
                      <div>
                        <CatalogStatusBadge status={displayRoom.status} />
                      </div>
                    </div>
                  </div>

                  {/* Servicio de recepción */}
                  <div className="rounded-2xl border border-line bg-canvas/50 p-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-ink-muted block">
                        Servicio de recepción
                      </span>
                      <p className="text-sm font-bold text-ink mt-0.5">
                        {displayRoom.has_reception ? 'Recepción habilitada' : 'Sin servicio de recepción'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        displayRoom.has_reception
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-neutral/10 text-ink-muted border border-line'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          displayRoom.has_reception ? 'bg-emerald-500' : 'bg-neutral'
                        }`}
                      />
                      {displayRoom.has_reception ? 'Habilitada' : 'No asignada'}
                    </span>
                  </div>
                </div>

                {/* 2. SECCIÓN: Tipo de Habitación (Molécula reutilizable GET /room-types/{id}) */}
                <div className="space-y-2.5 pt-2 border-t border-line/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Tipo de Habitación (Catálogo)
                  </span>
                  <RoomTypeCard roomTypeId={displayRoom.room_types_id} />
                </div>

                {/* 3. SECCIÓN: Edificio o Torre (Molécula reutilizable GET /building/{id}) */}
                <div className="space-y-2.5 pt-2 border-t border-line/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Edificio o Torre
                  </span>
                  <BuildingSummaryCard
                    buildingId={displayRoom.building_id}
                    initialData={building}
                  />
                </div>

                {/* 4. SECCIÓN: Sede y Subsede (Molécula reutilizable GET /headquarters y /sub-headquarters) */}
                <div className="space-y-2.5 pt-2 border-t border-line/60">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                    Ubicación Institucional
                  </span>
                  <HeadquarterSummaryCard
                    headquartersId={building?.headquarters_id}
                    subHeadquartersId={building?.sub_headquarters_id}
                    initialHeadquarter={headquarter}
                    initialSubHeadquarter={subHeadquarter}
                  />
                </div>
              </div>
            ) : null}

            {/* Footer */}
            <div className="flex justify-end pt-3 border-t border-line/60">
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
  )
}
