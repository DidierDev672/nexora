import { useState, type FormEvent } from 'react'
import { motion, type Variants } from 'motion/react'
import { Input } from '../../../../shared/ui/Input'
import { RecursosDropdown } from '../../../recursos/ui/molecules/recursos-dropdown'
import { Button } from '../../../recursos/ui/atoms/button'
import { Loader } from '../../../roles/ui/atoms/loader'
import {
  TIPOS_DOCUMENTO_OPTIONS,
  validatePersonaInput,
  type PersonaInput,
  type PersonaValidationErrors,
} from '../../domain/persona'

const fieldFadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
}

const formContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

export interface PersonaRegistroFormProps {
  submitting?: boolean
  onSubmit: (values: PersonaInput) => void
}

export function PersonaRegistroForm({
  submitting = false,
  onSubmit,
}: PersonaRegistroFormProps) {
  const [tipoDocumento, setTipoDocumento] = useState('')
  const [numeroDocumento, setNumeroDocumento] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<PersonaValidationErrors>({})

  const clearError = (field: keyof PersonaValidationErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: PersonaInput = {
      tipoDocumento,
      numeroDocumento,
      nombre,
      name: nombre,
      telefono,
      email,
    }

    const validationErrors = validatePersonaInput(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <>
      <Loader overlay visible={submitting} label="Registrando persona..." />
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
        initial="hidden"
        animate="visible"
        variants={formContainerVariants}
      >
      {/* 1. Tipo de Documento */}
      <motion.div variants={fieldFadeIn}>
        <RecursosDropdown
          label="Tipo de documento"
          placeholder="Selecciona el tipo de documento…"
          options={TIPOS_DOCUMENTO_OPTIONS}
          value={tipoDocumento}
          onChange={(val) => {
            setTipoDocumento(val)
            clearError('tipoDocumento')
          }}
          error={errors.tipoDocumento}
          required
        />
      </motion.div>

      {/* 2. Número de Documento */}
      <motion.div variants={fieldFadeIn}>
        <Input
          label="Número de documento"
          placeholder="Ej. 1023456789"
          autoComplete="off"
          required
          value={numeroDocumento}
          onChange={(event) => {
            setNumeroDocumento(event.target.value)
            clearError('numeroDocumento')
          }}
          error={errors.numeroDocumento}
          hint="Sin puntos ni guiones para agilizar la búsqueda."
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <line x1="2" x2="22" y1="10" y2="10" />
            </svg>
          }
        />
      </motion.div>

      {/* 3. Nombre Completo */}
      <motion.div variants={fieldFadeIn}>
        <Input
          label="Nombre completo"
          placeholder="Ej. Juan Pérez"
          autoComplete="name"
          required
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            clearError('nombre')
          }}
          error={errors.nombre}
          hint="Nombres y apellidos tal como figuran en el documento."
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
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
        />
      </motion.div>

      {/* Grid de Teléfono y Correo Electrónico */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* 4. Número de Teléfono */}
        <motion.div variants={fieldFadeIn}>
          <Input
            label="Número de teléfono"
            type="tel"
            inputMode="tel"
            placeholder="Ej. +57 300 123 4567"
            autoComplete="tel"
            required
            value={telefono}
            onChange={(event) => {
              setTelefono(event.target.value)
              clearError('telefono')
            }}
            error={errors.telefono}
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
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
          />
        </motion.div>

        {/* 4. Correo Electrónico */}
        <motion.div variants={fieldFadeIn}>
          <Input
            label="Correo electrónico"
            type="email"
            inputMode="email"
            placeholder="nombre@empresa.com"
            autoComplete="email"
            required
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
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />
        </motion.div>
      </div>

      {/* Acciones del formulario */}
      <motion.div
        variants={fieldFadeIn}
        className="flex items-center justify-end gap-3 border-t border-line pt-5"
      >
        <Button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Registrando persona…
            </span>
          ) : (
            'Registrar persona'
          )}
        </Button>
      </motion.div>
    </motion.form>
  </>
  )
}
