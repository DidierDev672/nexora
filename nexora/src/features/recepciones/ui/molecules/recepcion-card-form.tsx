import { useMemo } from 'react'
import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import { Button } from '../../../recursos/ui/atoms/button'
import { RecursosDropdown } from '../../../recursos/ui/molecules/recursos-dropdown'
import {
  formatMetodoPago,
  formatPrecioCOP,
  normalizeMetodoPago,
  type RecepcionInput,
  type RecepcionValidationErrors,
} from '../../domain/recepcion'

export interface RecepcionCardFormProps {
  formValues: RecepcionInput
  errors: RecepcionValidationErrors
  sedeOptions?: ReadonlyArray<{ value: string; label: string }>
  edificioOptions?: ReadonlyArray<{ value: string; label: string }>
  habitacionDropdownOptions: ReadonlyArray<{ value: string; label: string }>
  camaOptions?: ReadonlyArray<{ value: string; label: string }>
  reservaDropdownOptions: ReadonlyArray<{ value: string; label: string }>
  huespedDropdownOptions: ReadonlyArray<{ value: string; label: string }>
  metodoPagoOptions: ReadonlyArray<{ value: string; label: string }>
  estadoOptions: ReadonlyArray<{ value: string; label: string }>
  loadingDependencies: boolean
  submitting: boolean
  syncNotice: string | null
  onFieldChange: (field: keyof RecepcionInput, value: string | number) => void
  onSubmit: (e?: React.FormEvent) => void
}

