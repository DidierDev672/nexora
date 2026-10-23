import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'motion/react'
import { slideIn } from '../../../../design-tokens/motion'

interface ReservasListaHeaderProps {
  onNuevaReserva?: () => void
}

export function ReservasListaHeader({ onNuevaReserva }: ReservasListaHeaderProps) {
  return (
    <motion.header
      variants={slideIn}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border border-line bg-panel px-6 py-8 shadow-xs sm:px-8 sm:py-10"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-linear-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Estadías · Vista general
          </p>
          <h1 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">
            Tus reservas y estadías activas
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            Consulta quiénes se hospedan hoy, revisa fechas y montos de cada habitación y mantén la
            disponibilidad de tu establecimiento bajo control en un solo vistazo.
          </p>
        </div>

        {onNuevaReserva && (
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={onNuevaReserva}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-hover active:scale-98 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <FontAwesomeIcon icon={faPlus} className="size-3.5" />
              <span>Registrar reserva</span>
            </button>
          </div>
        )}
      </div>
    </motion.header>
  )
}
