import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'

export interface TarifasHeaderProps {
  onRegistrarTarifas?: () => void
  isLoading?: boolean
}

export function TarifasHeader({ onRegistrarTarifas, isLoading = false }: TarifasHeaderProps = {}) {
  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-sm sm:px-10 sm:py-10"
    >
      {/* Gradiente decorativo sutil en armonía con el token primary */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent"
      />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          {/* Breadcrumb sicológico de orientación espacial */}
          <nav aria-label="Ruta de navegación" className="mb-3 flex items-center gap-2 text-xs text-ink-muted">
            <span className="hover:text-ink cursor-default transition-colors">Inicio</span>
            <span aria-hidden="true" className="text-ink-soft">/</span>
            <span className="hover:text-ink cursor-default transition-colors">Habitaciones & Tarifas</span>
            <span aria-hidden="true" className="text-ink-soft">/</span>
            <span className="font-semibold text-primary">Nueva Tarifa</span>
          </nav>

          {/* Badge de contexto */}
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Tarifas · Hospedaje y Estadías
          </p>

          {/* Título psicológico centrado en beneficio */}
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Tus tarifas de hospedaje
          </h1>

          {/* Subtítulo reductor de fricción y generador de control */}
          <p className="mt-2.5 text-sm leading-relaxed text-ink-muted sm:text-base">
            Configura precios claros, turnos flexibles y fechas de vigencia para que cada huésped disfrute
            de una reserva transparente, sin sorpresas ni confusiones en recepción.
          </p>
        </div>

        {onRegistrarTarifas && (
          <div className="shrink-0 pt-1 lg:pt-0">
            <button
              type="button"
              id="btn-registrar-tarifas-header"
              onClick={onRegistrarTarifas}
              disabled={isLoading}
              className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span>Registrar tarifas</span>
            </button>
          </div>
        )}
      </div>

      {/* Píldoras de tranquilidad psicológica (Psicología UX: da certeza de lo que ocurrirá) */}
      <div className="relative mt-6 flex flex-wrap items-center gap-2.5 pt-4 border-t border-line/60">
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-ink">
          <svg className="size-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Asignación por sede y sub-sede</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-ink">
          <svg className="size-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Modalidad horaria o por noche</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-ink">
          <svg className="size-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>Vigencia y calendario programado</span>
        </div>
      </div>
    </motion.header>
  )
}
