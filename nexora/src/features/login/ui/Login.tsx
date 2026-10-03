import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { fadeIn, fadeUp } from '../../../design-tokens/motion'
import { Input } from '../../../shared/ui/Input'
import { cn } from '../../../shared/lib/cn'
import { updateAuthUserFromLoginResponse } from '../../../shared/auth-storage'

const TOKEN_KEY = 'nexora.auth.token'

interface LoginProps {
  /** Se invoca al recibir el token, por si la app quiere redirigir o persistir más allá. */
  onSuccess?: (token: string) => void
  /** Se invoca al pulsar "Continuar a mi hotel", para navegar al dashboard. */
  onContinue?: () => void
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Login({ onSuccess, onContinue }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [welcomeEmail, setWelcomeEmail] = useState<string | null>(null)

  // Limpia el error de un campo en cuanto el usuario vuelve a escribir.
  const clearError = (field: 'email' | 'password') => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  // Valida campos vacíos y formato del correo.
  const validate = () => {
    const next: typeof errors = {}
    const value = email.trim()

    if (!value) {
      next.email = 'Escribe tu correo para continuar.'
    } else if (!EMAIL_PATTERN.test(value)) {
      next.email = 'Revisa el formato: usuario@correo.com'
    }

    if (!password) {
      next.password = 'Escribe tu contraseña.'
    }

    return next
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)
    if (nextErrors.email || nextErrors.password) return

    setLoading(true)
    setServerError(null)

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        password,
      })

      if (response.status === 200 || response.status === 201) {
        const token = (response.data?.token || response.data?.access_token || response.data?.data?.token) as string | undefined
        if (token) {
          localStorage.setItem(TOKEN_KEY, token)
          localStorage.setItem('auth_token', token)
          onSuccess?.(token)
        }

        // Actualizar la información auth_user en localStorage según la respuesta devuelta por la API REST
        updateAuthUserFromLoginResponse(response.data, email.trim(), token)

        setWelcomeEmail(email.trim())
      }
    } catch (error) {
      const status = isAxiosError(error) ? error.response?.status : undefined
      if (status === 400 || status === 401) {
        setServerError(
          'No pudimos reconocer esas credenciales. Revisa el correo y la contraseña, y vuelve a intentarlo.',
        )
      } else {
        setServerError(
          'Nexora no pudo conectarse en este momento. Revisa tu conexión y vuelve a intentarlo en un momento.',
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#2a1710] via-primary to-secondary px-4 py-12 sm:px-6">
      {/* Resplandor decorativo que suaviza el fondo y da profundidad. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 right-8 size-72 rounded-full bg-cream/10 blur-3xl"
      />

      <section aria-label="Inicio de sesión" className="w-full max-w-md">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8"
        >
          {welcomeEmail ? (
            <SuccessState
              email={welcomeEmail}
              onClose={() => setWelcomeEmail(null)}
              onContinue={onContinue}
            />
          ) : (
            <>
              <div className="text-center">
                <div className="relative mx-auto mb-5 flex size-20 items-center justify-center">
                  <span
                    aria-hidden="true"
                    className="absolute inset-2 rounded-full bg-primary/15 blur-xl"
                  />

                  <motion.span
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute -left-1 -top-2 text-primary/70"
                  >
                    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor">
                      <path d="M12 2l2.9 6.26 6.6.8-4.9 4.5 1.3 6.44L12 16.9 6.1 20l1.3-6.44L2.5 9.06l6.6-.8L12 2z" />
                    </svg>
                  </motion.span>

                  <motion.span
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                    className="absolute -right-1 top-4 text-secondary/70"
                  >
                    <svg viewBox="0 0 24 24" className="size-3" fill="currentColor">
                      <path d="M12 2l2.9 6.26 6.6.8-4.9 4.5 1.3 6.44L12 16.9 6.1 20l1.3-6.44L2.5 9.06l6.6-.8L12 2z" />
                    </svg>
                  </motion.span>

                  <motion.div
                    aria-hidden="true"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-8 text-cream"
                    >
                      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                    </svg>
                  </motion.div>
                </div>

                <h1 className="text-2xl font-bold text-ink">Tu hotel toma vida en Nexora</h1>
                <p className="mt-1 text-sm text-ink-muted">
                  Tu hotel ya te espera: entra y retoma el control de cada detalle con un solo clic.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <Input
                  label="Correo electrónico"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="tu@hotel.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    clearError('email')
                  }}
                  error={errors.email}
                  icon={
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
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  }
                />

                <Input
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    clearError('password')
                  }}
                  error={errors.password}
                  action={
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-pressed={showPassword}
                      className="flex size-8 items-center justify-center rounded-lg text-ink-soft outline-none transition-colors hover:bg-primary/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {showPassword ? (
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
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <path d="m1 1 22 22" />
                        </svg>
                      ) : (
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
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  }
                  icon={
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
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  }
                />

                {serverError && (
                  <motion.p
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    role="alert"
                    className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
                  >
                    {serverError}
                  </motion.p>
                )}

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  disabled={loading}
                  className={cn(
                    'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:pointer-events-none disabled:opacity-60',
                  )}
                >
                  {loading ? (
                    <>
                      <span
                        className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                        aria-hidden="true"
                      />
                      Verificando…
                    </>
                  ) : (
                    'Entrar'
                  )}
                </motion.button>
              </form>

              <p className="mt-4 text-center text-xs text-ink-soft">
                ¿No es tu equipo?{' '}
                <a href="#" className="font-medium text-primary hover:text-primary/80">
                  Restablece tu contraseña
                </a>
              </p>
            </>
          )}
        </motion.div>
      </section>

      {loading && (
        <motion.div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl border border-line bg-panel px-8 py-10 text-center shadow-xl"
          >
            <span className="relative flex size-14 items-center justify-center" aria-hidden="true">
              <span className="absolute inset-0 rounded-full bg-primary/10" />
              <span className="size-10 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary" />
            </span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-ink">Verificando tu acceso…</h3>
              <p className="text-sm text-ink-muted">
                Un momento: Nexora está preparando el escenario para ti.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </main>
  )
}

function SuccessState({
  email,
  onClose,
  onContinue,
}: {
  email: string
  onClose: () => void
  onContinue?: () => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-6 py-12 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-7"
          aria-hidden="true"
        >
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <path d="m9 11 3 3L22 4" />
        </svg>
      </span>
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-ink">¡Bienvenido de vuelta!</h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          Nexora acaba de encender las luces de tu hotel solo para ti. Tus huéspedes te esperan y
          hoy también va a ser un gran día para tu equipo.
        </p>
        <p className="text-xs font-medium text-ink-soft">{email}</p>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          Continuar a mi hotel
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onClose}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink-muted outline-none transition-colors hover:bg-primary/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Salir
        </motion.button>
      </div>
    </motion.div>
  )
}