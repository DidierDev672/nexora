import { useEffect } from 'react'
import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'
import type { RoomRow } from '../../domain/habitacion-lista'
import { HabitacionStatusBadge } from './habitacion-status-badge'

export interface AsignarHuespedHeaderProps {
  room: RoomRow
  onBack: () => void
  onClose?: () => void
}

/**
 * Encabezado de la página de Asignación de Huésped
 * Diseñado bajo las directrices de agent.md:
 * - Copywriting psicológico (beneficio para el usuario y reducción de fricción)
 * - Efecto de entrada slide-in con variantes centralizadas
 * - Indicadores contextuales de ubicación claros para el usuario
 * - Botón de cierre visible y accesible con soporte para la tecla Escape
 */
export function AsignarHuespedHeader({ room, onBack, onClose }: AsignarHuespedHeaderProps) {
  // Soporte de tecla Escape para cerrar o volver
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        if (onClose) {
          onClose()
        } else {
          onBack()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [onClose, onBack])

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClose) {
      onClose()
    } else {
      onBack()
    }
  }

  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-sm sm:px-10 sm:py-9"
    >
      {/* Resplandor sutil decorativo de fondo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-3.5">
          {/* Miga de pan / Indicador contextual de ubicación */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onBack()
              }}
              className="group/back inline-flex items-center gap-1.5 rounded-full border border-line bg-canvas/80 px-3 py-1 text-xs font-semibold text-ink-muted transition-all hover:border-primary/40 hover:bg-panel hover:text-primary cursor-pointer shadow-2xs"
              title="Volver a la lista de habitaciones"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3.5 transition-transform group-hover/back:-translate-x-0.5 pointer-events-none"
                aria-hidden="true"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              <span>Habitaciones</span>
            </button>

            <span className="text-line-strong select-none">/</span>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3 pointer-events-none"
                aria-hidden="true"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Asignar Huésped</span>
            </span>
          </div>

          {/* Título psicológico centrado en beneficio */}
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl lg:text-4xl">
            Asigna un huésped a la Habitación{' '}
            <span className="text-primary font-black">{room.number}</span>
          </h1>

          {/* Subtítulo psicológico que reduce fricción y da tranquilidad */}
          <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
            Vincula al huésped titular para preparar su llegada, registrar los acompañantes y dejar su estancia lista con total seguridad.
          </p>

          {/* Ubicación detallada de la habitación seleccionada */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1.5 text-xs font-medium text-ink-muted">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/70 px-2.5 py-1 text-ink shadow-2xs">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5 text-primary pointer-events-none"
                aria-hidden="true"
              >
                <path d="M3 21h18" />
                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              </svg>
              <span>{room.building.name || 'Edificio principal'} · Piso {room.floor}</span>
            </span>

            {room.bed.name && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas/70 px-2.5 py-1 text-ink shadow-2xs">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-3.5 text-secondary pointer-events-none"
                  aria-hidden="true"
                >
                  <path d="M2 4v16" />
                  <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                  <path d="M2 17h20" />
                  <path d="M6 8v9" />
                </svg>
                <span>{room.bed.name}</span>
              </span>
            )}

            <HabitacionStatusBadge status={room.status} />
          </div>
        </div>

        {/* Acciones del encabezado: Botón de cambio de habitación y botón de cerrar */}
        <div className="flex shrink-0 items-center gap-2 self-start lg:self-center pr-8 lg:pr-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onBack()
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-canvas/80 px-4 py-2.5 text-xs font-semibold text-ink shadow-2xs transition-all hover:border-primary/40 hover:bg-panel hover:text-primary active:scale-95"
            title="Volver al catálogo para elegir otra habitación"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 pointer-events-none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span>Cambiar de habitación</span>
          </button>
        </div>
      </div>

      {/* Botón flotante para cerrar en esquina superior derecha con z-30 */}
      <button
        type="button"
        onClick={handleClose}
        className="absolute top-4 right-4 z-30 grid size-8.5 place-items-center rounded-full border border-line bg-canvas/90 text-ink-muted transition-all hover:border-primary/40 hover:bg-panel hover:text-ink hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer shadow-2xs"
        title="Cerrar (Esc)"
        aria-label="Cerrar modal"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4 pointer-events-none"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </motion.header>
  )
}
