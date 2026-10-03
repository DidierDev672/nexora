import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { CrearTipoCama } from '../../application/crear-tipo-cama'
import type { TipoCamaDraft } from '../../domain/tipo-cama'
import { TipoCamaApiError } from '../../domain/tipo-cama-error'
import { ApiTipoCamaRepository } from '../../infrastructure/api-tipo-cama-repository'
import { Button } from '../atoms/button'
import { Loader } from '../atoms/loader'
import { Modal } from '../atoms/modal'
import { tipoCamaCreateErrorCopy } from '../lib/error-copy'
import { TipoCamaForm } from '../molecules/tipo-cama-form'

const tipoCamaRepository = new ApiTipoCamaRepository()

export interface TipoCamaModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function TipoCamaModal({ open, onClose, onSuccess }: TipoCamaModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ nombre: string; capacidad: number } | null>(null)
  const submittingRef = useRef(false)

  const handleSubmit = async (draft: TipoCamaDraft) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      await CrearTipoCama(tipoCamaRepository)(draft)
      setSuccess({ nombre: draft.nombre.trim(), capacidad: Math.trunc(Number(draft.capacidad.trim())) })
      onSuccess?.()
    } catch (error) {
      const status = error instanceof TipoCamaApiError ? error.status : 0
      setSubmitError(tipoCamaCreateErrorCopy(status))
    } finally {
      setSubmitting(false)
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
        title={success ? undefined : 'Nuevo tipo de cama'}
        className="max-w-xl"
      >
        {success ? (
          <SuccessState success={success} onReset={resetForm} onClose={handleClose} />
        ) : (
          <TipoCamaForm submitting={submitting} submitError={submitError} onSubmit={handleSubmit} />
        )}
      </Modal>

      <Loader
        overlay
        visible={submitting}
        size={40}
        label={success?.nombre ? `Guardando ${success.nombre}…` : 'Guardando tipo de cama…'}
      >
        <span className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          Un momento: le estamos acomodando las almohadas al catálogo.
        </span>
      </Loader>
    </>
  )
}

function SuccessState({
  success,
  onReset,
  onClose,
}: {
  success: { nombre: string; capacidad: number }
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
        <h3 className="text-xl font-bold text-ink">¡«{success.nombre}» ya tiene lugar en el catálogo!</h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          Quedó guardada con capacidad para {success.capacidad}{' '}
          {success.capacidad === 1 ? 'persona' : 'personas'}, lista para aparecer a escala junto a las demás.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="secondary" onClick={onReset}>
          Agregar otra
        </Button>
        <Button type="button" onClick={onClose}>
          Listo
        </Button>
      </div>
    </motion.div>
  )
}