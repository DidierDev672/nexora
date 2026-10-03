import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'

export interface LogoutGoodbyeModalProps {
  /** Nombre del usuario para personalizar el mensaje de despedida. */
  userName?: string
  /** Se ejecuta al terminar el temporizador o al pulsar el botón para volver al login. */
  onComplete: () => void
  /** Duración en segundos antes de redirigir automáticamente (por defecto 4). */
  durationSeconds?: number
}

/**
 * Modal de despedida psicológica ("chulo") al cerrar sesión en Nexora:
 * - Refuerza la satisfacción del deber cumplido y el valor del trabajo en el hotel.
 * - Brinda paz mental y seguridad confirmando que los datos de auth_user se borraron del navegador.
 * - Invita al descanso, desconexión y bienestar personal.
 * - Cuenta con barra de progreso animada y redirección fluida al login.
 */
export function LogoutGoodbyeModal({
  userName,
  onComplete,
  durationSeconds = 4,
}: LogoutGoodbyeModalProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds)

  // Extraer el primer nombre para una cercanía más cálida y empática
  const displayName = userName?.trim() ? userName.trim().split(/\s+/)[0] : 'colega'

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, onComplete])

  const modalContent = (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      >
        {/* Telón de fondo con desenfoque de cristal y tonalidad cálida */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-[#160c08]/75 backdrop-blur-md"
        />

        {/* Tarjeta modal con psicología de cierre de sesión */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative my-auto w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-panel p-6 text-center shadow-2xl sm:p-8"
        >
          {/* Resplandor decorativo de ambiente relajante */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 size-60 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-amber-500/10 blur-3xl"
          />

          {/* Insignia animada con icono de hotel / llave segura / descanso */}
          <div className="relative mx-auto mb-5 flex size-20 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-1 rounded-full bg-gradient-to-tr from-primary to-amber-500 opacity-20 blur-xl"
            />

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-cream shadow-lg shadow-primary/25"
            >
              {/* Icono de llave descansando y estrellas de satisfacción */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-8"
                aria-hidden="true"
              >
                <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5zm-3 8V7a3 3 0 0 1 6 0v3H9z" />
                <circle cx="12" cy="16" r="1.5" fill="currentColor" />
              </svg>
            </motion.div>

            {/* Estrellas decorativas de brillo */}
            <motion.span
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: [0, 1.2, 1], rotate: [0, 15, 0] }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="absolute -right-1 -top-1 text-amber-400"
              aria-hidden="true"
            >
              ✨
            </motion.span>
          </div>

          {/* Etiqueta de estado seguro */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Sesión cerrada con éxito
          </span>

          {/* Título principal personalizado */}
          <h2 id="logout-title" className="mt-3 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            ¡Hasta pronto, {displayName}!
          </h2>

          {/* Mensaje con psicología de bienestar, reconocimiento y paz mental */}
          <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
            Detrás de cada huésped feliz y cada habitación impecable, está tu compromiso.
            Hoy tu esfuerzo volvió a marcar la diferencia en Nexora.
          </p>

          <p className="mt-2 text-xs leading-relaxed text-ink-soft sm:text-sm">
            Tus datos, tarifas y reservaciones han quedado guardados con seguridad total.
            Tómate un respiro, desconéctate y disfruta tu tiempo libre: nosotros cuidamos de tu hotel
            mientras tú descansas.
          </p>

          {/* Micro-tarjetas de tranquilidad */}
          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-line bg-canvas/40 p-2.5 transition-colors">
              <span className="block text-base">🛡️</span>
              <span className="mt-1 block text-xs font-semibold text-ink">Privacidad total</span>
              <span className="block text-[11px] text-ink-soft">
                <code className="rounded bg-primary/10 px-1 font-mono text-[10px] text-primary">auth_user</code> eliminado del equipo.
              </span>
            </div>

            <div className="rounded-xl border border-line bg-canvas/40 p-2.5 transition-colors">
              <span className="block text-base">🏨</span>
              <span className="mt-1 block text-xs font-semibold text-ink">Hotel respaldado</span>
              <span className="block text-[11px] text-ink-soft">
                Tus operaciones quedan sincronizadas en la nube.
              </span>
            </div>

            <div className="rounded-xl border border-line bg-canvas/40 p-2.5 transition-colors">
              <span className="block text-base">☕</span>
              <span className="mt-1 block text-xs font-semibold text-ink">Modo descanso</span>
              <span className="block text-[11px] text-ink-soft">
                Tu turno está listo para cuando decidas regresar.
              </span>
            </div>
          </div>

          {/* Barra de progreso de redirección automática */}
          <div className="mt-6 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Volviendo a la pantalla de acceso…</span>
              <span className="font-semibold text-primary">{timeLeft}s</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: durationSeconds, ease: 'linear' }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
              />
            </div>
          </div>

          {/* Botón de acción para volver de inmediato */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onComplete}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto"
            >
              <span>Volver al inicio de sesión ahora</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden="true"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  if (typeof document === 'undefined') {
    return modalContent
  }

  return createPortal(modalContent, document.body)
}
