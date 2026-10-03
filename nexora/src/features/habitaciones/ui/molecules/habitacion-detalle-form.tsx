import { useEffect, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import { motion } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import {
  HABITACION_ESTADOS,
  HABITACION_ESTADO_LABELS,
  NUMERO_MAX,
  PISO_MIN,
  validateHabitacionDetalleInput,
  type HabitacionDetalleInput,
  type HabitacionDetalleValidationErrors,
  type HabitacionEstado,
} from '../../domain/habitacion-detalle'
import { Button } from '../atoms/button'
import { FadeIn } from '../atoms/fade-in'
import { SelectField } from '../atoms/select-field'

export interface Option {
  value: string
  label: string
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
  edificios: ReadonlyArray<Option>
  edificiosLoading: boolean
  submitting: boolean
  submitError: string | null
  onSubmit: (values: HabitacionDetalleInput) => void
  selectedTarifa?: TarifaOption | null
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

export function HabitacionDetalleForm({
  roomTypes,
  roomTypesLoading,
  edificios,
  edificiosLoading,
  submitting,
  submitError,
  onSubmit,
  selectedTarifa,
}: HabitacionDetalleFormProps) {
  const [numero, setNumero] = useState('')
  const [piso, setPiso] = useState('')
  const [tipoHabitacion, setTipoHabitacion] = useState('')
  const [edificioId, setEdificioId] = useState('')
  const [precio, setPrecio] = useState('')
  const [estado, setEstado] = useState<HabitacionEstado>('disponible')
  const [errors, setErrors] = useState<HabitacionDetalleValidationErrors>({})

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
    const nextErrors = validateHabitacionDetalleInput(values, selectedTarifa?.price)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(values)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={ANIMATION.duration} delay={ANIMATION.start}>
          <Input
            label="Número"
            placeholder="Ej. 101A"
            autoComplete="off"
            maxLength={NUMERO_MAX}
            autoFocus
            required
            value={numero}
            onChange={(event) => handleInputChange('numero', setNumero, event.target.value)}
            error={errors.numero}
            hint="El número que la identifica dentro del hotel."
            icon={<NumberIcon />}
          />
        </FadeIn>

        <FadeIn duration={ANIMATION.duration} delay={ANIMATION.step}>
          <Input
            label="Piso"
            type="number"
            inputMode="numeric"
            min={PISO_MIN}
            step={1}
            placeholder="Ej. 2"
            required
            value={piso}
            onChange={(event) => handleInputChange('piso', setPiso, event.target.value)}
            error={errors.piso}
            hint="Planta del edificio donde se encuentra."
            icon={<FloorIcon />}
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={ANIMATION.duration} delay={0.14}>
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

        <FadeIn duration={ANIMATION.duration} delay={0.21}>
          <SelectField
            label="Estado"
            options={estadoOptions}
            value={estado}
            onChange={handleEstadoChange}
            error={errors.estado}
            required
          />
        </FadeIn>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FadeIn duration={ANIMATION.duration} delay={0.28}>
          <SelectField
            label="Edificio"
            placeholder={edificiosLoading ? 'Cargando edificios…' : 'Elige un edificio…'}
            options={edificios}
            value={edificioId}
            onChange={(event) => handleInputChange('edificioId', setEdificioId, event.target.value)}
            error={errors.edificioId}
            required
            disabled={edificiosLoading}
            emptyLabel="Aún no hay edificios registrados."
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

function FloorIcon() {
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