import { useState, type FormEvent } from 'react'
import { Input } from '../../../../shared/ui/Input'
import {
  RecursosDropdown,
  type DropdownOption,
} from '../../../recursos/ui/molecules/recursos-dropdown'
import type { Sede, SubSede } from '../../../sedes/domain/sede'
import {
  TARIFA_DIAS_SEMANA_OPTIONS,
  TARIFA_ESTADO_OPTIONS,
  TARIFA_MODALIDAD_OPTIONS,
  validateTarifaInput,
  type TarifaDiasSemana,
  type TarifaEstado,
  type TarifaInput,
  type TarifaModalidad,
  type TarifaValidationErrors,
} from '../../domain/tarifa'
import type { TipoCama } from '../../../cama3d/domain/tipo-cama'
import { Button } from '../atoms/button'
import { TarifaPreviewCard } from './tarifa-preview-card'

export interface TarifaFormProps {
  sedes: Sede[]
  sedesLoading: boolean
  subSedes: SubSede[]
  subSedesLoading: boolean
  submitting: boolean
  onSedeChange: (sedeId: string) => void
  onSubSedeChange?: (subSedeId: string) => void
  onSubmit: (values: TarifaInput) => void
  selectedTipoCama?: TipoCama | null
}

export function TarifaForm({
  sedes,
  sedesLoading,
  subSedes,
  subSedesLoading,
  submitting,
  onSedeChange,
  onSubSedeChange,
  onSubmit,
  selectedTipoCama,
}: TarifaFormProps) {
  const [nombre, setNombre] = useState('')
  const [sedeId, setSedeId] = useState('')
  const [subSedeId, setSubSedeId] = useState('')
  const [modalidad, setModalidad] = useState<TarifaModalidad | ''>('')
  const [precio, setPrecio] = useState('')
  const [duracion, setDuracion] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFinal, setFechaFinal] = useState('')
  const [diasSemana, setDiasSemana] = useState<TarifaDiasSemana | ''>('')
  const [estado, setEstado] = useState<TarifaEstado>('activo')
  const [errors, setErrors] = useState<TarifaValidationErrors>({})

  const clearError = (field: keyof TarifaValidationErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev))
  }

  const handleSedeSelect = (selectedSedeId: string) => {
    setSedeId(selectedSedeId)
    setSubSedeId('')
    clearError('sedeId')
    clearError('subSedeId')
    onSedeChange(selectedSedeId)
    onSubSedeChange?.('')
  }

  const handleReset = () => {
    setNombre('')
    setSedeId('')
    setSubSedeId('')
    setModalidad('')
    setPrecio('')
    setDuracion('')
    setFechaInicio('')
    setFechaFinal('')
    setDiasSemana('')
    setEstado('activo')
    setErrors({})
    onSedeChange('')
    onSubSedeChange?.('')
  }

  const currentValues: TarifaInput = {
    nombre,
    sedeId,
    subSedeId: subSedeId || undefined,
    modalidad,
    precio,
    duracion,
    fechaInicio,
    fechaFinal,
    diasSemana,
    estado,
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validateTarifaInput(currentValues)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(currentValues)
    }
  }

  // Opciones formateadas para los dropdowns
  const sedeOptions: DropdownOption[] = sedes.map((sede) => ({
    value: sede.id,
    label: `${sede.name} (${sede.city})`,
  }))

  const subSedeOptions: DropdownOption[] = subSedes.map((sub) => ({
    value: sub.id ?? sub.name,
    label: sub.name,
  }))

  const selectedSedeObj = sedes.find((s) => s.id === sedeId)
  const selectedSubSedeObj = subSedes.find((s) => (s.id ?? s.name) === subSedeId)

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Vista previa en vivo para dar certidumbre psicológica inmediata */}
      <TarifaPreviewCard
        input={currentValues}
        sedeNombre={selectedSedeObj?.name}
        subSedeNombre={selectedSubSedeObj?.name}
        tipoCamaNombre={selectedTipoCama?.name}
      />

      {/* Banner de vinculación con el menú 3D si hay una cama/sofá seleccionada */}
      {selectedTipoCama && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-lg bg-primary text-white shrink-0 text-[10px] font-bold">
              3D
            </span>
            <div>
              <p className="font-semibold text-ink">
                Mobiliario seleccionado en el menú: {selectedTipoCama.name}
              </p>
              <p className="text-ink-muted">
                Capacidad recomendada para {selectedTipoCama.capacity_people} {selectedTipoCama.capacity_people === 1 ? 'huésped' : 'huéspedes'}.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="text-xs py-1.5 px-3 shrink-0"
            onClick={() => {
              setNombre(`Tarifa ${selectedTipoCama.name} - Estándar`)
              clearError('nombre')
            }}
          >
            Usar como nombre
          </Button>
        </div>
      )}

      {/* SECCIÓN 1: Identificación y Ubicación */}
      <div className="space-y-4">
        <div className="border-b border-line pb-2">
          <h3 className="text-base font-semibold text-ink">
            1. Identificación y ubicación
          </h3>
          <p className="text-xs text-ink-muted">
            Define el nombre comercial de la tarifa y las sedes hoteleras donde estará disponible.
          </p>
        </div>

        {/* 1. Nombre de la tarifa (Input reutilizable) */}
        <Input
          label="Nombre de la tarifa"
          placeholder="Ej. Tarifa Ejecutiva Nocturna, Fin de Semana Relax..."
          value={nombre}
          onChange={(event) => {
            setNombre(event.target.value)
            clearError('nombre')
          }}
          error={errors.nombre}
          hint="Un nombre descriptivo facilita su selección al momento de hacer el check-in."
          required
          icon={
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 2. Dropdown Sede (RecursosDropdown reutilizable) */}
          <RecursosDropdown
            label="Sede del hotel"
            placeholder={sedesLoading ? 'Cargando sedes…' : 'Selecciona una sede…'}
            options={sedeOptions}
            value={sedeId}
            onChange={handleSedeSelect}
            error={errors.sedeId}
            disabled={sedesLoading}
            required
          />

          {/* 3. Dropdown Sub-sedes dependiente (RecursosDropdown reutilizable) */}
          <RecursosDropdown
            label="Sub sede dependiente"
            placeholder={
              !sedeId
                ? 'Primero elige una sede'
                : subSedesLoading
                  ? 'Cargando sub sedes…'
                  : subSedes.length === 0
                    ? 'Esta sede no tiene sub sedes'
                    : 'Opcional: Elige una sub sede…'
            }
            options={subSedeOptions}
            value={subSedeId}
            onChange={(val) => {
              setSubSedeId(val)
              clearError('subSedeId')
              onSubSedeChange?.(val)
            }}
            error={errors.subSedeId}
            disabled={!sedeId || subSedesLoading || subSedes.length === 0}
          />
        </div>
      </div>

      {/* SECCIÓN 2: Modalidad, Costos y Estado */}
      <div className="space-y-4">
        <div className="border-b border-line pb-2">
          <h3 className="text-base font-semibold text-ink">
            2. Modalidad, costos y estado
          </h3>
          <p className="text-xs text-ink-muted">
            Determina cómo se cobra la estancia (por hora, turno, noche o día) y su valor base.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 4. Modalidad de la tarifa: manana, tarde, noche, dias, semanal, horas (RecursosDropdown) */}
          <RecursosDropdown
            label="Modalidad de la tarifa"
            placeholder="Selecciona el turno o modalidad…"
            options={TARIFA_MODALIDAD_OPTIONS}
            value={modalidad}
            onChange={(val) => {
              setModalidad(val as TarifaModalidad)
              clearError('modalidad')
            }}
            error={errors.modalidad}
            required
          />

          {/* 10. Estado: Activo / Inactivo (RecursosDropdown) */}
          <RecursosDropdown
            label="Estado"
            placeholder="Selecciona el estado…"
            options={TARIFA_ESTADO_OPTIONS}
            value={estado}
            onChange={(val) => {
              setEstado(val as TarifaEstado)
              clearError('estado')
            }}
            error={errors.estado}
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 5. Precio (Input reutilizable) */}
          <Input
            label="Precio base"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={precio}
            onChange={(event) => {
              setPrecio(event.target.value)
              clearError('precio')
            }}
            error={errors.precio}
            hint="Precio fijado en la moneda local antes de cargos opcionales."
            required
            icon={<span className="text-sm font-bold text-primary">$</span>}
          />

          {/* 6. Duración (Input reutilizable) */}
          <Input
            label="Duración"
            type="number"
            min="1"
            placeholder={
              modalidad === 'horas'
                ? 'Ej. 4 (horas)'
                : modalidad === 'semanal'
                  ? 'Ej. 7 (días)'
                  : modalidad === 'dias'
                    ? 'Ej. 1 (día)'
                    : 'Ej. 12 (horas del turno)'
            }
            value={duracion}
            onChange={(event) => {
              setDuracion(event.target.value)
              clearError('duracion')
            }}
            error={errors.duracion}
            hint="Cantidad numérica que cubre esta tarifa según su modalidad."
            required
            icon={
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            }
          />
        </div>
      </div>

      {/* SECCIÓN 3: Calendario y Vigencia */}
      <div className="space-y-4">
        <div className="border-b border-line pb-2">
          <h3 className="text-base font-semibold text-ink">
            3. Vigencia y días de aplicación
          </h3>
          <p className="text-xs text-ink-muted">
            Define la ventana de tiempo en la que los huéspedes podrán disfrutar de este precio.
          </p>
        </div>

        {/* 9. Días/Semana: Todos los dias, Fin de semana, semanal (RecursosDropdown) */}
        <RecursosDropdown
          label="Días de la semana aplicables"
          placeholder="Selecciona los días…"
          options={TARIFA_DIAS_SEMANA_OPTIONS}
          value={diasSemana}
          onChange={(val) => {
            setDiasSemana(val as TarifaDiasSemana)
            clearError('diasSemana')
          }}
          error={errors.diasSemana}
          required
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 7. Fecha inicio (Input reutilizable) */}
          <Input
            label="Fecha de inicio"
            type="date"
            value={fechaInicio}
            onChange={(event) => {
              setFechaInicio(event.target.value)
              clearError('fechaInicio')
            }}
            error={errors.fechaInicio}
            hint="Primer día habilitado para cobrar esta tarifa."
            required
            icon={
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />

          {/* 8. Fecha final (Input reutilizable) */}
          <Input
            label="Fecha final de vigencia"
            type="date"
            value={fechaFinal}
            onChange={(event) => {
              setFechaFinal(event.target.value)
              clearError('fechaFinal')
            }}
            error={errors.fechaFinal}
            hint="Último día en que esta tarifa estará vigente."
            required
            icon={
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Botones de acción con psicología de seguridad */}
      <div className="flex flex-col-reverse items-center justify-end gap-3 border-t border-line pt-6 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          disabled={submitting}
          onClick={handleReset}
          className="w-full sm:w-auto"
        >
          Limpiar campos
        </Button>

        <Button
          type="submit"
          id="btn-registrar-tarifas-form"
          aria-label="Registrar tarifas"
          variant="primary"
          disabled={submitting}
          className="w-full sm:w-auto px-6 py-2.5 font-semibold"
        >
          {submitting ? (
            <>
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-hidden="true"
              />
              <span>Guardando tarifa…</span>
            </>
          ) : (
            'Registrar tarifas'
          )}
        </Button>
      </div>
    </form>
  )
}
