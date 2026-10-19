import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { motion } from 'motion/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'
import { fadeUp } from '../../../../design-tokens/motion'
import { api } from '../../../../lib/api'
import { validateStatusCode } from '../../../../shared/lib/status-code-validator'
import { Input } from '../../../../shared/ui/Input'
import { RecursosDropdown, type DropdownOption } from '../../../recursos/ui/molecules/recursos-dropdown'
import {
  HABITACION_ESTADOS,
  HABITACION_ESTADO_LABELS,
  NUMERO_MAX,
  validateHabitacionDetalleInput,
  type HabitacionDetalleInput,
  type HabitacionDetalleValidationErrors,
  type HabitacionEstado,
} from '../../domain/habitacion-detalle'
import type { HabitacionDetalleRepository } from '../../domain/habitacion-detalle-repository'
import { ApiHabitacionDetalleRepository } from '../../infrastructure/api-habitacion-detalle-repository'
import { ObtenerSiguienteNumeroHabitacion } from '../../application/obtener-siguiente-numero-habitacion'
import { Button } from '../atoms/button'
import { FadeIn } from '../atoms/fade-in'
import { SelectField } from '../atoms/select-field'
import { cn } from '../lib/cn'

export interface Option {
  value: string
  label: string
}

export interface EdificioOption {
  value: string
  label: string
  floorNumber?: number
}

export interface TarifaOption {
  value: string
  label: string
  price: number
  modality?: string
}

export interface HabitacionDetalleFormProps {
  roomTypes: ReadonlyArray<Option>
  roomTypesLoading: boolean
  edificios: ReadonlyArray<EdificioOption>
  edificiosLoading: boolean
  submitting: boolean
  submitError: string | null
  onSubmit: (values: HabitacionDetalleInput) => void
  selectedTarifa?: TarifaOption | null
  repository?: HabitacionDetalleRepository
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount)
}

type FieldKey = keyof HabitacionDetalleValidationErrors

const estadoOptions: ReadonlyArray<Option> = HABITACION_ESTADOS.map((value) => ({
  value,
  label: HABITACION_ESTADO_LABELS[value],
}))

const ANIMATION = {
  duration: 0.45,
  step: 0.07,
  start: 0,
} as const

const defaultHabitacionDetalleRepository = new ApiHabitacionDetalleRepository()

