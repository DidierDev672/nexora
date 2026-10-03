import { motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import {
  CAPACIDAD_MAX,
  CAPACIDAD_MIN,
  DESCRIPCION_MAX,
  validarTipoCamaDraft,
  type TipoCamaDraft,
  type TipoCamaDraftErrors,
} from '../../domain/tipo-cama'
import { Button } from '../atoms/button'
import { TextArea } from '../atoms/text-area'

export interface TipoCamaFormProps {
  submitting: boolean
  submitError: string | null
  onSubmit: (draft: TipoCamaDraft) => void
}

export function TipoCamaForm({ submitting, submitError, onSubmit }: TipoCamaFormProps) {
  const [nombre, setNombre] = useState('')
  const [capacidad, setCapacidad] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errors, setErrors] = useState<TipoCamaDraftErrors>({})

  const clearError = (campo: keyof TipoCamaDraftErrors) => {
    setErrors((prev) => (prev[campo] ? { ...prev, [campo]: undefined } : prev))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: TipoCamaDraft = { nombre, capacidad, descripcion }
    const nextErrors = validarTipoCamaDraft(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(draft)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Input
        label="Nombre"
        placeholder="Ej. Cama king"
        autoComplete="off"
        maxLength={30}
        autoFocus
        required
        value={nombre}
        onChange={(event) => {
          setNombre(event.target.value)
          clearError('nombre')
        }}
        error={errors.nombre}
        icon={<BedIcon />}
      />

      <Input
        label="Capacidad de personas"
        type="number"
        inputMode="numeric"
        min={CAPACIDAD_MIN}
        max={CAPACIDAD_MAX}
        step={1}
        placeholder={`Ej. ${CAPACIDAD_MIN}`}
        required
        value={capacidad}
        onChange={(event) => {
          setCapacidad(event.target.value)
          clearError('capacidad')
        }}
        error={errors.capacidad}
        hint={`Cuántos huéspedes pueden dormir en esta cama (entre ${CAPACIDAD_MIN} y ${CAPACIDAD_MAX}).`}
        icon={<UsersIcon />}
      />

      <TextArea
        label="Descripción"
        placeholder="Ej. Una cama amplia y cómoda, perfecta para descansar después de viajar."
        maxLength={DESCRIPCION_MAX}
        value={descripcion}
        onChange={(event) => {
          setDescripcion(event.target.value)
          clearError('descripcion')
        }}
        error={errors.descripcion}
        hint="Contanos un poquito qué los hace especiales."
      />

      <div className="flex items-center justify-end border-t border-line pt-4">
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Guardando…
            </>
          ) : (
            'Guardar tipo de cama'
          )}
        </Button>
      </div>

      {submitError ? (
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
        >
          {submitError}
        </motion.p>
      ) : null}
    </form>
  )
}

function BedIcon() {
  return (
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
      <path d="M2 20h20" />
      <path d="M5 20V9l7-4 7 4v11" />
      <path d="M9 20v-5h6v5" />
    </svg>
  )
}

function UsersIcon() {
  return (
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}