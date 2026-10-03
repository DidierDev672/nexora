import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import {
  EDIFICIO_ESTADOS,
  EDIFICIO_ESTADO_LABELS,
  NOMBRE_MAX,
  PISOS_MIN,
  validateEdificioInput,
  type EdificioEstado,
  type EdificioInput,
  type EdificioValidationErrors,
} from '../../domain/edificio'
import { Button } from '../atoms/button'
import { FadeIn } from '../atoms/fade-in'
import { SelectField } from '../atoms/select-field'

export interface Option {
  value: string
  label: string
}

export interface EdificioFormProps {
  sedes: ReadonlyArray<Option>
  sedesLoading: boolean
  subSedes: ReadonlyArray<Option>
  subSedesLoading: boolean
  submitting: boolean
  submitError: string | null
  onSedeChange: (sedeId: string) => void
  onSubmit: (values: EdificioInput) => void
}

const estadoOptions: ReadonlyArray<Option> = EDIFICIO_ESTADOS.map((value) => ({
  value,
  label: EDIFICIO_ESTADO_LABELS[value],
}))

export function EdificioForm({
  sedes,
  sedesLoading,
  subSedes,
  subSedesLoading,
  submitting,
  submitError,
  onSedeChange,
  onSubmit,
}: EdificioFormProps) {
  const [nombre, setNombre] = useState('')
  const [numPisos, setNumPisos] = useState('')
  const [sedeId, setSedeId] = useState('')
  const [subSedeId, setSubSedeId] = useState('')
  const [estado, setEstado] = useState<EdificioEstado>('disponible')
  const [errors, setErrors] = useState<EdificioValidationErrors>({})

  const clearError = (field: keyof EdificioValidationErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSedeChange = (value: string) => {
    setSedeId(value)
    setSubSedeId('')
    clearError('sedeId')
    clearError('subSedeId')
    onSedeChange(value)
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: EdificioInput = {
      nombre,
      numPisos,
      sedeId,
      subSedeId,
      estado,
    }
    const nextErrors = validateEdificioInput(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={0.45} delay={0}>
          <Input
            label="Nombre"
            placeholder="Ej. Torre Alfa"
            autoComplete="off"
            maxLength={NOMBRE_MAX}
            autoFocus
            required
            value={nombre}
            onChange={(event) => {
              setNombre(event.target.value)
              clearError('nombre')
            }}
            error={errors.nombre}
            hint="Un nombre que lo identifique dentro de la sede."
            icon={<BuildingIcon />}
          />
        </FadeIn>

        <FadeIn duration={0.45} delay={0.07}>
          <Input
            label="Número de pisos"
            type="number"
            inputMode="numeric"
            min={PISOS_MIN}
            step={1}
            placeholder="Ej. 5"
            required
            value={numPisos}
            onChange={(event) => {
              setNumPisos(event.target.value)
              clearError('numPisos')
            }}
            error={errors.numPisos}
            hint="Cuántas plantas forman el edificio."
            icon={<FloorsIcon />}
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={0.45} delay={0.14}>
          <SelectField
            label="Sede"
            placeholder={sedesLoading ? 'Cargando sedes…' : 'Elige una sede…'}
            options={sedes}
            value={sedeId}
            onChange={(event) => handleSedeChange(event.target.value)}
            error={errors.sedeId}
            required
            disabled={sedesLoading}
            emptyLabel="Aún no hay sedes registradas."
          />
        </FadeIn>

        <FadeIn duration={0.45} delay={0.21}>
          <SelectField
            label="Sub sede"
            options={subSedes}
            value={subSedeId}
            onChange={(event) => {
              setSubSedeId(event.target.value)
              clearError('subSedeId')
            }}
            disabled={!sedeId || subSedesLoading}
            error={errors.subSedeId}
            placeholder={subSedesLoading ? 'Cargando sub sedes…' : 'Opcional: elige una sub sede'}
            emptyLabel={
              !sedeId
                ? 'Primero elige una sede para ver sus sub sedes.'
                : subSedesLoading
                  ? 'Cargando sub sedes…'
                  : 'Esta sede no tiene sub sedes.'
            }
          />
        </FadeIn>
      </div>

      <FadeIn duration={0.45} delay={0.28}>
        <SelectField
          label="Estado"
          options={estadoOptions}
          value={estado}
          onChange={(event) => setEstado(event.target.value as EdificioEstado)}
          error={errors.estado}
          required
        />
      </FadeIn>

      <FadeIn
        duration={0.45}
        delay={0.35}
        className="flex items-center justify-end border-t border-line pt-4"
      >
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? (
            <>
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Creando…
            </>
          ) : (
            'Crear edificio'
          )}
        </Button>
      </FadeIn>

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

function BuildingIcon() {
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
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
    </svg>
  )
}

function FloorsIcon() {
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
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  )
}