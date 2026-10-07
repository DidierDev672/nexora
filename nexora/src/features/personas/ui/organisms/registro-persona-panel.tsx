import { useState } from 'react'
import { motion } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { api } from '../../../../lib/api'
import { PersonaRegistroForm } from '../molecules/persona-registro-form'
import { Button } from '../../../recursos/ui/atoms/button'
import { toPersonaPayload, type Persona, type PersonaInput } from '../../domain/persona'

export interface RegistroPersonaPanelProps {
  onBackToDirectory?: () => void
  onSuccess?: () => void
}

export function RegistroPersonaPanel({ onBackToDirectory, onSuccess }: RegistroPersonaPanelProps = {}) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successPersona, setSuccessPersona] = useState<Persona | null>(null)

  const handleSubmit = async (values: PersonaInput) => {
    setSubmitting(true)
    setSubmitError(null)

    try {
      const payload = toPersonaPayload(values)

      const response = await api.post('/persons', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      })

      if (response.status === 201) {
        const data = response.data as Partial<Persona> | undefined
        const nuevaPersona: Persona = {
          id: data?.id ?? (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `persona-${Date.now()}`),
          tipoDocumento: values.tipoDocumento as Persona['tipoDocumento'],
          numeroDocumento: values.numeroDocumento,
          nombre: values.nombre,
          name: values.name ?? values.nombre,
          telefono: values.telefono,
          email: values.email,
          roles: values.roles ?? [],
          creadoEn: data?.creadoEn ?? new Date().toISOString(),
        }

        setSuccessPersona(nuevaPersona)
        onSuccess?.()
      } else {
        setSubmitError(
          'No pudimos completar el registro de la persona en este momento. La información que ingresaste sigue intacta en el formulario; por favor verifica los datos o intenta nuevamente.',
        )
      }
    } catch {
      setSubmitError(
        'Tus datos ingresados están a salvo, pero no pudimos conectar con el servidor en este momento. Por favor verifica tu conexión y prueba nuevamente.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSuccessPersona(null)
    setSubmitError(null)
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Formulario de registro de persona"
      className="mt-8"
    >
      <div className="rounded-2xl border border-line bg-panel p-6 shadow-sm sm:p-8">
        {successPersona ? (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-6 py-10 text-center"
          >
            <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-7"
                aria-hidden="true"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </span>

            <div className="space-y-1.5 max-w-md">
              <h3 className="text-xl font-bold text-ink">¡Registro completado con éxito!</h3>
              <p className="text-sm leading-relaxed text-ink-muted">
                {successPersona.nombre ? (
                  <>
                    <strong className="text-ink">{successPersona.nombre}</strong> con documento{' '}
                    <strong className="text-ink">{successPersona.numeroDocumento}</strong> ({successPersona.tipoDocumento})
                  </>
                ) : (
                  <>
                    El contacto con documento{' '}
                    <strong className="text-ink">{successPersona.numeroDocumento}</strong> ({successPersona.tipoDocumento})
                  </>
                )}{' '}
                ha sido registrado correctamente. Toda la información ha sido guardada de forma segura.
              </p>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <Button type="button" variant="secondary" onClick={handleReset}>
                Registrar otra persona
              </Button>
              {onBackToDirectory && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => {
                    handleReset()
                    onBackToDirectory()
                  }}
                >
                  Ver en el directorio
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-ink">Ficha de identificación</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Completa los datos de identificación y canales de contacto para registrar a la persona en el sistema.
              </p>
            </div>

            <PersonaRegistroForm
              submitting={submitting}
              onSubmit={handleSubmit}
            />

            {submitError && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                role="alert"
                className="mt-4 rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
              >
                {submitError}
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.section>
  )
}
