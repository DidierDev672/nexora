import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import { Button } from '../../../recursos/ui/atoms/button'
import { RecursosDropdown } from '../../../recursos/ui/molecules/recursos-dropdown'
import {
  formatPrecioCOP,
  RESERVA_ESTADO_OPTIONS,
  type ReservaInput,
  type ReservaValidationErrors,
} from '../../domain/reserva'

export interface ReservaCardFormProps {
  formValues: ReservaInput
  errors: ReservaValidationErrors
  roomDropdownOptions: ReadonlyArray<{ value: string; label: string }>
  personDropdownOptions: ReadonlyArray<{ value: string; label: string }>
  loadingDependencies: boolean
  submitting: boolean
  onFieldChange: (field: keyof ReservaInput, value: string | number) => void
  onSubmit: (e?: React.FormEvent) => void
}

export function ReservaCardForm({
  formValues,
  errors,
  roomDropdownOptions,
  personDropdownOptions,
  loadingDependencies,
  submitting,
  onFieldChange,
  onSubmit,
}: ReservaCardFormProps) {
  // Cálculo informativo de noches si ambas fechas están presentes
  const nights = (() => {
    if (!formValues.checkInDate || !formValues.checkOutDate) return null
    const start = new Date(formValues.checkInDate).getTime()
    const end = new Date(formValues.checkOutDate).getTime()
    if (isNaN(start) || isNaN(end) || end <= start) return null
    return Math.round((end - start) / (1000 * 60 * 60 * 24))
  })()

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-line bg-panel p-6 shadow-sm sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-1 border-b border-line/60 pb-5">
        <h2 className="text-xl font-bold text-ink">Detalles de la reserva</h2>
        <p className="text-sm text-ink-muted">
          Completa los datos esenciales para registrar y asegurar la reserva en el hotel.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Habitación y Cama (name - etiquette) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sm:col-span-2"
          >
            <RecursosDropdown
              label="Habitación y cama"
              placeholder={
                loadingDependencies
                  ? 'Cargando habitaciones y camas…'
                  : 'Selecciona una habitación y cama…'
              }
              options={roomDropdownOptions}
              value={formValues.bedId}
              onChange={(value) => onFieldChange('bedId', value)}
              error={errors.bedId}
              required
              disabled={loadingDependencies || submitting}
            />
          </motion.div>

          {/* Datos básicos del huésped (name - phone_number) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sm:col-span-2"
          >
            <RecursosDropdown
              label="Huésped principal"
              placeholder={
                loadingDependencies ? 'Cargando huéspedes…' : 'Selecciona o busca un huésped…'
              }
              options={personDropdownOptions}
              value={formValues.personId}
              onChange={(value) => onFieldChange('personId', value)}
              error={errors.personId}
              required
              disabled={loadingDependencies || submitting}
            />
          </motion.div>

          {/* Fecha de registro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Input
              type="date"
              label="Fecha de registro"
              value={formValues.checkInDate}
              onChange={(e) => onFieldChange('checkInDate', e.target.value)}
              error={errors.checkInDate}
              required
              disabled={submitting}
              min={new Date().toISOString().split('T')[0]}
            />
          </motion.div>

          {/* Fecha de salidad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Input
              type="date"
              label="Fecha de salidad"
              value={formValues.checkOutDate}
              onChange={(e) => onFieldChange('checkOutDate', e.target.value)}
              error={errors.checkOutDate}
              required
              disabled={submitting}
              min={formValues.checkInDate || new Date().toISOString().split('T')[0]}
              hint={nights !== null ? `${nights} ${nights === 1 ? 'noche' : 'noches'} de estadía` : undefined}
            />
          </motion.div>

          {/* Número de huéspedes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <Input
              type="number"
              min={1}
              max={10}
              label="Número de huéspedes"
              placeholder="1"
              value={formValues.numberOfGuests}
              onChange={(e) => onFieldChange('numberOfGuests', e.target.value)}
              error={errors.numberOfGuests}
              required
              disabled={submitting}
            />
          </motion.div>

          {/* Estado de la reserva */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <RecursosDropdown
              label="Estado de la reserva"
              placeholder="Seleccionar estado…"
              options={RESERVA_ESTADO_OPTIONS}
              value={formValues.state}
              onChange={(value) => onFieldChange('state', value)}
              error={errors.state}
              required
              disabled={submitting}
            />
          </motion.div>

          {/* Precio total */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="sm:col-span-2"
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              label="Precio total"
              placeholder="Ej. 85000"
              value={formValues.totalPrice}
              onChange={(e) => onFieldChange('totalPrice', e.target.value)}
              error={errors.totalPrice}
              icon={<span className="text-xs font-semibold text-ink-muted">COP $</span>}
              iconPosition="left"
              required
              disabled={submitting}
              hint={
                formValues.totalPrice !== '' && !isNaN(Number(formValues.totalPrice))
                  ? `Formato moneda colombiana: ${formatPrecioCOP(Number(formValues.totalPrice))}`
                  : 'Importe final de la reserva en pesos colombianos (COP).'
              }
            />
          </motion.div>
        </div>

        {/* Botón de acción principal */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-line/60">
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || loadingDependencies}
            className="w-full sm:w-auto px-6 py-2.5 font-semibold"
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
                Guardando reserva…
              </span>
            ) : (
              'Confirmar reserva'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
