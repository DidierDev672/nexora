import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '../atoms/button'
import { useTipoCamaDetalle } from '../../application/use-tipo-cama-detalle'

export interface TipoCamaDetalleModalProps {
  bedId: string | null
  bedSummary?: {
    name: string
    capacityPeople?: number
  }
  linkedRoom?: {
    number: string
    floor: number | string
  }
  isOpen: boolean
  onClose: () => void
}

export function TipoCamaDetalleModal({
  bedId,
  bedSummary,
  linkedRoom,
  isOpen,
  onClose,
}: TipoCamaDetalleModalProps) {
  const { loading, data, errorType, retry } = useTipoCamaDetalle({
    bedId,
    isOpen,
  })

  // Cierra al presionar la tecla Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Bloqueo de scroll en el body mientras el modal esté abierto
  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  const displayName = data?.name || bedSummary?.name || 'Tipo de Cama'
  const displayCapacity = data?.capacity_people ?? bedSummary?.capacityPeople ?? 1

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-tipo-cama-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo con desenfoque (Backdrop) */}
          <motion.div
            key="backdrop-tipo-cama"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta de Contenido con física Spring */}
          <motion.div
            key="modal-tipo-cama-content"
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
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-line bg-panel p-6 shadow-2xl transition-all sm:p-7"
          >
            {/* Tirador táctil para dispositivos móviles */}
            <div className="mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full bg-line/80 sm:hidden" />

            {/* Cabecera Superior: Habitación vinculada y Botón Cerrar */}
            <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M2 4v16" />
                    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                    <path d="M2 17h20" />
                    <path d="M6 8v9" />
                  </svg>
                  {linkedRoom ? (
                    <span>
                      Habitación <strong>{linkedRoom.number}</strong> · Piso {linkedRoom.floor}
                    </span>
                  ) : (
                    <span>Detalle de Cama</span>
                  )}
                </span>

                {loading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                    <span className="inline-block size-3 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                    <span>Consultando…</span>
                  </span>
                )}
              </div>

              {/* Botón Cerrar (X) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="grid size-9 shrink-0 place-items-center rounded-xl border border-line text-ink-muted hover:border-primary/40 hover:bg-canvas hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4.5"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* CUERPO DEL MODAL SEGÚN ESTADO */}
            {loading ? (
              /* 1. Estado Cargando con Skeleton Shimmer */
              <div className="mt-6 space-y-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="size-13 rounded-2xl bg-line/60" />
                  <div className="space-y-2 flex-1">
                    <div className="h-5 w-40 rounded bg-line/60" />
                    <div className="h-3 w-56 rounded bg-line/40" />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="h-20 w-full rounded-2xl bg-line/40" />
                  <div className="h-20 w-full rounded-2xl bg-line/40" />
                  <div className="h-24 w-full rounded-2xl bg-line/40" />
                </div>

                <div className="text-center py-2">
                  <p className="text-xs text-ink-muted">
                    Recopilando la información del tipo de cama…
                  </p>
                </div>
              </div>
            ) : errorType === 'server_error' ? (
              /* 2. Estado Error 500: Mensaje Psicológico y Amigable */
              <div className="mt-6 space-y-5 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                    Inconveniente temporal en el servidor
                  </span>
                  <h3
                    id="modal-tipo-cama-title"
                    className="text-lg font-bold text-ink"
                  >
                    Tuvimos un contratiempo en el servidor
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-muted max-w-md mx-auto">
                    No es tu culpa: se presentó un inconveniente de conexión con el servidor al consultar este tipo de cama.
                    Tus habitaciones y registros están completamente a salvo. Danos unos instantes y vuelve a intentar.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={retry}
                    className="w-full sm:w-auto"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                    Reintentar consulta
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Cerrar por ahora
                  </Button>
                </div>
              </div>
            ) : errorType === 'empty' || !data ? (
              /* 3. Estado Vacío / No registrado (Status 200 sin datos o no encontrada): Mensaje Psicológico */
              <div className="mt-6 space-y-5 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-xs">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8"
                    aria-hidden="true"
                  >
                    <path d="M2 4v16" />
                    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                    <path d="M2 17h20" />
                    <path d="M6 8v9" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    Registro de cama pendiente
                  </span>
                  <h3
                    id="modal-tipo-cama-title"
                    className="text-lg font-bold text-ink"
                  >
                    No se encuentran tipos de cama registradas en el sistema
                  </h3>
                  <p className="text-xs leading-relaxed text-ink-muted max-w-md mx-auto">
                    Actualmente no encontramos un tipo de cama asignado o registrado en el sistema para esta habitación.
                    No te preocupes: tu habitación sigue disponible y tu información está en orden.
                    Esto ocurre usualmente cuando el registro es nuevo o está pendiente de configurarse en el catálogo.
                  </p>
                </div>

                {/* Nota de guía constructiva */}
                <div className="rounded-2xl border border-line/60 bg-canvas/70 p-3.5 text-left text-xs text-ink-muted flex items-start gap-2.5">
                  <span className="text-base select-none">💡</span>
                  <p className="leading-relaxed">
                    Puedes vincular o registrar un tipo de cama en cualquier momento desde el módulo de camas para enriquecer la experiencia de tus huéspedes.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Entendido, cerrar
                  </Button>
                </div>
              </div>
            ) : (
              /* 4. Estado Exitoso (200 con JSON/Object): Visualización de los 3 items pedidos */
              <div className="mt-5 space-y-5">
                {/* Hero / Encabezado del Tipo de Cama */}
                <div className="flex items-start gap-4">
                  <span className="grid size-13 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary shadow-xs">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-7"
                      aria-hidden="true"
                    >
                      <path d="M2 4v16" />
                      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                      <path d="M2 17h20" />
                      <path d="M6 8v9" />
                    </svg>
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Tipo de cama activo
                      </span>
                    </div>

                    <h2
                      id="modal-tipo-cama-title"
                      className="mt-1 text-2xl font-black text-ink tracking-tight truncate"
                    >
                      {displayName}
                    </h2>

                    <p className="text-xs text-ink-muted">
                      Configuración de descanso asignada a esta habitación
                    </p>
                  </div>
                </div>

                {/* LOS 3 ITEMS REQUERIDOS: Name, Capacidad para personas, Descripción */}
                <div className="space-y-3 pt-1">
                  {/* ITEM 1: Name (Nombre del tipo de cama) */}
                  <div className="rounded-2xl border border-line bg-canvas/70 p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                      1. Nombre del tipo de cama
                    </span>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="text-base font-extrabold text-ink">
                        {data.name}
                      </span>
                      <span className="rounded-xl border border-line bg-panel px-2.5 py-1 text-xs font-semibold text-primary shadow-2xs">
                        {data.name}
                      </span>
                    </div>
                  </div>

                  {/* ITEM 2: Capacidad para personas */}
                  <div className="rounded-2xl border border-line bg-canvas/70 p-4 shadow-2xs">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                      2. Capacidad para personas
                    </span>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary">
                        {displayCapacity}
                      </span>
                      <span className="text-sm font-semibold text-ink">
                        {displayCapacity === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                      {displayCapacity === 1
                        ? 'Diseñada y optimizada para el hospedaje individual de 1 huésped.'
                        : `Diseñada con dimensiones adecuadas para alojar cómodamente a ${displayCapacity} huéspedes.`}
                    </p>
                  </div>

                  {/* ITEM 3: Descripción */}
                  <div className="rounded-2xl border border-line bg-canvas/70 p-4 shadow-2xs space-y-1.5">
                    <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider block">
                      3. Descripción
                    </span>
                    <div className="rounded-xl border border-line/50 bg-panel/80 p-3.5">
                      <p className="text-xs leading-relaxed text-ink-soft whitespace-pre-wrap">
                        {data.description || 'Sin descripción detallada por el momento.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Metadatos adicionales de auditoría si están presentes */}
                {(data.created_by || data.created_at) && (
                  <div className="border-t border-line/60 pt-3 text-[11px] text-ink-muted flex flex-col gap-1">
                    {data.created_by && (
                      <div className="flex items-center justify-between">
                        <span>Registrado por:</span>
                        <span className="font-medium text-ink truncate max-w-[200px]" title={data.created_by}>
                          {data.created_by}
                        </span>
                      </div>
                    )}
                    {data.created_at && (
                      <div className="flex items-center justify-between">
                        <span>Fecha de creación:</span>
                        <span className="font-medium text-ink">
                          {new Date(data.created_at).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Botón de Cierre */}
                <div className="mt-6 flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={onClose}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
