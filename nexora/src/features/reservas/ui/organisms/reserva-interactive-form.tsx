import { AnimatePresence, motion } from 'motion/react'
import { fadeIn, fadeUp } from '../../../../design-tokens/motion'
import { formatPrecioCOP } from '../../domain/reserva'
import { useReservaForm } from '../../application/use-reserva-form'
import { ClientSessionCard } from '../molecules/client-session-card'
import { BedDropZone } from '../molecules/bed-drop-zone'
import { StayDatePicker } from '../molecules/stay-date-picker'
import { GuestStepper } from '../atoms/guest-stepper'
import { ReservaSummaryCard } from '../molecules/reserva-summary-card'
import { Bed3DDockBar } from '../molecules/bed-3d-dock-bar'

export function ReservaInteractiveForm() {
  const {
    sessionManager,
    bedsManager,
    assignedBed,
    checkInDate,
    checkOutDate,
    numberOfGuests,
    state,
    totalPrice,
    nights,
    errors,
    submitting,
    submitError,
    submitStatusCode,
    successReserva,
    handleBedDrop,
    handleRemoveBed,
    handleDateChange,
    handleGuestChange,
    setState,
    handleSubmit,
    handleReset,
  } = useReservaForm()

  const currentGuestName =
    sessionManager.availablePersons.find(
      (p) => p.id === sessionManager.selectedPersonId,
    )?.name || sessionManager.clientSession.name

  return (
    <div className="space-y-8">
      {/* 1. Barra de Navegación 3D en la parte superior (Dock) */}
      <Bed3DDockBar
        beds={bedsManager.beds}
        assignedBedId={assignedBed?.bedId}
        loading={bedsManager.loadingBeds}
        error={bedsManager.bedsError}
        onBedSelect={handleBedDrop}
        onRetry={bedsManager.refetchBeds}
      />

      {/* 2. Pantalla de Éxito o Formulario Interactivo */}
      <AnimatePresence mode="wait">
        {successReserva ? (
          /* Pantalla de Éxito */
          <motion.div
            key="success-card"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="rounded-3xl border border-emerald-500/25 bg-panel p-8 text-center sm:p-12 shadow-md flex flex-col items-center max-w-2xl mx-auto"
          >
            <span className="grid size-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-8" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <path d="m9 11 3 3L22 4" />
              </svg>
            </span>

            <div className="mt-4 space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                ¡Reserva Garantizada · Código 201 Created!
              </span>
              <h3 className="text-2xl font-bold text-ink sm:text-3xl">
                ¡Tu estadía ha sido asegurada!
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed max-w-md">
                Hemos registrado con éxito tu alojamiento. Tu habitación y cama asignada se encuentran listas y reservadas.
              </p>
            </div>

            {/* Ficha resumen */}
            <div className="mt-6 w-full rounded-2xl border border-line bg-canvas/70 p-5 text-left text-xs space-y-2.5">
              <div className="flex justify-between items-center border-b border-line/60 pb-2">
                <span className="text-ink-muted">Alojamiento:</span>
                <strong className="text-ink font-bold">{successReserva.roomLabel}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-line/60 pb-2">
                <span className="text-ink-muted">Huésped principal:</span>
                <strong className="text-ink font-semibold">{successReserva.personLabel}</strong>
              </div>
              <div className="flex justify-between items-center border-b border-line/60 pb-2">
                <span className="text-ink-muted">Periodo:</span>
                <strong className="text-ink font-semibold">
                  {successReserva.checkInDate} al {successReserva.checkOutDate}
                </strong>
              </div>
              <div className="flex justify-between items-center border-b border-line/60 pb-2">
                <span className="text-ink-muted">Aforo:</span>
                <strong className="text-ink font-semibold">{successReserva.numberOfGuests} huéspedes</strong>
              </div>
              <div className="flex justify-between items-center pt-1 text-sm">
                <span className="font-semibold text-ink">Total pagado:</span>
                <strong className="text-primary font-extrabold text-base">
                  {formatPrecioCOP(successReserva.totalPrice)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-all active:scale-95"
            >
              <span>Registrar una nueva reserva</span>
            </button>
          </motion.div>
        ) : (
          /* Formulario en 2 Columnas */
          <motion.div
            key="interactive-form"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Columna Izquierda (8 columnas): Pasos y Asignación */}
            <div className="lg:col-span-8 space-y-6">
              {/* Alerta de Error con Status Code HTTP */}
              {submitError && (
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  role="alert"
                  className={`flex items-start gap-3 rounded-2xl border p-4 text-xs leading-relaxed ${
                    submitStatusCode === 409
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                      : 'border-danger/30 bg-danger/10 text-danger'
                  }`}
                >
                  <span className="text-base">
                    {submitStatusCode === 409 ? '⚠️' : '🚨'}
                  </span>
                  <div className="space-y-1">
                    <strong className="block font-bold">
                      {submitStatusCode
                        ? `Aviso del servidor (Código ${submitStatusCode})`
                        : 'Aviso de conexión'}
                    </strong>
                    <p>{submitError}</p>
                  </div>
                </motion.div>
              )}

              {/* Paso 1: Identidad del Cliente en Sesión */}
              <section aria-labelledby="section-client-title">
                <h3 id="section-client-title" className="sr-only">
                  Información del Cliente
                </h3>
                <ClientSessionCard
                  session={sessionManager.clientSession}
                  availablePersons={sessionManager.availablePersons}
                  isReservingForOther={sessionManager.isReservingForOther}
                  selectedPersonId={sessionManager.selectedPersonId}
                  onToggleReservingForOther={sessionManager.toggleReservingForOther}
                  onSelectPerson={sessionManager.setSelectedPersonId}
                />
              </section>

              {/* Paso 2: Zona de Soltado de la Cama 3D (Drop Zone) */}
              <section aria-labelledby="section-dropzone-title">
                <h3 id="section-dropzone-title" className="sr-only">
                  Asignación de Cama 3D
                </h3>
                <BedDropZone
                  assignedBed={assignedBed}
                  onBedDropped={handleBedDrop}
                  onRemoveBed={handleRemoveBed}
                  error={errors.bedId}
                />
              </section>

              {/* Paso 3: Fechas de Estadía */}
              <section aria-labelledby="section-dates-title" className="rounded-2xl border border-line bg-panel p-5 shadow-xs">
                <h3 id="section-dates-title" className="sr-only">
                  Periodo de Estadía
                </h3>
                <StayDatePicker
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                  nights={nights}
                  onChange={handleDateChange}
                  checkInError={errors.checkInDate}
                  checkOutError={errors.checkOutDate}
                />
              </section>

              {/* Paso 4: Stepper de Huéspedes */}
              <section aria-labelledby="section-guests-title" className="rounded-2xl border border-line bg-panel p-5 shadow-xs">
                <h3 id="section-guests-title" className="text-xs font-bold uppercase tracking-wider text-ink mb-3">
                  Número de Huéspedes <span className="text-danger">*</span>
                </h3>
                <GuestStepper
                  value={numberOfGuests}
                  onChange={handleGuestChange}
                  maxGuests={assignedBed ? assignedBed.capacity : 1}
                  hasBedAssigned={Boolean(assignedBed)}
                />
                {errors.numberOfGuests && (
                  <p role="alert" className="mt-1 text-xs font-medium text-danger">
                    {errors.numberOfGuests}
                  </p>
                )}
              </section>
            </div>

            {/* Columna Derecha (4 columnas): Resumen Dinámico Sticky */}
            <div className="lg:col-span-4">
              <ReservaSummaryCard
                clientSession={sessionManager.clientSession}
                guestName={currentGuestName}
                assignedBed={assignedBed}
                checkInDate={checkInDate}
                checkOutDate={checkOutDate}
                nights={nights}
                numberOfGuests={numberOfGuests}
                totalPrice={totalPrice}
                state={state}
                onStateChange={setState}
                submitting={submitting}
                onSubmit={handleSubmit}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
