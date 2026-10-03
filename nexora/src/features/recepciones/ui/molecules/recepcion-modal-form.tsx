import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { fadeUp } from '../../../../design-tokens/motion'
import { Input } from '../../../../shared/ui/Input'
import { Button } from '../../../recursos/ui/atoms/button'
import { Loader } from '../../../roles/ui/atoms/loader'
import { RecursosDropdown } from '../../../recursos/ui/molecules/recursos-dropdown'
import { useRecepcionForm } from '../../application/use-recepcion-form'
import { RecepcionSuccess } from './recepcion-success'
import {
  formatMetodoPago,
  normalizeMetodoPago,
  type Recepcion,
} from '../../domain/recepcion'

/**
 * Función para garantizar que los métodos de pago se visualicen única y exclusivamente en español.
 * Evita cualquier término técnico o en inglés (cash, card, transfer) de cara al usuario.
 */
export function formatMetodoPagoEnEspanol(method?: string | null): string {
  return formatMetodoPago(method)
}

export interface RecepcionModalFormProps {
  open: boolean
  onClose: () => void
  onSuccessCreated?: (recepcion: Recepcion) => void
}

export function RecepcionModalForm({
  open,
  onClose,
  onSuccessCreated,
}: RecepcionModalFormProps) {
  const {
    formValues,
    errors,
    loadingDependencies,
    dependencyError,
    sedeOptions,
    edificioOptions,
    habitacionOptions,
    camaOptions,
    reservaDropdownOptions,
    huespedDropdownOptions,
    metodoPagoOptions,
    estadoOptions,
    submitting,
    submitError,
    successRecepcion,
    syncNotice,
    handleFieldChange,
    handleSubmit,
    handleReset,
  } = useRecepcionForm(undefined, (created) => {
    onSuccessCreated?.(created)
  })

  // Garantizar que las opciones del dropdown siempre se visualicen en español
  const metodoPagoOpcionesEnEspanol = useMemo(
    () =>
      metodoPagoOptions.map((opt) => ({
        value: normalizeMetodoPago(opt.value),
        label: formatMetodoPagoEnEspanol(opt.label),
      })),
    [metodoPagoOptions],
  )

  // Cerrar modal con tecla Escape
  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, submitting, onClose])

  if (!open) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkin-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !submitting && onClose()}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        />

        {/* Ventana Modal */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8"
        >
          {/* Loader Overlay durante el guardado */}
          <Loader
            overlay
            visible={submitting}
            size={36}
            label="Registrando la recepción y asignando habitación…"
          />

          {/* Botón de Cierre */}
          {!submitting && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar formulario de check-in"
              className="absolute top-5 right-5 grid size-9 place-items-center rounded-full text-ink-muted hover:bg-canvas hover:text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {successRecepcion ? (
            <div className="py-2">
              <RecepcionSuccess
                recepcion={successRecepcion}
                onReset={() => {
                  handleReset()
                  onClose()
                }}
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Encabezado del Formulario */}
              <div className="border-b border-line/60 pb-4 pr-8">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  Paso único · Check-in con trazabilidad completa
                </span>
                <h2 id="checkin-modal-title" className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
                  Nuevo check-in y asignación de llave
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                  Completa la información de ingreso. Al elegir la reserva previa se precargarán la sede,
                  el edificio, la habitación y la cama correspondientes.
                </p>
              </div>

              {/* Notificación de sincronización */}
              {syncNotice && (
                <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-primary font-medium">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0">
                    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                    <path d="M3 21v-5h5" />
                    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                  <span>{syncNotice}</span>
                </div>
              )}

              {dependencyError && (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
                  {dependencyError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {/* 1. SELECCIÓN DE RESERVA PREVIA */}
                <div>
                  <RecursosDropdown
                    label="Reserva previa (requerida)"
                    placeholder={
                      loadingDependencies
                        ? 'Cargando reservas disponibles…'
                        : 'Selecciona una reserva para el ingreso…'
                    }
                    options={reservaDropdownOptions}
                    value={formValues.reservaId}
                    onChange={(value) => handleFieldChange('reservaId', value)}
                    error={errors.reservaId}
                    required
                    disabled={loadingDependencies || submitting}
                  />
                  <p className="mt-1 text-xs text-ink-soft">
                    Selecciona al huésped reservado. Sincroniza automáticamente sede, torre, habitación y cama.
                  </p>
                </div>

                {/* 2. CASCADA JERÁRQUICA DE UBICACIÓN */}
                <div className="rounded-2xl border border-line/80 bg-canvas/60 p-4 sm:p-5 space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink">
                    Ubicación Física en la Red Hotelera
                  </p>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Sede */}
                    <div>
                      <RecursosDropdown
                        label="Sede hotelera"
                        placeholder="Elige la sede..."
                        options={sedeOptions}
                        value={formValues.sedeId}
                        onChange={(value) => handleFieldChange('sedeId', value)}
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
                        onChange={(value) => handleFieldChange('edificioId', value)}
                        disabled={loadingDependencies || submitting}
                      />
                    </div>

                    {/* Habitación */}
                    <div>
                      <RecursosDropdown
                        label="Habitación asignada"
                        placeholder="Elige la habitación..."
                        options={habitacionOptions}
                        value={formValues.habitacionId}
                        onChange={(value) => handleFieldChange('habitacionId', value)}
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
                        onChange={(value) => handleFieldChange('camaId', value)}
                        disabled={loadingDependencies || submitting}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. HUÉSPED Y CONTACTO */}
                <div>
                  <RecursosDropdown
                    label="Huésped principal"
                    placeholder="Elige al huésped..."
                    options={huespedDropdownOptions}
                    value={formValues.huespedId}
                    onChange={(value) => handleFieldChange('huespedId', value)}
                    error={errors.huespedId}
                    required
                    disabled={loadingDependencies || submitting}
                  />
                </div>

                {/* 4. FECHAS DE ESTADÍA */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label="Fecha y hora de entrada (Check-in)"
                    type="datetime-local"
                    value={formValues.checkIn}
                    onChange={(e) => handleFieldChange('checkIn', e.target.value)}
                    error={errors.checkIn}
                    required
                    disabled={submitting}
                  />
                  <Input
                    label="Fecha y hora de salida (Check-out)"
                    type="datetime-local"
                    value={formValues.checkOut}
                    onChange={(e) => handleFieldChange('checkOut', e.target.value)}
                    error={errors.checkOut}
                    required
                    disabled={submitting}
                  />
                </div>

                {/* 5. FINANZAS Y CONDICIONES */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <RecursosDropdown
                      label="Método de pago"
                      placeholder="Seleccionar método de pago…"
                      options={metodoPagoOpcionesEnEspanol}
                      value={normalizeMetodoPago(formValues.metodoPago)}
                      onChange={(value) => handleFieldChange('metodoPago', normalizeMetodoPago(value))}
                      error={errors.metodoPago}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <Input
                      label="Depósito de garantía (COP)"
                      type="number"
                      min={0}
                      step={10000}
                      value={formValues.depositoGarantia}
                      onChange={(e) => handleFieldChange('depositoGarantia', e.target.value)}
                      error={errors.depositoGarantia}
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <RecursosDropdown
                      label="Estado de la estadía"
                      options={estadoOptions}
                      value={formValues.estado}
                      onChange={(value) => handleFieldChange('estado', value)}
                      error={errors.estado}
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* 6. OBSERVACIONES */}
                <div className="space-y-1.5">
                  <label htmlFor="observaciones" className="block text-xs font-semibold text-ink">
                    Observaciones y requerimientos especiales (Opcional)
                  </label>
                  <textarea
                    id="observaciones"
                    rows={2}
                    value={formValues.observaciones || ''}
                    onChange={(e) => handleFieldChange('observaciones', e.target.value)}
                    placeholder="Ej. Huésped solicita almohadas hipoalergénicas o llegada fuera de horario…"
                    className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-xs text-ink placeholder:text-ink-soft focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    disabled={submitting}
                  />
                </div>

                {/* Error de Envío */}
                {submitError && (
                  <div className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-xs text-danger space-y-1">
                    <p className="font-bold">No pudimos completar el registro en este momento</p>
                    <p className="text-ink-muted">{submitError}</p>
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="flex items-center justify-end gap-3 border-t border-line/60 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || loadingDependencies}
                    className="px-6 py-2.5 shadow-md"
                  >
                    {submitting ? 'Registrando estadía…' : 'Confirmar check-in'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
