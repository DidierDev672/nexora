import { motion } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { Button } from '../../../recursos/ui/atoms/button'
import { Loader } from '../../../roles/ui/atoms/loader'
import { useRecepcionForm } from '../../application/use-recepcion-form'
import { RecepcionCardForm } from '../molecules/recepcion-card-form'
import { RecepcionSuccess } from '../molecules/recepcion-success'

export function RecepcionPanel() {
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
    loadDependencies,
  } = useRecepcionForm()

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      aria-label="Panel de registro de recepciones"
      className="w-full"
    >
      {/* Loader visual durante el guardado */}
      <Loader
        overlay
        visible={submitting}
        size={36}
        label="Registrando la recepción y asignando habitación…"
      />

      {/* Error de dependencias si falla la carga inicial */}
      {dependencyError && !successRecepcion && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          role="alert"
          className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-300"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-5"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <p className="text-sm font-medium leading-relaxed">{dependencyError}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void loadDependencies()}
            disabled={loadingDependencies}
            className="text-xs shrink-0"
          >
            {loadingDependencies ? 'Cargando…' : 'Volver a intentar'}
          </Button>
        </motion.div>
      )}

      {/* Pantalla de Éxito o Formulario */}
      {successRecepcion ? (
        <RecepcionSuccess recepcion={successRecepcion} onReset={handleReset} />
      ) : (
        <>
          <RecepcionCardForm
            formValues={formValues}
            errors={errors}
            sedeOptions={sedeOptions}
            edificioOptions={edificioOptions}
            habitacionDropdownOptions={habitacionOptions}
            camaOptions={camaOptions}
            reservaDropdownOptions={reservaDropdownOptions}
            huespedDropdownOptions={huespedDropdownOptions}
            metodoPagoOptions={metodoPagoOptions}
            estadoOptions={estadoOptions}
            loadingDependencies={loadingDependencies}
            submitting={submitting}
            syncNotice={syncNotice}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
          />

          {submitError && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              role="alert"
              className="mt-6 flex flex-col sm:flex-row items-start gap-3.5 rounded-2xl border border-danger/25 bg-danger/5 p-4 sm:p-5 text-ink"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-danger/15 text-danger">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-5"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-ink">
                  No pudimos completar el registro en este momento
                </p>
                <p className="text-xs leading-relaxed text-ink-muted">
                  {submitError}
                </p>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.section>
  )
}
