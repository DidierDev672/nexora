import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { api } from '../../../../lib/api'
import { RegistrarEdificio } from '../../application/registrar-edificio'
import type { EdificioInput } from '../../domain/edificio'
import { EdificioApiError } from '../../domain/edificio-error'
import { ApiEdificioRepository } from '../../infrastructure/api-edificio-repository'
import { Button } from '../atoms/button'
import { Loader } from '../atoms/loader'
import { Modal } from '../atoms/modal'
import { edificioErrorCopy } from '../lib/error-copy'
import { EdificioForm, type Option } from '../molecules/edificio-form'

const edificioRepository = new ApiEdificioRepository()

function mapIdNameOptions(items: unknown[]): Option[] {
  return items
    .map((raw) => raw as { id?: unknown; name?: unknown })
    .filter((item) => item.id != null && typeof item.name === 'string')
    .map((item) => ({ value: String(item.id), label: String(item.name) }))
}

function mapSubSedeOptions(items: unknown[]): Option[] {
  return items
    .map((raw) => raw as { id?: unknown; name?: unknown })
    .filter((item) => typeof item.name === 'string')
    .map((item) => ({ value: String(item.id ?? item.name), label: String(item.name) }))
}

export interface EdificioRegistroModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EdificioRegistroModal({ open, onClose, onSuccess }: EdificioRegistroModalProps) {
  const [sedes, setSedes] = useState<Option[]>([])
  const [sedesLoading, setSedesLoading] = useState(false)
  const [sedesError, setSedesError] = useState<string | null>(null)
  const [subSedes, setSubSedes] = useState<Option[]>([])
  const [subSedesLoading, setSubSedesLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ nombre: string; numPisos: string } | null>(null)
  const submittingRef = useRef(false)

  const fetchSedes = useCallback(async () => {
    setSedesLoading(true)
    setSedesError(null)
    try {
      const response = await api.get<unknown>('/headquarters')
      setSedes(Array.isArray(response.data) ? mapIdNameOptions(response.data) : [])
    } catch {
      setSedesError(
        'No pudimos cargar las sedes, pero el formulario sigue listo. Revisa tu conexión e inténtalo de nuevo.',
      )
    } finally {
      setSedesLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    void (async () => {
      await fetchSedes()
    })()
  }, [open, fetchSedes])

  const handleSedeChange = useCallback(async (sedeId: string) => {
    setSubSedes([])
    if (!sedeId) {
      setSubSedesLoading(false)
      return
    }
    setSubSedesLoading(true)
    try {
      const response = await api.get<unknown>(`/sub-headquarters/by-headquarter/${sedeId}`)
      setSubSedes(Array.isArray(response.data) ? mapSubSedeOptions(response.data) : [])
    } catch {
      setSubSedes([])
    } finally {
      setSubSedesLoading(false)
    }
  }, [])

  const handleSubmit = async (values: EdificioInput) => {
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setSubmitError(null)
    try {
      await RegistrarEdificio(edificioRepository)(values)
      setSuccess({ nombre: values.nombre.trim(), numPisos: values.numPisos.trim() })
      onSuccess?.()
    } catch (error) {
      const status = error instanceof EdificioApiError ? error.status : 0
      setSubmitError(edificioErrorCopy(status))
    } finally {
      setSubmitting(false)
      submittingRef.current = false
    }
  }

  const resetForm = () => {
    setSuccess(null)
    setSubmitError(null)
    void fetchSedes()
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
        title={success ? undefined : 'Crear edificio'}
        className="max-w-xl"
      >
        {success ? (
          <SuccessState success={success} onReset={resetForm} onClose={handleClose} />
        ) : (
          <>
            {sedesError && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="mb-4 flex flex-col items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p role="status" className="text-sm font-medium text-black">
                  {sedesError}
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  onClick={() => void fetchSedes()}
                  disabled={sedesLoading}
                >
                  Reintentar
                </Button>
              </motion.div>
            )}
            <EdificioForm
              sedes={sedes}
              sedesLoading={sedesLoading}
              subSedes={subSedes}
              subSedesLoading={subSedesLoading}
              submitting={submitting}
              submitError={submitError}
              onSedeChange={(sedeId) => void handleSedeChange(sedeId)}
              onSubmit={handleSubmit}
            />
          </>
        )}
      </Modal>

      <Loader
        overlay
        visible={submitting}
        size={40}
        label={success?.nombre ? `Creando ${success.nombre}…` : 'Creando edificio…'}
      >
        <span className="max-w-xs text-center text-xs leading-relaxed text-ink-soft">
          Un momento: le estamos dando forma y pisos a tu nuevo edificio.
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
  success: { nombre: string; numPisos: string }
  onReset: () => void
  onClose: () => void
}) {
  const pisos = Number(success.numPisos)
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
        <h3 className="text-xl font-bold text-ink">¡«{success.nombre}» ya tiene {pisos} {pisos === 1 ? 'piso' : 'pisos'}!</h3>
        <p className="text-sm leading-relaxed text-ink-muted">
          Quedó ubicado dentro de tu sede, listo para que empieces a mover tus habitaciones hacia
          él y mantener todo en su lugar.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="secondary" onClick={onReset}>
          Crear otro edificio
        </Button>
        <Button type="button" onClick={onClose}>
          Listo
        </Button>
      </div>
    </motion.div>
  )
}