import { useState, type FormEvent } from 'react'
import { motion } from 'motion/react'
import { customEasing, fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  NAME_MAX,
  validateHabitacionInput,
  type HabitacionInput,
  type HabitacionValidationErrors,
} from '../../domain/habitacion'
import { Button } from '../atoms/button'
import { FadeIn } from '../atoms/fade-in'

export interface HabitacionRegistroFormProps {
  submitting: boolean
  submitError: string | null
  onSubmit: (values: HabitacionInput) => void
}

export function HabitacionRegistroForm({
  submitting,
  submitError,
  onSubmit,
}: HabitacionRegistroFormProps) {
  const [name, setName] = useState('')
  const [capacity, setCapacity] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [errors, setErrors] = useState<HabitacionValidationErrors>({})

  const clearError = (field: keyof HabitacionValidationErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: HabitacionInput = { name, capacity, basePrice }
    const nextErrors = validateHabitacionInput(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <FadeIn duration={0.45} delay={0}>
        <Input
          label="Nombre"
          placeholder="Ej. Suite 101 con vista al mar"
          autoComplete="off"
          maxLength={NAME_MAX}
          autoFocus
          required
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            clearError('name')
          }}
          error={errors.name}
          hint="Un nombre que tus huéspedes reconozcan de un vistazo."
          icon={<BedIcon />}
        />
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={0.45} delay={0.12}>
          <Input
            label="Capacidad"
            type="number"
            inputMode="numeric"
            min={CAPACITY_MIN}
            max={CAPACITY_MAX}
            step={1}
            placeholder="Ej. 2"
            required
            value={capacity}
            onChange={(event) => {
              setCapacity(event.target.value)
              clearError('capacity')
            }}
            error={errors.capacity}
            hint={`Personas que pueden alojarse (${CAPACITY_MIN} a ${CAPACITY_MAX}).`}
            icon={<CapacityIcon />}
          />
        </FadeIn>

        <FadeIn duration={0.45} delay={0.2}>
          <Input
            label="Precio base"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            placeholder="Ej. 250000"
            required
            value={basePrice}
            onChange={(event) => {
              setBasePrice(event.target.value)
              clearError('basePrice')
            }}
            error={errors.basePrice}
            hint="Monto por noche, en la moneda de tu hotel."
            icon={<span className="text-sm font-semibold">$</span>}
          />
        </FadeIn>
      </div>

      <FadeIn
        duration={0.45}
        delay={0.28}
        className="flex items-center justify-end border-t border-line pt-4"
      >
        <Button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto shadow-sm"
          whileHover={
            submitting
              ? undefined
              : {
                  scale: 1.03,
                  y: -1,
                  transition: { duration: 0.22, ease: customEasing },
                }
          }
          whileTap={
            submitting
              ? undefined
              : {
                  scale: 0.97,
                  y: 0,
                  transition: { duration: 0.12, ease: customEasing },
                }
          }
        >
          {submitting ? (
            <>
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              Guardando…
            </>
          ) : (
            'Registrar habitación'
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
      <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
      <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
      <path d="M12 4v6" />
      <path d="M2 18h20" />
    </svg>
  )
}

function CapacityIcon() {
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
