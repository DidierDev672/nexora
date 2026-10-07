import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useCatalogHeadquarter } from '../../application/use-catalog'
import { catalogApi } from '../../infrastructure/catalog-api-client'
import { CatalogStatusBadge } from '../atoms/catalog-status-badge'
import type { SubHeadquarterCatalogItem } from '../../domain/catalog-types'

export interface HeadquarterDetailModalProps {
  headquartersId: string | null
  subHeadquartersId?: string | null
  isOpen?: boolean
  onClose: () => void
}

/**
 * Modal interactivo para visualizar el detalle completo de una Sede y sus Subsedes vinculadas.
 *
 * Características:
 * - Utiliza el Catálogo Maestro Compartido (Shared Catalog Kernel):
 *   - Consulta GET /headquarters/{id} con deduplicación y caché en memoria.
 *   - Consulta GET /sub-headquarters para listar las subsedes asociadas.
 * - Estilo visual Material UI / iOS Sheet con animación fluida Motion y backdrop blur.
 * - Regla de oro: cero IDs técnicos en la interfaz de usuario.
 * - 100% en español comprensible.
 */
export function HeadquarterDetailModal({
  headquartersId,
  subHeadquartersId,
  isOpen,
  onClose,
}: HeadquarterDetailModalProps) {
  const isModalOpen = isOpen !== undefined ? isOpen : Boolean(headquartersId)
  const { data: headquarter, loading: hqLoading } = useCatalogHeadquarter(headquartersId)
  const [subSedes, setSubSedes] = useState<SubHeadquarterCatalogItem[]>([])
  const [subSedesLoading, setSubSedesLoading] = useState(false)

  // Carga reactiva de las subsedes asociadas a la sede
  useEffect(() => {
    let isMounted = true
    if (!headquartersId) {
      setSubSedes([])
      return
    }

    setSubSedesLoading(true)
    void catalogApi.getSubHeadquartersByHeadquarter(headquartersId).then((list) => {
      if (!isMounted) return
      setSubSedes(list)
      setSubSedesLoading(false)
    })

    return () => {
      isMounted = false
    }
  }, [headquartersId])

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (#root con scale(0.93), rounded-[24px], origin-bottom)
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

  // Escuchar tecla Escape
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
          aria-labelledby="modal-sede-title"
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop con desenfoque suave (Backdrop estilo iOS) */}
          <motion.div
            key="backdrop-headquarter"
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
            key="modal-headquarter-content"
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
            className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col rounded-t-[32px] sm:rounded-3xl border border-line bg-panel shadow-2xl overflow-hidden"
          >
            {/* Tirador táctil / Handle iOS para móvil */}
            <div className="mx-auto mt-2.5 mb-1 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between border-b border-line/60 px-6 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shrink-0">
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
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
                    Información de infraestructura
                  </span>
                  <h2 id="modal-sede-title" className="text-xl sm:text-2xl font-black text-ink">
                    {headquarter?.name || 'Sede de la red'}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {headquarter && <CatalogStatusBadge status={headquarter.status} />}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar ventana de sede"
                  className="grid size-8 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Contenido con scroll */}
            <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-6">
              {hqLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <span className="size-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
                  <p className="text-xs text-ink-muted">Cargando datos de la sede y subsedes…</p>
                </div>
              ) : headquarter ? (
                <>
                  {/* Datos Generales de la Sede Principal */}
                  <div className="rounded-2xl border border-line bg-canvas/40 p-4 sm:p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-line/50 pb-2.5">
                      <span className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-primary" />
                        Sede Principal
                      </span>
                      <span className="text-[11px] text-ink-muted">Punto central de operación</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-line/60 bg-panel p-3 space-y-1">
                        <span className="text-[11px] font-semibold text-ink-muted block">Ciudad:</span>
                        <p className="font-bold text-ink text-sm">{headquarter.city || 'No registrada'}</p>
                      </div>

                      <div className="rounded-xl border border-line/60 bg-panel p-3 space-y-1">
                        <span className="text-[11px] font-semibold text-ink-muted block">Dirección física:</span>
                        <p className="font-semibold text-ink truncate" title={headquarter.address}>
                          {headquarter.address || 'Sin dirección registrada'}
                        </p>
                      </div>

                      <div className="rounded-xl border border-line/60 bg-panel p-3 space-y-1">
                        <span className="text-[11px] font-semibold text-ink-muted block">Teléfono de contacto:</span>
                        <p className="font-bold text-ink">
                          {headquarter.phone ? (
                            <a
                              href={`tel:${headquarter.phone}`}
                              className="text-primary hover:underline"
                            >
                              {headquarter.phone}
                            </a>
                          ) : (
                            'No registrado'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Subsedes Vinculadas */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="size-4"
                            aria-hidden="true"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-ink">
                            Subsedes y anexos vinculados ({subSedes.length})
                          </h3>
                          <span className="text-[11px] text-ink-muted">
                            Puntos de atención satélite asociados a esta sede
                          </span>
                        </div>
                      </div>
                    </div>

                    {subSedesLoading ? (
                      <div className="p-6 text-center text-xs text-ink-muted animate-pulse">
                        Consultando subsedes vinculadas…
                      </div>
                    ) : subSedes.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-line bg-canvas/30 p-6 text-center text-xs text-ink-muted">
                        Esta sede opera actualmente como punto único central sin subsedes satélites registradas.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {subSedes.map((sub) => {
                          const isAssigned = subHeadquartersId === sub.id

                          return (
                            <div
                              key={sub.id}
                              title={isAssigned ? 'Este usuario ha sido asignado a esta sede' : undefined}
                              className={`group/subcard relative rounded-2xl border p-4 space-y-2 transition-all duration-200 ${
                                isAssigned
                                  ? 'z-10 border-orange-500/70 bg-orange-500/5 ring-1 ring-orange-500/40 shadow-[0_0_18px_rgba(249,115,22,0.4),0_6px_22px_-2px_rgba(239,68,68,0.35)] hover:shadow-[0_0_24px_rgba(249,115,22,0.5),0_8px_26px_-2px_rgba(239,68,68,0.45)]'
                                  : 'border-line bg-canvas/60 shadow-2xs hover:border-line-hover'
                              }`}
                            >
                              {/* Tooltip flotante interactivo al pasar el mouse sobre la subsede asignada */}
                              {isAssigned && (
                                <div
                                  role="tooltip"
                                  className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-stone-900/95 px-3 py-1 text-[11px] font-semibold text-white shadow-xl ring-1 ring-orange-500/30 opacity-0 backdrop-blur-xs transition-all duration-200 group-hover/subcard:opacity-100 group-hover/subcard:-top-10 z-30 flex items-center gap-1.5"
                                >
                                  <span className="size-1.5 rounded-full bg-orange-500 animate-pulse" />
                                  <span>Este usuario ha sido asignado a esta sede</span>
                                  {/* Flecha inferior del tooltip */}
                                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900/95" />
                                </div>
                              )}

                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-bold text-ink text-xs truncate">
                                    {sub.name}
                                  </p>
                                  <p className="text-[11px] text-ink-muted mt-0.5">
                                    📍 {sub.address}
                                  </p>
                                </div>
                                <CatalogStatusBadge status={sub.status} />
                              </div>

                              {sub.phone && (
                                <div className="border-t border-line/40 pt-2 text-[11px] text-ink-muted flex items-center justify-between">
                                  <span>Teléfono:</span>
                                  <a
                                    href={`tel:${sub.phone}`}
                                    className="font-medium text-primary hover:underline"
                                  >
                                    {sub.phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-ink-muted">
                  No se encontró información para la sede seleccionada.
                </div>
              )}
            </div>

            {/* Pie de acción */}
            <div className="flex items-center justify-end border-t border-line/60 bg-canvas/50 px-6 py-4 sm:px-8">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-line bg-panel px-4 py-2 text-xs font-semibold text-ink hover:bg-line/30 transition cursor-pointer"
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
