import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'

export interface PersonasHeaderProps {
  badgeText?: string
  title?: string
  subtitle?: string
  onNewPersona?: () => void
  isRegisterTab?: boolean
  onBackToDirectory?: () => void
}

/**
 * Cabecera principal del módulo de personas.
 * Cumple con la Regla 1 de agent.md:
 * - Variantes motion slideIn.
 * - Copywriting psicológico: enfocado en beneficio del usuario y reducción de fricción.
 */
export function PersonasHeader({
  badgeText = 'Directorio · Personas Registradas',
  title = 'Directorio y gestión de personas',
  subtitle = 'Visualiza, busca y gestiona la información de contacto, documentos de identidad y roles de las personas registradas en el sistema hotelero.',
  onNewPersona,
  isRegisterTab,
  onBackToDirectory,
}: PersonasHeaderProps) {
  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-3xl border border-line bg-panel px-6 py-8 shadow-xs sm:px-10 sm:py-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
      />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            {badgeText}
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-ink tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        </div>

        {/* Acciones de la cabecera */}
        <div className="flex items-center gap-3 shrink-0">
          {isRegisterTab ? (
            onBackToDirectory && (
              <button
                type="button"
                onClick={onBackToDirectory}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-line bg-canvas text-ink text-xs font-semibold hover:bg-line/40 transition cursor-pointer shadow-2xs"
              >
                ← Volver al directorio
              </button>
            )
          ) : (
            onNewPersona && (
              <button
                type="button"
                onClick={onNewPersona}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-secondary text-cream text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                  aria-hidden="true"
                >
                  <line x1="10" y1="4" x2="10" y2="16" />
                  <line x1="4" y1="10" x2="16" y2="10" />
                </svg>
                <span>Nueva persona</span>
              </button>
            )
          )}
        </div>
      </div>
    </motion.header>
  )
}
