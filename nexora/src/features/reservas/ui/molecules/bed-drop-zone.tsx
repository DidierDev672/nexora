import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { EscenaTipoCama } from '../../../cama3d/ui/organisms/escena-tipo-cama'
import { formatPrecioCOP, type BedItem3D } from '../../domain/reserva'
import { BedTypeBadge } from '../atoms/bed-type-badge'
import { DropZoneIndicator } from '../atoms/drop-zone-indicator'

export interface BedDropZoneProps {
  assignedBed: BedItem3D | null
  onBedDropped: (bed: BedItem3D) => void
  onRemoveBed: () => void
  error?: string
  className?: string
}

export function BedDropZone({
  assignedBed,
  onBedDropped,
  onRemoveBed,
  error,
  className = '',
}: BedDropZoneProps) {
  const [isOver, setIsOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    if (!isOver) setIsOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Evita falsos disparos si el mouse pasa por encima de un elemento hijo
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)

    try {
      const rawData = e.dataTransfer.getData('application/json')
      if (rawData) {
        const bed = JSON.parse(rawData) as BedItem3D
        if (bed && bed.bedId) {
          onBedDropped(bed)
        }
      }
    } catch {
      // Ignora transferencias no estructuradas
    }
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-ink">
          Cama y Habitación Asignada <span className="text-danger">*</span>
        </label>
        {assignedBed && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            ✓ Cama 3D vinculada
          </span>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl transition-all duration-200 ${
          assignedBed
            ? 'border border-primary/30 bg-panel shadow-xs'
            : isOver
              ? 'border-2 border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]'
              : error
                ? 'border-2 border-dashed border-danger/60 bg-danger/5'
                : 'border-2 border-dashed border-line bg-canvas/60 hover:border-primary/50 hover:bg-canvas'
        }`}
      >
        <AnimatePresence mode="wait">
          {assignedBed ? (
            /* ESTADO 3: Cama Asignada (Slotted) */
            <motion.div
              key="slotted"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="p-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* Visualizador 3D interactivo en vivo de la cama soltada */}
                <div className="md:col-span-5 h-44 w-full overflow-hidden rounded-xl border border-line bg-linear-to-b from-canvas via-canvas/90 to-panel shadow-inner relative">
                  <EscenaTipoCama
                    name={assignedBed.typeName}
                    capacity={assignedBed.capacity}
                    staticModel={false}
                    className="size-full"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-xs select-none">
                    <span>Gira con el mouse para inspeccionar</span>
                  </div>
                </div>

                {/* Especificaciones y confirmación de la cama */}
                <div className="md:col-span-7 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Cama fijada a tu reserva
                    </span>
                    <BedTypeBadge typeName={assignedBed.typeName} size="sm" />
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-ink">
                      {assignedBed.roomName}
                    </h4>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {assignedBed.etiquette} · Piso {assignedBed.floorNumber || 1}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-muted pt-2 border-t border-line/60">
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-ink-muted">Aforo máx.</span>
                      <strong className="text-ink font-bold">{assignedBed.capacity} {assignedBed.capacity === 1 ? 'persona' : 'personas'}</strong>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-semibold text-ink-muted">Tarifa por noche</span>
                      <strong className="text-primary font-bold text-sm">{formatPrecioCOP(assignedBed.pricePerNight)}</strong>
                    </div>
                  </div>

                  {/* Acciones para cambiar o retirar */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={onRemoveBed}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-canvas/80 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-black/5 hover:text-danger dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                      <span>Cambiar o retirar cama</span>
                    </button>
                    <span className="text-[11px] text-ink-muted">
                      (o suelta otra cama para reemplazarla)
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ESTADOS 1 Y 2: En Espera (Idle) y Sobrevolando (DragOver) */
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center p-8 sm:p-10 text-center select-none"
            >
              <DropZoneIndicator isOver={isOver} />

              <div className="mt-4 max-w-md space-y-1">
                <h4 className="text-base font-bold text-ink">
                  {isOver
                    ? '¡Suelta aquí para fijar esta cama a tu reserva!'
                    : 'Zona de Asignación: Arrastra tu cama 3D aquí'}
                </h4>
                <p className="text-xs leading-relaxed text-ink-muted">
                  {isOver
                    ? 'Libera el botón del mouse para confirmar y sincronizar aforo y tarifas.'
                    : 'Explora las opciones de confort en la barra de navegación 3D superior y arrastra la cama deseada hacia esta caja.'}
                </p>
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span>🎯 Suelta la cama elegida aquí</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
