import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { useSedeDetalle } from '../../application/use-sede-detalle'

export interface SedeDetalleModalProps {
  sedeId: string | null
  onClose: () => void
}

export function SedeDetalleModal({ sedeId, onClose }: SedeDetalleModalProps) {
  const { loading, error, sede, subSedes, edificios } = useSedeDetalle(sedeId)

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!sedeId) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sede-modal-title"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        />

        {/* Ventana Modal */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8"
        >
          {/* Botón de Cierre */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de sede"
            className="absolute top-5 right-5 grid size-9 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <span className="size-8 animate-spin rounded-full border-3 border-primary/20 border-t-primary" />
              <p className="text-xs text-ink-muted">Cargando información y subsedes…</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-center text-sm text-danger">
              {error}
            </div>
          ) : sede ? (
            <div className="space-y-6">
              {/* Encabezado de la Sede */}
              <div className="border-b border-line/60 pb-4 pr-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Sede de la red hotelera
                </span>
                <h2 id="sede-modal-title" className="mt-2 text-2xl font-bold text-ink">
                  {sede.name}
                </h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {sede.city} · {sede.address}
                </p>

                {sede.phone && (
                  <p className="mt-2 text-xs">
                    <span className="text-ink-soft">Teléfono: </span>
                    <a
                      href={`tel:${sede.phone}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {sede.phone}
                    </a>
                  </p>
                )}
              </div>

              {/* Sub-Sedes Vinculadas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                    Sub-Sedes vinculadas ({subSedes.length})
                  </h3>
                  <span className="text-xs text-ink-soft">Puntos de atención satélite</span>
                </div>

                {subSedes.length === 0 ? (
                  <div className="rounded-xl border border-line/60 bg-canvas p-4 text-center text-xs text-ink-muted">
                    Esta sede opera como punto único central sin subsedes registradas.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {subSedes.map((sub) => (
                      <div
                        key={sub.id || sub.name}
                        className="rounded-xl border border-line bg-canvas p-3.5 space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-ink">{sub.name}</p>
                          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                            {sub.status}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted">{sub.address}</p>
                        {sub.phone && (
                          <p className="text-xs text-ink-soft">Tel: {sub.phone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edificios y Torres en la Sede */}
              <div className="space-y-3 border-t border-line/60 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-ink">
                    Edificios y Torres en esta Sede ({edificios.length})
                  </h3>
                  <span className="text-xs text-ink-soft">Infraestructura habitacional</span>
                </div>

                {edificios.length === 0 ? (
                  <div className="rounded-xl border border-line/60 bg-canvas p-4 text-center text-xs text-ink-muted">
                    No hay torres o edificios asociados directamente a esta sede.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {edificios.map((b) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-canvas p-3.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                              <rect width="16" height="20" x="4" y="2" rx="2" />
                              <path d="M9 22v-4h6v4" />
                            </svg>
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-ink">{b.name}</p>
                            <p className="text-xs text-ink-muted">{b.floor_number ?? 5} pisos operativos</p>
                          </div>
                        </div>

                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {b.status || 'Activo'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
