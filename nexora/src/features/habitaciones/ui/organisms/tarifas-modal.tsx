import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '../atoms/button';
import { SelectField } from '../atoms/select-field';
import { useTarifasConsulta } from '../../application/use-tarifas-consulta';
import { useTarifaSede } from '../../application/use-tarifa-sede';
import { useAplicarTarifa } from '../../application/use-aplicar-tarifa';
import { Loader } from '../../../roles/ui/atoms/loader';
import {
  formatTarifaPrice,
  translateDaysOfWeek,
  translateModality,
  translateTarifaStatus,
} from '../../domain/habitacion-tarifa';

export interface TarifasModalProps {
  isOpen: boolean;
  onClose: () => void;
  hasTariff?: boolean;
  appliedRateId?: string | null;
  linkedRoom?: {
    id?: string;
    number: string;
    floor: number | string;
    hasTariff?: boolean;
    rateId?: string | null;
  };
  onTariffApplied?: (roomId: string, rateId?: string) => void;
}

export function TarifasModal({
  isOpen,
  onClose,
  linkedRoom,
  hasTariff = false,
  appliedRateId,
  onTariffApplied,
}: TarifasModalProps) {
  const isRoomWithTariff = Boolean(hasTariff || linkedRoom?.hasTariff);
  const initialRateId = appliedRateId || linkedRoom?.rateId || null;

  const {
    loading,
    rates,
    selectedRateId,
    setSelectedRateId,
    selectedRate,
    errorType,
    retry,
  } = useTarifasConsulta({ isOpen, initialRateId });

  const {
    sedeLoading,
    sedeData,
    sedeError,
    sedeStatusCode,
    subSedeLoading,
    subSedeData,
    subSedeError,
    subSedeStatusCode,
    retrySede,
    retrySubSede,
  } = useTarifaSede({
    headquarterId: selectedRate?.headquarter_id,
    isOpen: Boolean(isOpen && selectedRate),
  });

  const { isApplying, feedback, aplicarTarifa, clearFeedback } =
    useAplicarTarifa();

  const handleApplyTariff = async () => {
    if (!selectedRate || !linkedRoom?.id) return;
    const result = await aplicarTarifa({
      roomId: linkedRoom.id,
      rateId: selectedRate.id,
      tarifaNombre: selectedRate.name,
      numeroHabitacion: String(linkedRoom.number),
    });
    if (result.ok) {
      onTariffApplied?.(linkedRoom.id, selectedRate.id);
    }
  };

  // Limpiar mensajes al cerrar o cambiar de tarifa
  useEffect(() => {
    if (!isOpen) {
      clearFeedback();
    }
  }, [isOpen, selectedRateId]);

  // Cierre con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueo de scroll en el body mientras el modal está activo
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Opciones para el dropdown usando el campo 'name' solicitado
  const dropdownOptions = rates.map((rate) => ({
    value: rate.id,
    label: rate.name,
  }));

  const statusInfo = selectedRate
    ? translateTarifaStatus(selectedRate.status)
    : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-tarifas-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo con desenfoque / Backdrop */}
          <motion.div
            key="backdrop-tarifas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta de Contenido con física Spring */}
          <motion.div
            key="modal-tarifas-content"
            initial={{ y: '100%', opacity: 0.9 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.8 }}
            transition={{
              type: 'spring',
              damping: 28,
              stiffness: 280,
              mass: 0.85,
            }}
            onClick={(e) => e.stopPropagation()}
            className="border-line bg-panel relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-[32px] border p-6 shadow-2xl transition-all sm:rounded-3xl sm:p-7"
          >
            {/* Tirador táctil para móvil */}
            <div className="bg-line/80 mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full sm:hidden" />

            {/* Cabecera Superior: Habitación vinculada y Botón Cerrar */}
            <div className="border-line/70 flex items-center justify-between gap-3 border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5"
                    aria-hidden="true"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  {linkedRoom ? (
                    <span className="flex items-center gap-1.5">
                      <span>
                        Habitación{' '}
                        <strong
                          className={
                            isRoomWithTariff
                              ? 'font-extrabold text-emerald-600 dark:text-emerald-400'
                              : ''
                          }
                        >
                          {linkedRoom.number}
                        </strong>{' '}
                        · Piso {linkedRoom.floor}
                      </span>
                    </span>
                  ) : (
                    <span>Catálogo de Tarifas</span>
                  )}
                </span>

                {loading && (
                  <span className="text-ink-muted inline-flex items-center gap-1 text-[11px] font-medium">
                    <span className="inline-block size-3 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-500" />
                    <span>Cargando tarifas…</span>
                  </span>
                )}
              </div>

              {/* Botón Cerrar (X) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar modal"
                className="border-line text-ink-muted hover:border-primary/40 hover:bg-canvas hover:text-ink focus-visible:ring-primary/40 grid size-9 shrink-0 cursor-pointer place-items-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4.5"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* CUERPO DEL MODAL SEGÚN ESTADO */}
            {loading ? (
              /* 1. Estado Cargando con Skeleton Shimmer */
              <div className="mt-6 animate-pulse space-y-5">
                <div className="space-y-2">
                  <div className="bg-line/60 h-4 w-36 rounded" />
                  <div className="bg-line/40 h-10 w-full rounded-xl" />
                </div>
                <div className="bg-line/40 h-48 w-full rounded-2xl" />
                <div className="py-2 text-center">
                  <p className="text-ink-muted text-xs">
                    Consultando tarifas disponibles en el sistema…
                  </p>
                </div>
              </div>
            ) : errorType === 'server_error' ? (
              /* 2. Estado Error 500: Mensaje Psicológico y Amigable */
              <div className="mt-6 space-y-5 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-600 shadow-xs dark:text-rose-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                    Contratiempo en el servidor
                  </span>
                  <h3
                    id="modal-tarifas-title"
                    className="text-ink text-lg font-bold"
                  >
                    Se presenta un problema en el servidor
                  </h3>
                  <p className="text-ink-muted mx-auto max-w-md text-xs leading-relaxed">
                    No te preocupes, no es tu culpa: se presentó un
                    inconveniente de conexión con el servidor al intentar cargar
                    las tarifas. Tus habitaciones, precios base y registros
                    están completamente a salvo. Danos unos instantes y vuelve a
                    intentar.
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={retry}
                    className="w-full sm:w-auto"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4"
                      aria-hidden="true"
                    >
                      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                      <path d="M3 3v5h5" />
                      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                      <path d="M16 21h5v-5" />
                    </svg>
                    Reintentar conexión
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Cerrar por ahora
                  </Button>
                </div>
              </div>
            ) : errorType === 'empty' || rates.length === 0 ? (
              /* 3. Estado Vacío (Status 200 sin tarifas registradas): Mensaje Psicológico */
              <div className="mt-6 space-y-5 text-center">
                <div className="mx-auto grid size-16 place-items-center rounded-2xl border border-amber-500/25 bg-amber-500/10 text-amber-600 shadow-xs dark:text-amber-400">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-8"
                    aria-hidden="true"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                    Tarifario disponible
                  </span>
                  <h3
                    id="modal-tarifas-title"
                    className="text-ink text-lg font-bold"
                  >
                    No se encuentran tarifas registradas en el sistema
                  </h3>
                  <p className="text-ink-muted mx-auto max-w-md text-xs leading-relaxed">
                    Actualmente no encontramos planes o tarifas registradas en
                    el sistema para este establecimiento. No te preocupes: tu
                    inventario sigue funcionando con normalidad bajo el precio
                    base de cada habitación. Puedes crear y asociar tarifas
                    desde el módulo de tarifas cuando lo requieras.
                  </p>
                </div>

                {/* Nota de guía constructiva */}
                <div className="border-line/60 bg-canvas/70 text-ink-muted flex items-start gap-2.5 rounded-2xl border p-3.5 text-left text-xs">
                  <span className="text-base select-none">💡</span>
                  <p className="leading-relaxed">
                    Las tarifas te permiten definir costos diferenciados por
                    noche, días completos, horarios especiales o fines de semana
                    para optimizar tus ingresos.
                  </p>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    className="w-full sm:w-auto"
                  >
                    Entendido, cerrar
                  </Button>
                </div>
              </div>
            ) : (
              /* 4. Estado con Tarifas: Dropdown + Card detallada */
              <div className="mt-5 space-y-5">
                {/* Título de la sección y Dropdown de Tarifas (Solo visible si la habitación NO tiene tarifa aplicada) */}
                {!isRoomWithTariff ? (
                  <div className="space-y-1.5">
                    <SelectField
                      id="tarifa-dropdown-selector"
                      label="Tarifas disponibles en el sistema"
                      placeholder="Selecciona una tarifa para ver su detalle…"
                      options={dropdownOptions}
                      value={selectedRateId}
                      onChange={(e) => setSelectedRateId(e.target.value)}
                    />
                    <p className="text-ink-muted text-[11px]">
                      Selecciona una tarifa para inspeccionar todas sus
                      condiciones de cobro, horarios y vigencia.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 shadow-2xs sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-4"
                          aria-hidden="true"
                        >
                          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </span>
                      <div>
                        <span className="block text-sm font-bold text-emerald-950 dark:text-emerald-200">
                          Tarifa aplicada a esta habitación
                        </span>
                        <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                          Esta habitación ya cuenta con un plan tarifario activo
                          configurado.
                        </span>
                      </div>
                    </div>
                    <span className="bg-panel inline-flex shrink-0 items-center gap-1 self-start rounded-lg border border-emerald-500/30 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 shadow-2xs sm:self-auto dark:text-emerald-300">
                      ✓ Tarifa activa
                    </span>
                  </div>
                )}

                {/* CARD DE DETALLE DE LA TARIFA SELECCIONADA */}
                {selectedRate ? (
                  <motion.div
                    key={selectedRate.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="border-line bg-canvas/70 space-y-4 rounded-2xl border p-5 shadow-2xs"
                  >
                    {/* Hero de la Tarifa Seleccionada: Name, Price, Status */}
                    <div className="border-line/60 flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                              statusInfo?.isActive
                                ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                                : 'border-line bg-panel text-ink-muted'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                statusInfo?.isActive
                                  ? 'bg-emerald-500'
                                  : 'bg-ink-muted'
                              }`}
                            />
                            {statusInfo?.label}
                          </span>
                        </div>
                        <h4 className="text-ink mt-1 text-xl font-black tracking-tight">
                          {selectedRate.name}
                        </h4>
                        <span className="text-ink-muted text-xs">
                          Identificador: {selectedRate.id.slice(0, 12)}…
                        </span>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-ink-muted block text-[11px] font-semibold tracking-wider uppercase">
                          Precio
                        </span>
                        <span className="text-primary text-2xl font-black">
                          {formatTarifaPrice(selectedRate.price)}
                        </span>
                      </div>
                    </div>

                    {/* GRILLA CON TODOS LOS ÍTEMS REQUERIDOS */}
                    <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      {/* 1. Modalidad (traducida al español) */}
                      <div className="border-line/60 bg-panel/80 space-y-1 rounded-xl border p-3">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Modalidad
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-ink font-semibold">
                            {translateModality(selectedRate.modality)}
                          </span>
                        </div>
                      </div>

                      {/* 2. Unidades de Duración */}
                      <div className="border-line/60 bg-panel/80 space-y-1 rounded-xl border p-3">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Unidades de duración
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-ink font-semibold">
                            {selectedRate.duration_units}{' '}
                            {selectedRate.duration_units === 1
                              ? 'unidad'
                              : 'unidades'}
                          </span>
                        </div>
                      </div>

                      {/* 3. Días de la semana */}
                      <div className="border-line/60 bg-panel/80 space-y-1 rounded-xl border p-3 sm:col-span-2">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Días de aplicación
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-ink font-semibold">
                            {translateDaysOfWeek(selectedRate.days_of_week)}
                          </span>
                        </div>
                      </div>

                      {/* 4. Hora Inicio */}
                      <div className="border-line/60 bg-panel/80 space-y-1 rounded-xl border p-3">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Hora de inicio
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-ink font-medium">
                            {selectedRate.start_time ||
                              'Sin horario restringido'}
                          </span>
                        </div>
                      </div>

                      {/* 5. Hora Fin */}
                      <div className="border-line/60 bg-panel/80 space-y-1 rounded-xl border p-3">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Hora de finalización
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-ink font-medium">
                            {selectedRate.end_time || 'Sin horario restringido'}
                          </span>
                        </div>
                      </div>

                      {/* 6. Tipo de habitación */}
                      <div className="border-line/60 bg-panel/80 space-y-1 rounded-xl border p-3 sm:col-span-2">
                        <span className="text-ink-muted block text-[10px] font-bold tracking-wider uppercase">
                          Tipo de habitación
                        </span>
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className="text-ink truncate font-medium"
                            title={selectedRate.room_type_id || ''}
                          >
                            {selectedRate.room_type_id ||
                              'Aplica a todos los tipos de habitación'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SECCIÓN 1: SEDE PRINCIPAL (GET /headquarters/{id}) */}
                    <div className="border-line/60 space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                          <span>Información de la Sede</span>
                        </span>
                        {sedeLoading && (
                          <span className="text-ink-muted flex items-center gap-1 text-[11px] font-medium">
                            <span className="border-primary/30 border-t-primary inline-block size-3 animate-spin rounded-full border-2" />
                            <span>Cargando sede…</span>
                          </span>
                        )}
                      </div>

                      {!selectedRate.headquarter_id ? (
                        <div className="border-line/60 bg-panel/70 text-ink-muted flex items-start gap-2 rounded-xl border p-3 text-xs">
                          <p className="leading-relaxed">
                            Esta tarifa es de alcance global: no se encuentra
                            restringida a una sede particular y aplica a todos
                            los establecimientos.
                          </p>
                        </div>
                      ) : sedeLoading ? (
                        <div className="border-line/50 bg-panel/50 animate-pulse space-y-2 rounded-xl border p-3">
                          <div className="bg-line/60 h-4 w-40 rounded" />
                          <div className="bg-line/40 h-3 w-56 rounded" />
                          <div className="bg-line/40 h-3 w-32 rounded" />
                        </div>
                      ) : sedeError ? (
                        /* Mensaje psicológico no saturante para la sede (200 vacío, 404, 500) */
                        <div className="space-y-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200">
                              <span>⚠️</span>
                              <span>Nota sobre la sede</span>
                              {sedeStatusCode && (
                                <span className="py-0.2 rounded bg-amber-500/20 px-1.5 text-[10px] font-semibold">
                                  código {sedeStatusCode}
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={retrySede}
                              className="text-primary cursor-pointer text-[11px] font-semibold hover:underline"
                            >
                              Reintentar
                            </button>
                          </div>
                          <p className="text-ink-muted leading-relaxed">
                            {sedeError}
                          </p>
                        </div>
                      ) : sedeData ? (
                        /* Visualización de items de la sede: name, address, city, phone */
                        <div className="border-line/70 bg-panel/90 space-y-2.5 rounded-xl border p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className="text-ink truncate text-xs font-bold"
                              title={sedeData.name}
                            >
                              {sedeData.name}
                            </h5>
                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              {sedeData.city}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                            <div className="text-ink-muted flex items-start gap-1.5">
                              <span className="text-ink-soft shrink-0 font-medium">
                                Dirección:
                              </span>
                              <span
                                className="text-ink truncate"
                                title={sedeData.address}
                              >
                                {sedeData.address}
                              </span>
                            </div>
                            <div className="text-ink-muted flex items-start gap-1.5">
                              <span className="text-ink-soft shrink-0 font-medium">
                                Ciudad:
                              </span>
                              <span className="text-ink">{sedeData.city}</span>
                            </div>
                            <div className="text-ink-muted flex items-start gap-1.5 sm:col-span-2">
                              <span className="text-ink-soft shrink-0 font-medium">
                                Teléfono:
                              </span>
                              {sedeData.phone ? (
                                <a
                                  href={`tel:${sedeData.phone}`}
                                  className="text-primary font-semibold hover:underline"
                                >
                                  {sedeData.phone}
                                </a>
                              ) : (
                                <span>No registrado</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* SECCIÓN 2: SUB-SEDE VINCULADA (GET /sub-headquarters/by-headquarter/{id_headquarters}) */}
                    <div className="border-line/60 space-y-2 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-ink-muted flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase">
                          <span>Información de la Sub-Sede</span>
                        </span>
                        {subSedeLoading && (
                          <span className="text-ink-muted flex items-center gap-1 text-[11px] font-medium">
                            <span className="border-primary/30 border-t-primary inline-block size-3 animate-spin rounded-full border-2" />
                            <span>Cargando subsede…</span>
                          </span>
                        )}
                      </div>

                      {!selectedRate.headquarter_id ? (
                        <div className="border-line/60 bg-panel/70 text-ink-muted flex items-start gap-2 rounded-xl border p-3 text-xs">
                          <p className="leading-relaxed">
                            No aplica: al no estar restringida a una sede
                            particular, no depende de una subsede.
                          </p>
                        </div>
                      ) : subSedeLoading ? (
                        <div className="border-line/50 bg-panel/50 animate-pulse space-y-2 rounded-xl border p-3">
                          <div className="bg-line/60 h-4 w-40 rounded" />
                          <div className="bg-line/40 h-3 w-56 rounded" />
                        </div>
                      ) : subSedeError ? (
                        /* Mensaje psicológico no saturante para la subsede (200 vacío, 404, 500) */
                        <div className="space-y-1.5 rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-1 font-bold text-amber-800 dark:text-amber-200">
                              <span>⚠️</span>
                              <span>Nota sobre la subsede</span>
                              {subSedeStatusCode && (
                                <span className="py-0.2 rounded bg-amber-500/20 px-1.5 text-[10px] font-semibold">
                                  código {subSedeStatusCode}
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={retrySubSede}
                              className="text-primary cursor-pointer text-[11px] font-semibold hover:underline"
                            >
                              Reintentar
                            </button>
                          </div>
                          <p className="text-ink-muted leading-relaxed">
                            {subSedeError}
                          </p>
                        </div>
                      ) : subSedeData ? (
                        /* Visualización de items de la subsede: name, address, phone, status */
                        <div className="border-line/70 bg-panel/90 space-y-2.5 rounded-xl border p-3.5">
                          <div className="flex items-center justify-between gap-2">
                            <h5
                              className="text-ink truncate text-xs font-bold"
                              title={subSedeData.name}
                            >
                              {subSedeData.name}
                            </h5>
                            <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold">
                              {subSedeData.status === 'active' ||
                              subSedeData.status === 'activo'
                                ? 'Activa'
                                : subSedeData.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                            <div className="text-ink-muted flex items-start gap-1.5 sm:col-span-2">
                              <span className="text-ink-soft shrink-0 font-medium">
                                Dirección:
                              </span>
                              <span
                                className="text-ink truncate"
                                title={subSedeData.address}
                              >
                                {subSedeData.address}
                              </span>
                            </div>
                            <div className="text-ink-muted flex items-start gap-1.5">
                              <span className="text-ink-soft shrink-0 font-medium">
                                Teléfono:
                              </span>
                              {subSedeData.phone ? (
                                <a
                                  href={`tel:${subSedeData.phone}`}
                                  className="text-primary font-semibold hover:underline"
                                >
                                  {subSedeData.phone}
                                </a>
                              ) : (
                                <span>No registrado</span>
                              )}
                            </div>
                            <div className="text-ink-muted flex items-start gap-1.5">
                              <span className="text-ink-soft shrink-0 font-medium">
                                Estado:
                              </span>
                              <span className="text-ink font-semibold">
                                {subSedeData.status === 'active' ||
                                subSedeData.status === 'activo'
                                  ? 'Activa'
                                  : subSedeData.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Metadatos de auditoría (sin sección 'registrada por') */}
                    {selectedRate.created_at && (
                      <div className="border-line/60 text-ink-muted flex flex-col gap-1 border-t pt-3 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span>Fecha de registro:</span>
                          <span className="text-ink font-medium">
                            {new Date(
                              selectedRate.created_at
                            ).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="border-line bg-canvas/50 text-ink-muted rounded-2xl border border-dashed p-8 text-center text-xs">
                    Selecciona una tarifa en el selector superior para desplegar
                    toda su ficha informativa.
                  </div>
                )}

                {/* Feedback al aplicar tarifa */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`space-y-1.5 rounded-2xl border p-4 text-xs shadow-2xs ${
                      feedback.ok
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-sm font-bold">
                        <span>{feedback.ok ? '🎉' : '⚠️'}</span>
                        <span>{feedback.title}</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearFeedback}
                        className="cursor-pointer text-[11px] font-semibold underline hover:opacity-80"
                      >
                        Descartar
                      </button>
                    </div>
                    <p className="leading-relaxed">{feedback.message}</p>
                  </motion.div>
                )}

                {/* Botón de Aplicar Tarifa (oculto si ya tiene tarifa) y Botón de Cierre */}
                <div className="mt-6 flex flex-col-reverse items-center justify-end gap-3 sm:flex-row">
                  {!isRoomWithTariff && (
                    <Button
                      type="button"
                      variant="primary"
                      disabled={!selectedRate || isApplying || !linkedRoom?.id}
                      onClick={handleApplyTariff}
                      className="w-full sm:w-auto"
                    >
                      Aplicar tarifa a esta habitación
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={onClose}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Loader visible durante el envío del payload */}
          <Loader
            overlay
            visible={isApplying}
            size={36}
            label="Aplicando tarifa a la habitación…"
          >
            <span className="text-ink-soft max-w-xs text-center text-xs leading-relaxed">
              Un momento: estamos configurando el nuevo plan tarifario para esta
              habitación.
            </span>
          </Loader>
        </div>
      )}
    </AnimatePresence>
  );
}
