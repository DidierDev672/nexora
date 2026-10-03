import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { RegistrarHabitacion } from '../../application/registrar-habitacion'
import type { Habitacion, HabitacionInput } from '../../domain/habitacion'
import { HabitacionApiError } from '../../domain/habitacion-error'
import { ApiHabitacionRepository } from '../../infrastructure/api-habitacion-repository'
import { Button } from '../atoms/button'
import { Loader } from '../atoms/loader'
import { Modal } from '../atoms/modal'
import { roomTypeErrorCopy } from '../lib/error-copy'
import { HabitacionRegistroForm } from '../molecules/habitacion-registro-form'

const habitacionRepository = new ApiHabitacionRepository()

export interface HabitacionTipoModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function HabitacionTipoModal({ open, onClose, onSuccess }: HabitacionTipoModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submittingName, setSubmittingName] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<Habitacion | null>(null)
  const submittingRef = useRef(false)

  const handleSubmit = async (values: HabitacionInput) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmittingName(values.name.trim())
    setSubmitError(null)
    try {
      const habitacion = await RegistrarHabitacion(habitacionRepository)(values)
      setSuccess(habitacion)
      onSuccess?.()
    } catch (error) {
      const status = error instanceof HabitacionApiError ? error.status : 0
      setSubmitError(roomTypeErrorCopy(status))
    } finally {
      setSubmitting(false)
      setSubmittingName('')
      submittingRef.current = false
    }
  }

  const resetForm = () => {
    setSuccess(null)
    setSubmitError(null)
  }

  const handleClose = () => {
    if (submitting) return
    resetForm()
    onClose()
  }

  return (
    <>
      <Modal
        isOpen={open}
        onClose={handleClose}
        title={success ? undefined : 'Datos de la habitación'}
        className="max-w-xl"
      >
        {success ? (
          <SuccessState habitacion={success} onReset={resetForm} onClose={handleClose} />
        ) : (
          <HabitacionRegistroForm
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleSubmit}
          />
        )}
      </Modal>

      <Loader
        overlay
        visible={submitting}
        size={40}
        label={submittingName ? `Guardando «${submittingName}»…` : 'Guardando…'}
      >
        <span className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          Un momento: ya le estamos buscando su lugar en tu hotel.
        </span>
      </Loader>
    </>
  )
}

function SuccessState({
  habitacion,
  onReset,
  onClose,
}: {
  habitacion: Habitacion
  onReset: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center gap-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-6 py-10 text-center"
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
        <h3 className="text-xl font-bold text-ink">¡«{habitacion.name}» ya está lista!</h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          Quedó registrada con capacidad para {habitacion.capacity}{' '}
          {habitacion.capacity === 1 ? 'persona' : 'personas'} y un precio base ya definido. Ya
          puedes elegirla como tipo de habitación.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="secondary" onClick={onReset}>
          Registrar otro tipo
        </Button>
        <Button type="button" onClick={onClose}>
          Listo
        </Button>
      </div>
    </motion.div>
  )
}