import { useRef, useState } from 'react'
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { EscenaTipoCama } from '../../../cama3d/ui/organisms/escena-tipo-cama'
import { formatPrecioCOP, type BedItem3D } from '../../domain/reserva'
import { BedTypeBadge } from '../atoms/bed-type-badge'

export interface Bed3DDraggableCardProps {
  bed: BedItem3D
  index: number
  mouseX: MotionValue<number>
  isAssigned?: boolean
  onSelect?: (bed: BedItem3D) => void
}

export function Bed3DDraggableCard({
  bed,
  index,
  mouseX,
  isAssigned = false,
  onSelect,
}: Bed3DDraggableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // 1. useTransform: Distancia desde el centro de la card hacia la coordenada X del cursor
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = cardRef.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return val - bounds.x - bounds.width / 2
  })

  // 2. Mapea la distancia: si está a menos de 160px, escala fluidamente el ancho
  const widthSync = useTransform(distance, [-160, 0, 160], [130, 190, 130])

  // 3. useSpring: Rebote inercial suave
  const width = useSpring(widthSync, { mass: 0.1, stiffness: 160, damping: 14 })

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify(bed))
    e.dataTransfer.effectAllowed = 'copyMove'

    // Imagen transparente o fallback nativo
    if (e.dataTransfer.setDragImage && cardRef.current) {
      e.dataTransfer.setDragImage(cardRef.current, 60, 60)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ width }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.2) }}
      className="relative shrink-0 select-none"
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => onSelect?.(bed)}
        role="button"
        tabIndex={0}
        aria-label={`Arrastrar ${bed.roomName} ${bed.etiquette}`}
        title="Arrastra esta cama 3D a la zona del formulario para asignarla"
        className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-panel transition-all duration-200 cursor-grab active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-primary outline-none ${
          isAssigned
            ? 'border-primary ring-2 ring-primary/40 shadow-md bg-primary/[0.03]'
            : isDragging
              ? 'border-dashed border-primary opacity-60 scale-95'
              : 'border-line hover:border-primary/60 hover:shadow-lg'
        }`}
      >
        {/* Badge superior indicando que es arrastrable */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-2.5" aria-hidden="true">
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
          <span>Arrastrar</span>
        </div>

        {/* Viewport 3D de la cama */}
        <div className="relative h-28 w-full overflow-hidden bg-linear-to-b from-canvas via-canvas/90 to-panel pointer-events-none">
          <EscenaTipoCama
            name={bed.typeName}
            capacity={bed.capacity}
            staticModel
            className="size-full"
          />
        </div>

        {/* Información y metadata de la cama */}
        <div className="p-3 text-left space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="truncate text-xs font-bold text-ink">
              {bed.etiquette}
            </span>
            <BedTypeBadge typeName={bed.typeName} size="sm" />
          </div>

          <p className="truncate text-[11px] text-ink-muted">
            {bed.roomName} · Piso {bed.floorNumber || 1}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-line/60">
            <span className="text-[10px] text-ink-muted">
              Hasta {bed.capacity} pers.
            </span>
            <strong className="text-xs font-extrabold text-primary">
              {formatPrecioCOP(bed.pricePerNight)}
            </strong>
          </div>
        </div>

        {/* Chip si está asignada actualmente */}
        {isAssigned && (
          <div className="bg-primary py-0.5 text-center text-[10px] font-bold text-white tracking-wide uppercase">
            Asignada
          </div>
        )}
      </div>
    </motion.div>
  )
}