export function RecepcionCardForm({
  formValues,
  errors,
  sedeOptions = [],
  edificioOptions = [],
  habitacionDropdownOptions,
  camaOptions = [],
  reservaDropdownOptions,
  huespedDropdownOptions,
  metodoPagoOptions,
  estadoOptions,
  loadingDependencies,
  submitting,
  syncNotice,
  onFieldChange,
  onSubmit,
}: RecepcionCardFormProps) {
  // Cálculo de duración aproximada en días/horas si ambas fechas están presentes
  const durationSummary = (() => {
    if (!formValues.checkIn || !formValues.checkOut) return null
    const start = new Date(formValues.checkIn).getTime()
    const end = new Date(formValues.checkOut).getTime()
    if (isNaN(start) || isNaN(end) || end <= start) return null
    const diffHours = Math.round((end - start) / (1000 * 60 * 60))
    const days = Math.floor(diffHours / 24)
    const hours = diffHours % 24
    if (days === 0) return `${hours} horas de estadía`
    if (hours === 0) return `${days} ${days === 1 ? 'noche' : 'noches'}`
    return `${days} ${days === 1 ? 'noche' : 'noches'} y ${hours} hrs`
  })()

  // Opciones de método de pago estrictamente garantizadas en español
  const metodoPagoOpcionesEnEspanol = useMemo(
    () =>
      metodoPagoOptions.map((opt) => ({
        value: normalizeMetodoPago(opt.value),
        label: formatMetodoPago(opt.label),
      })),
    [metodoPagoOptions],
  )

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-line bg-panel p-6 shadow-sm sm:p-8"
    >
      {/* Cabecera de la Card */}
      <div className="mb-6 flex flex-col gap-1 border-b border-line/60 pb-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink">Registro de recepción y entrega de llave</h2>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            Paso único · Check-in
          </span>
        </div>
        <p className="text-sm text-ink-muted">
          Completa o verifica la información de ingreso. Si el huésped ya cuenta con reserva previa,
          elígela para autocompletar la habitación y sus datos.
        </p>
      </div>

      {/* Notificación de sincronización si se seleccionó una reserva */}
      {syncNotice && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary font-medium"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4 shrink-0"
            aria-hidden="true"
          >
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            <path d="M3 21v-5h5" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
          <span>{syncNotice}</span>
        </motion.div>
      )}

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* 1. DROPDOWN DE RESERVAS (requerida por el backend para /stay) */}
          <div className="sm:col-span-2">
            <RecursosDropdown
              label="Reserva previa (requerida)"
              placeholder={
                loadingDependencies
                  ? 'Cargando reservas disponibles…'
                  : 'Selecciona una reserva para el ingreso…'
              }
              options={reservaDropdownOptions}
              value={formValues.reservaId}
              onChange={(value) => onFieldChange('reservaId', value)}
              error={errors.reservaId}
              required
              disabled={loadingDependencies || submitting}
            />
            <p className="mt-1 text-xs text-ink-soft">
              Selecciona la reserva del huésped (formato: Huésped - Teléfono). Al seleccionarla, se sincronizarán
              automáticamente la habitación asignada, datos del huésped y fechas de estadía.
            </p>
          </div>

          {/* 2. CASCADA JERÁRQUICA DE UBICACIÓN */}
          <div className="sm:col-span-2 rounded-2xl border border-line/80 bg-canvas/60 p-4 sm:p-5 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-ink">
              Ubicación Física en la Red Hotelera (Sede ➔ Edificio ➔ Habitación ➔ Cama)
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Sede */}
              <div>
                <RecursosDropdown
                  label="Sede hotelera"
                  placeholder="Elige la sede..."
                  options={sedeOptions}
                  value={formValues.sedeId}
                  onChange={(value) => onFieldChange('sedeId', value)}
                  disabled={loadingDependencies || submitting}
                />
              </div>

              {/* Edificio */}
              <div>
                <RecursosDropdown
                  label="Edificio / Torre"
                  placeholder="Elige el edificio..."
                  options={edificioOptions}
                  value={formValues.edificioId}
                  onChange={(value) => onFieldChange('edificioId', value)}
                  disabled={loadingDependencies || submitting}
                />
              </div>

              {/* Habitación */}
              <div>
                <RecursosDropdown
                  label="Habitación asignada"
                  placeholder={
                    loadingDependencies
                      ? 'Cargando habitaciones del hotel…'
                      : 'Elige una habitación para la recepción…'
                  }
                  options={habitacionDropdownOptions}
                  value={formValues.habitacionId}
                  onChange={(value) => onFieldChange('habitacionId', value)}
                  error={errors.habitacionId}
                  required
                  disabled={loadingDependencies || submitting}
                />
              </div>

              {/* Cama */}
              <div>
                <RecursosDropdown
                  label="Cama asignada"
                  placeholder={
                    camaOptions.length > 0
                      ? 'Elige la cama...'
                      : 'Sin camas configuradas'
                  }
                  options={camaOptions}
                  value={formValues.camaId}
                  onChange={(value) => onFieldChange('camaId', value)}
                  disabled={loadingDependencies || submitting}
                />
              </div>
            </div>
          </div>

          {/* 3. DROPDOWN DE HUÉSPED */}
          <div className="sm:col-span-2">
            <RecursosDropdown
              label="Huésped que ingresa"
              placeholder={
                loadingDependencies
                  ? 'Cargando huéspedes registrados…'
                  : 'Selecciona al huésped principal…'
              }
              options={huespedDropdownOptions}
              value={formValues.huespedId}
              onChange={(value) => onFieldChange('huespedId', value)}
              error={errors.huespedId}
              required
              disabled={loadingDependencies || submitting}
            />
          </div>

          {/* 4. CAMPO FECHA Y HORA DE ENTRADA */}
          <div>
            <Input
              type="datetime-local"
              label="Fecha y hora de entrada"
              value={formValues.checkIn}
              onChange={(e) => onFieldChange('checkIn', e.target.value)}
              error={errors.checkIn}
              required
              disabled={submitting}
              hint="Momento exacto en el que el huésped toma posesión de la habitación."
            />
          </div>

          {/* 5. CAMPO FECHA Y HORA DE SALIDA */}
          <div>
            <Input
              type="datetime-local"
              label="Fecha y hora de salida"
              value={formValues.checkOut}
              onChange={(e) => onFieldChange('checkOut', e.target.value)}
              error={errors.checkOut}
              required
              disabled={submitting}
              min={formValues.checkIn}
              hint={durationSummary ?? 'Fecha y hora acordada para la entrega de llaves.'}
            />
          </div>

          {/* 6. DROPDOWN MÉTODO DE PAGO [efectivo, tarjeta, transferencia] */}
          <div>
            <RecursosDropdown
              label="Método de pago"
              placeholder="Seleccionar método de pago…"
              options={metodoPagoOpcionesEnEspanol}
              value={normalizeMetodoPago(formValues.metodoPago)}
              onChange={(value) => onFieldChange('metodoPago', normalizeMetodoPago(value))}
              error={errors.metodoPago}
              required
              disabled={submitting}
            />
          </div>

          {/* 7. ESTADO [progreso, finalizada, cancelada] */}
          <div>
            <RecursosDropdown
              label="Estado de la recepción"
              placeholder="Seleccionar estado…"
              options={estadoOptions}
              value={formValues.estado}
              onChange={(value) => onFieldChange('estado', value)}
              error={errors.estado}
              required
              disabled={submitting}
            />
          </div>

          {/* 8. DEPÓSITO DE GARANTÍA con Input */}
          <div className="sm:col-span-2">
            <Input
              type="number"
              step="any"
              min="0"
              label="Depósito de garantía"
              placeholder="Ej. 50000"
              value={formValues.depositoGarantia}
              onChange={(e) => onFieldChange('depositoGarantia', e.target.value)}
              error={errors.depositoGarantia}
              icon={<span className="text-xs font-semibold text-ink-muted">COP $</span>}
              iconPosition="left"
              required
              disabled={submitting}
              hint={
                formValues.depositoGarantia !== '' && !isNaN(Number(formValues.depositoGarantia))
                  ? `Monto en custodia: ${formatPrecioCOP(Number(formValues.depositoGarantia))} (reembolsable al check-out si no hay consumos o daños).`
                  : 'Monto retenido como salvaguarda durante la estadía (puede ser 0 si no se requiere).'
              }
            />
          </div>

          {/* 9. OBSERVACIONES / REMARKS (Textarea) */}
          <div className="sm:col-span-2">
            <label
              htmlFor="recepcion-remarks"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Observaciones (remarks)
            </label>
            <textarea
              id="recepcion-remarks"
              rows={3}
              placeholder="Escribe alguna observación, requerimiento especial o detalle de la estadía…"
              value={formValues.observaciones ?? ''}
              onChange={(e) => onFieldChange('observaciones', e.target.value)}
              disabled={submitting}
              className="w-full rounded-xl border border-line bg-panel px-4 py-2.5 text-sm text-ink shadow-xs outline-none transition placeholder:text-ink-soft hover:border-ink-soft focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
            <p className="mt-1.5 text-xs text-ink-soft">
              Opcional. Si no ingresas observaciones, se registrará como &quot;No remarks&quot; por defecto.
            </p>
          </div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-4 border-t border-line/60">
          <p className="text-xs text-ink-soft text-center sm:text-left">
            Al registrar, se actualizará el estado de la habitación y se emitirá el comprobante.
          </p>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loadingDependencies}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold text-sm"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg
                  className="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
                Registrando recepción…
              </span>
            ) : (
              'Confirmar y registrar recepción'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
