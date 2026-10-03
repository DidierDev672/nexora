import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'
import type { HabitacionesViewMode } from './habitaciones-view-mode-toggle'

interface HabitacionesHeaderProps {
  activeTab?: 'lista' | 'registro'
  onTabChange?: (tab: 'lista' | 'registro') => void
  viewMode?: HabitacionesViewMode
  onViewModeChange?: (mode: HabitacionesViewMode) => void
}

export function HabitacionesHeader({
  activeTab = 'lista',
  onTabChange,
}: HabitacionesHeaderProps) {
  const isLista = activeTab === 'lista'

  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-sm sm:px-10 sm:py-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {isLista
              ? 'Habitaciones · Catálogo e inventario'
              : 'Habitaciones · Registro'}
          </p>

          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl lg:text-4xl">
            {isLista
              ? 'Inventario y disponibilidad de habitaciones'
              : 'Una nueva habitación, lista para reservar'}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {isLista
              ? 'Explora todas las habitaciones en tiempo real con scroll infinito, detalles enriquecidos de edificios y camas, filtros instantáneos y control de estados.'
              : 'Ubica tu nueva habitación: número, piso y a qué edificio pertenece. En un paso queda lista dentro de tu inventario comercial.'}
          </p>
        </div>
          {onTabChange && (
            <div className="flex shrink-0 items-center rounded-xl border border-line bg-canvas/80 p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => onTabChange('lista')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  isLista
                    ? 'bg-panel text-primary shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                  <path d="M3 15h18" />
                  <path d="M9 3v18" />
                </svg>
                <span>Inventario</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('registro')}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
                  !isLista
                    ? 'bg-panel text-primary shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span>Registrar</span>
              </button>
            </div>
          )}
      </div>
    </motion.header>
  )
}