export function HabitacionDetalleForm({
  roomTypes,
  roomTypesLoading,
  edificios,
  edificiosLoading,
  submitting,
  submitError,
  onSubmit,
  selectedTarifa,
  repository,
}: HabitacionDetalleFormProps) {
  const [numero, setNumero] = useState('')
  const [autoNextNumber, setAutoNextNumber] = useState('')
  const [isManualNumber, setIsManualNumber] = useState(false)
  const [loadingNextNumber, setLoadingNextNumber] = useState(false)
  const [nextNumberError, setNextNumberError] = useState<string | null>(null)
  const [piso, setPiso] = useState('')
  const [tipoHabitacion, setTipoHabitacion] = useState('')
  const [edificioId, setEdificioId] = useState('')
  const [precio, setPrecio] = useState('')
  const [estado, setEstado] = useState<HabitacionEstado>('disponible')
  const [errors, setErrors] = useState<HabitacionDetalleValidationErrors>({})
  const [fetchedFloors, setFetchedFloors] = useState<Record<string, number>>({})
  const [loadingFloors, setLoadingFloors] = useState(false)

  const effectiveRepository = useMemo(
    () => repository ?? defaultHabitacionDetalleRepository,
    [repository]
  )

  const fetchNextNumber = useCallback(async () => {
    setLoadingNextNumber(true)
    setNextNumberError(null)

    try {
      const getNext = ObtenerSiguienteNumeroHabitacion(effectiveRepository)
      const result = await getNext()

      if (!result.validation.isValid) {
        const errorMsg =
          result.validation.message ??
          `No se pudo obtener el número automático (código ${result.validation.status}).`
        setNextNumberError(errorMsg)
        setIsManualNumber(true)
        return
      }

      if (result.nextNumber) {
        setAutoNextNumber(result.nextNumber)
        setNumero(result.nextNumber)
        setErrors((prev) => {
          if (!prev.numero) return prev
          const next = { ...prev }
          delete next.numero
          return next
        })
      }
    } catch {
      const validation = validateStatusCode(0)
      setNextNumberError(validation.message ?? 'No se pudo consultar el próximo número.')
      setIsManualNumber(true)
    } finally {
      setLoadingNextNumber(false)
    }
  }, [effectiveRepository])

  useEffect(() => {
    void fetchNextNumber()
  }, [fetchNextNumber])

  const handleToggleManualNumber = () => {
    setIsManualNumber((prev) => {
      const next = !prev
      if (next) {
        setTimeout(() => {
          const el = document.getElementById('habitacion-numero-input') as HTMLInputElement | null
          if (el) {
            el.focus()
            el.select()
          }
        }, 50)
      } else {
        if (autoNextNumber) {
          setNumero(autoNextNumber)
          setErrors((prev) => {
            if (!prev.numero) return prev
            const n = { ...prev }
            delete n.numero
            return n
          })
        } else {
          void fetchNextNumber()
        }
      }
      return next
    })
  }

  const selectedEdificio = useMemo(
    () => edificios.find((e) => e.value === edificioId),
    [edificios, edificioId]
  )

  // Consulta complementaria a /building/{id} si el listado general no aportó floorNumber
  useEffect(() => {
    if (!edificioId) return
    if (selectedEdificio?.floorNumber != null && selectedEdificio.floorNumber > 0) return
    if (fetchedFloors[edificioId] != null) return

    let isMounted = true
    setLoadingFloors(true)

    api
      .get<unknown>(`/building/${encodeURIComponent(edificioId)}`)
      .then((res) => {
        if (!isMounted) return
        const raw = res.data as { data?: { floor_number?: number } } | { floor_number?: number }
        const item = raw && typeof raw === 'object' && 'data' in raw && raw.data ? raw.data : raw
        const fNum =
          item &&
          typeof item === 'object' &&
          'floor_number' in item &&
          typeof item.floor_number === 'number'
            ? item.floor_number
            : undefined
        if (fNum != null && fNum > 0) {
          setFetchedFloors((prev) => ({ ...prev, [edificioId]: fNum }))
        }
      })
      .catch(() => {
        // Fallback silencioso
      })
      .finally(() => {
        if (isMounted) setLoadingFloors(false)
      })

    return () => {
      isMounted = false
    }
  }, [edificioId, selectedEdificio, fetchedFloors])

  const totalPisos = selectedEdificio?.floorNumber ?? fetchedFloors[edificioId] ?? 0

  // Opciones de pisos derivadas del número de pisos registrado para el edificio
  const pisoOptions = useMemo<DropdownOption[]>(() => {
    if (!edificioId || totalPisos <= 0) return []
    return Array.from({ length: totalPisos }, (_, index) => {
      const floorNumber = index + 1
      return {
        value: String(floorNumber),
        label: `Piso ${floorNumber}`,
      }
    })
  }, [edificioId, totalPisos])

  // Limpia el piso seleccionado si ya no es válido para el edificio actual
  useEffect(() => {
    if (piso && totalPisos > 0) {
      const currentPiso = Number(piso)
      if (isNaN(currentPiso) || currentPiso < 1 || currentPiso > totalPisos) {
        setPiso('')
      }
    } else if (!edificioId) {
      setPiso('')
    }
  }, [edificioId, totalPisos, piso])

  const numericPrecio = precio.trim() ? Number(precio.trim().replace(',', '.')) : 0
  const hasValidNumericPrecio = !isNaN(numericPrecio) && numericPrecio > 0
  const isOverTariff = Boolean(
    selectedTarifa &&
    selectedTarifa.price > 0 &&
    hasValidNumericPrecio &&
    numericPrecio > selectedTarifa.price
  )

  const clearError = (field: FieldKey) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  // Actualiza el campo y limpia su error para que la validación se reevalúe al enviar.
  const handleInputChange = <T extends string>(
    field: FieldKey,
    setter: Dispatch<SetStateAction<T>>,
    value: T,
  ) => {
    setter(value)
    clearError(field)
  }

  const handleEdificioChange = (newEdificioId: string) => {
    setEdificioId(newEdificioId)
    clearError('edificioId')
    clearError('piso')
    const matched = edificios.find((e) => e.value === newEdificioId)
    const availableFloors = matched?.floorNumber ?? fetchedFloors[newEdificioId] ?? 0
    if (piso && availableFloors > 0 && Number(piso) > availableFloors) {
      setPiso('')
    } else if (!newEdificioId) {
      setPiso('')
    }
  }

  const handlePrecioChange = (val: string) => {
    setPrecio(val)
    clearError('precio')
    if (selectedTarifa && selectedTarifa.price > 0 && val.trim()) {
      const num = Number(val.trim().replace(',', '.'))
      if (!isNaN(num) && num > selectedTarifa.price) {
        setErrors((prev) => ({
          ...prev,
          precio: `El precio a validar (${formatCurrency(num)}) no puede ser superior a la tarifa seleccionada (${formatCurrency(selectedTarifa.price)}).`,
        }))
      }
    }
  }

  // Si la tarifa seleccionada cambia, revalida el precio actual
  useEffect(() => {
    if (selectedTarifa && selectedTarifa.price > 0 && precio.trim()) {
      const num = Number(precio.trim().replace(',', '.'))
      if (!isNaN(num) && num > selectedTarifa.price) {
        setErrors((prev) => ({
          ...prev,
          precio: `El precio a validar (${formatCurrency(num)}) no puede ser superior a la tarifa seleccionada (${formatCurrency(selectedTarifa.price)}).`,
        }))
      } else {
        clearError('precio')
      }
    }
  }, [selectedTarifa])

  const handleEstadoChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEstado(event.target.value as HabitacionEstado)
    clearError('estado')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values: HabitacionDetalleInput = {
      numero,
      piso,
      tipoHabitacion,
      edificioId,
      precio,
      estado,
    }
    const nextErrors = validateHabitacionDetalleInput(
      values,
      selectedTarifa?.price,
      totalPisos > 0 ? totalPisos : null
    )
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={ANIMATION.duration} delay={ANIMATION.start}>
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <Input
                id="habitacion-numero-input"
                label="Número"
                placeholder={loadingNextNumber ? 'Consultando número…' : 'Ej. 101-1'}
                autoComplete="off"
                maxLength={NUMERO_MAX}
                autoFocus={isManualNumber}
                required
                isDisabled={!isManualNumber}
                disabled={!isManualNumber}
                value={numero}
                onChange={(event) => handleInputChange('numero', setNumero, event.target.value)}
                error={errors.numero}
                hint={
                  nextNumberError
                    ? nextNumberError
                    : isManualNumber
                    ? 'Modo manual activo: ingresa el número que prefieras.'
                    : 'Número sugerido automáticamente por el sistema. Usa el botón de editar manual para cambiarlo.'
                }
                icon={<NumberIcon />}
              />
            </div>

            <div className="pt-[26px]">
              <button
                type="button"
                onClick={handleToggleManualNumber}
                disabled={loadingNextNumber}
                title="Numero manual"
                aria-label="Numero manual"
                className={cn(
                  'flex size-[42px] shrink-0 items-center justify-center rounded-xl border text-sm transition-all cursor-pointer shadow-2xs',
                  isManualNumber
                    ? 'border-primary/60 bg-primary/10 text-primary hover:bg-primary/20 hover:scale-105 active:scale-95'
                    : 'border-line bg-panel text-ink-muted hover:border-ink-soft hover:text-ink hover:scale-105 active:scale-95',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                <FontAwesomeIcon icon={faPenToSquare} className="size-4" />
              </button>
            </div>
          </div>
        </FadeIn>

        <FadeIn duration={ANIMATION.duration} delay={ANIMATION.step}>
          <SelectField
            label="Edificio"
            placeholder={edificiosLoading ? 'Cargando edificios…' : 'Elige un edificio…'}
            options={edificios}
            value={edificioId}
            onChange={(event) => handleEdificioChange(event.target.value)}
            error={errors.edificioId}
            required
            disabled={edificiosLoading}
            emptyLabel="Aún no hay edificios registrados."
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={ANIMATION.duration} delay={0.14}>
          <div className="space-y-1">
            <RecursosDropdown
              label="Piso"
              placeholder={
                !edificioId
                  ? 'Primero elige un edificio…'
                  : loadingFloors
                    ? 'Consultando pisos…'
                    : 'Elige un piso…'
              }
              options={pisoOptions}
              value={piso}
              onChange={(val) => handleInputChange('piso', setPiso, val)}
              error={errors.piso}
              disabled={!edificioId || loadingFloors}
              required
              emptyLabel={
                !edificioId
                  ? 'Primero elige un edificio para ver sus pisos disponibles.'
                  : loadingFloors
                    ? 'Consultando pisos del edificio…'
                    : 'Este edificio no tiene pisos registrados.'
              }
            />
            {selectedEdificio && totalPisos > 0 && (
              <p className="text-[11px] text-ink-muted">
                {selectedEdificio.label}: {totalPisos} {totalPisos === 1 ? 'piso disponible' : 'pisos disponibles'}.
              </p>
            )}
          </div>
        </FadeIn>

        <FadeIn duration={ANIMATION.duration} delay={0.21}>
          <SelectField
            label="Tipo de habitación"
            placeholder={roomTypesLoading ? 'Cargando tipos…' : 'Elige un tipo…'}
            options={roomTypes}
            value={tipoHabitacion}
            onChange={(event) =>
              handleInputChange('tipoHabitacion', setTipoHabitacion, event.target.value)
            }
            error={errors.tipoHabitacion}
            required
            disabled={roomTypesLoading}
            emptyLabel="Aún no hay tipos de habitación registrados."
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={ANIMATION.duration} delay={0.28}>
          <SelectField
            label="Estado"
            options={estadoOptions}
            value={estado}
            onChange={handleEstadoChange}
            error={errors.estado}
            required
          />
        </FadeIn>

        <FadeIn duration={ANIMATION.duration} delay={0.35}>
          <div className="space-y-2.5">
            <Input
              label="Precio a validar"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              placeholder={
                selectedTarifa && selectedTarifa.price > 0
                  ? `Tope máx: ${selectedTarifa.price}`
                  : 'Ej. 150000'
              }
              value={precio}
              onChange={(event) => handlePrecioChange(event.target.value)}
              error={errors.precio}
              hint="Opcional: precio por noche que el sistema validará contra el tipo seleccionado."
              icon={<span className="text-sm font-semibold">$</span>}
            />

            {/* GUÍA VISUAL PARA EL RECEPCIONISTA */}
            {selectedTarifa ? (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`rounded-2xl border p-3.5 text-xs space-y-2.5 transition-all shadow-2xs ${
                  isOverTariff
                    ? 'border-danger/40 bg-danger/10 text-danger'
                    : hasValidNumericPrecio
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                      : 'border-primary/25 bg-primary/5 text-ink'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-base">🏷️</span>
                    <span>Guía para recepcionista — Tarifa «{selectedTarifa.label}»</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePrecioChange(String(selectedTarifa.price))}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-panel px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10 transition shadow-2xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    title="Asignar el precio base de la tarifa al campo"
                  >
                    <span>Asignar precio base</span>
                    <span className="font-extrabold">({formatCurrency(selectedTarifa.price)})</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] border-t border-line/60 pt-2">
                  <span className="text-ink-muted">Precio tope de referencia visual:</span>
                  <span className="font-extrabold text-sm text-ink tracking-tight">
                    {formatCurrency(selectedTarifa.price)}
                  </span>
                </div>

                {isOverTariff ? (
                  <div className="flex items-start gap-1.5 text-[11px] font-semibold text-danger">
                    <span className="shrink-0 text-sm">⚠️</span>
                    <span>
                      ¡Alerta de validación! Has ingresado {formatCurrency(numericPrecio)}, superando la tarifa máxima de {formatCurrency(selectedTarifa.price)}. El precio a validar no puede ser superior.
                    </span>
                  </div>
                ) : hasValidNumericPrecio ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                    <span className="shrink-0 font-bold">✓</span>
                    <span>
                      Precio correcto: Se encuentra dentro del margen permitido ({formatCurrency(numericPrecio)} de {formatCurrency(selectedTarifa.price)} máx.).
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] text-ink-muted">
                    <span className="shrink-0">💡</span>
                    <span>
                      Toma como referencia los {formatCurrency(selectedTarifa.price)} de la tarifa. Cualquier precio a validar que registres debe ser menor o igual a este monto.
                    </span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="rounded-xl border border-dashed border-line/80 bg-canvas/40 px-3 py-2 text-[11px] text-ink-muted flex items-center gap-2">
                <span className="text-sm">ℹ️</span>
                <span>
                  <strong>Guía para recepción:</strong> Selecciona una tarifa en el selector superior para tener su precio como referencia visual y validar que el valor ingresado no la supere.
                </span>
              </div>
            )}
          </div>
        </FadeIn>
      </div>

      <FadeIn
        duration={ANIMATION.duration}
        delay={0.42}
        className="flex items-center justify-end border-t border-line pt-4"
      >
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? <SubmitContent label="Registrando…" /> : 'Registrar habitación'}
        </Button>
      </FadeIn>

      {submitError ? <SubmitError message={submitError} /> : null}
    </form>
  )
}

function SubmitContent({ label }: { label: string }) {
  return (
    <>
      <span
        className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
        aria-hidden="true"
      />
      {label}
    </>
  )
}

function SubmitError({ message }: { message: string }) {
  return (
    <motion.p
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      role="alert"
      className="rounded-xl border border-danger/25 bg-danger/10 px-4 py-3 text-sm font-medium text-danger"
    >
      {message}
    </motion.p>
  )
}

function NumberIcon() {
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
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="M16 3l-2 18" />
    </svg>
  )
}