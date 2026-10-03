import { useEffect, useRef } from 'react'
import { motion, useMotionValue } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import type { BedItem3D } from '../../domain/reserva'
import { Bed3DDraggableCard } from './bed-3d-draggable-card'

export interface Bed3DDockBarProps {
  beds: BedItem3D[]
  assignedBedId?: string
  loading?: boolean
  error?: string | null
  onBedSelect?: (bed: BedItem3D) => void
  onRetry?: () => void
  className?: string
}

export function Bed3DDockBar({
  beds,
  assignedBedId,
  loading = false,
  error,
  onBedSelect,
  onRetry,
  className = '',
}: Bed3DDockBarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. useMotionValue: Almacena la coordenada X del cursor sin re-renders en React
  const mouseX = useMotionValue(Infinity)

  // Desplazamiento horizontal con la rueda del ratón
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY !== 0 && event.deltaX === 0) {
        event.preventDefault()
        container.scrollLeft += event.deltaY
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [beds])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -260 : 260
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Barra de navegación de camas en 3D"
      className={`space-y-3 ${className}`}
    >
      {/* Encabezado descriptivo */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-primary/10 text-primary text-xs">
              ✨
            </span>
            <h2 className="text-base font-bold text-ink">
              Barra de Navegación 3D · Selección de Camas
            </h2>
          </div>
          <p className="text-xs text-ink-muted mt-0.5">
            Desliza el cursor para magnificar y <strong>arrastra tu cama 3D favorita</strong> hacia el formulario para asignarla.
          </p>
        </div>

        {beds.length > 0 && !loading && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary sm:self-auto select-none">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            {beds.length} {beds.length === 1 ? 'cama disponible' : 'camas disponibles'}
          </span>
        )}
      </div>

      {/* Contenedor tipo dock con borde y scroll suave */}
      <div className="relative rounded-2xl border border-line bg-panel/80 backdrop-blur-xs p-4 shadow-xs">
        {/* Estado de carga */}
        {loading && (
          <div className="flex items-center gap-3 overflow-hidden py-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-44 w-36 shrink-0 animate-pulse rounded-2xl bg-black/5 dark:bg-white/5"
              />
            ))}
          </div>
        )}

        {/* Estado de error */}
        {!loading && error && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-800 dark:text-amber-300">
            <p>{error}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="shrink-0 font-semibold underline hover:no-underline"
              >
                Reintentar
              </button>
            )}
          </div>
        )}

        {/* Lista interactiva con dock magnification */}
        {!loading && beds.length > 0 && (
          <div className="group/dock relative">
            {/* Flecha izquierda */}
            <button
              type="button"
              onClick={() => scroll('left')}
              aria-label="Desplazar camas hacia la izquierda"
              className="absolute -left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-line bg-panel/95 p-2 text-ink-muted shadow-md backdrop-blur-xs transition hover:bg-panel hover:text-ink focus-visible:ring-2 focus-visible:ring-primary opacity-0 group-hover/dock:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            {/* Contenedor de scroll con captura de posición X del mouse */}
            <div
              ref={scrollContainerRef}
              onMouseMove={(e) => mouseX.set(e.clientX)}
              onMouseLeave={() => mouseX.set(Infinity)}
              className="flex min-h-[190px] items-end gap-3.5 overflow-x-auto py-2 px-1 scroll-smooth scrollbar-thin scrollbar-track-transparent scrollbar-thumb-line"
              role="listbox"
              aria-label="Catálogo de camas 3D magnificadas"
            >
              {beds.map((bed, index) => (
                <Bed3DDraggableCard
                  key={bed.bedId}
                  bed={bed}
                  index={index}
                  mouseX={mouseX}
                  isAssigned={assignedBedId === bed.bedId}
                  onSelect={onBedSelect}
                />
              ))}
            </div>

            {/* Flecha derecha */}
            <button
              type="button"
              onClick={() => scroll('right')}
              aria-label="Desplazar camas hacia la derecha"
              className="absolute -right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-line bg-panel/95 p-2 text-ink-muted shadow-md backdrop-blur-xs transition hover:bg-panel hover:text-ink focus-visible:ring-2 focus-visible:ring-primary opacity-0 group-hover/dock:opacity-100"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-3.5" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </motion.section>
  )
}
