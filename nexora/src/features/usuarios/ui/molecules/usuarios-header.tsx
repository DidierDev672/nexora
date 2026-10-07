import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'

export interface UsuariosHeaderProps {
  badgeText?: string
  title?: string
  subtitle?: string
  onNewUser?: () => void
}

/**
 * Cabecera institucional para el módulo de Gestión y Directorio de Usuarios.
 */
export function UsuariosHeader({
  badgeText = 'Equipo · Directorio de Usuarios',
  title = 'Gestión y directorio de usuarios',
  subtitle = 'Supervisa al personal de tu organización hotelera, gestiona roles y sedes asignadas con visualización adaptativa en tarjetas o tabla.',
  onNewUser,
}: UsuariosHeaderProps) {
  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-xs sm:px-10 sm:py-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
      />
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            {badgeText}
          </p>
          <h1 className="mt-3 text-2xl font-black text-ink sm:text-3xl lg:text-4xl tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        </div>

        {onNewUser && (
          <div className="shrink-0">
            <button
              type="button"
              onClick={onNewUser}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:opacity-90 active:scale-98 transition-all cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Registrar usuario</span>
            </button>
          </div>
        )}
      </div>
    </motion.header>
  )
}