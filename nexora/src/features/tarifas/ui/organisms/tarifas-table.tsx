import { useEffect, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { Loader } from '../../../tema/ui/atoms/loader';
import {
  formatHoraAmigable,
  type StatusCodePsychology,
  type TarifaItemResponse,
} from '../../domain/tarifa-lista';
import { getSedeDisplayName } from '../../domain/tarifa-sede';
import { fetchHeadquarterNamesMap } from '../../infrastructure/api-tarifa-sede-service';
import {
  actualizarTarifa,
  buildUpdateTarifaPayload,
} from '../../infrastructure/api-tarifa-service';
import {
  TarifaModalityBadge,
  TarifaPriceBadge,
} from '../molecules/tarifa-row-badge';
import { TarifaStatusFeedbackBanner } from '../molecules/tarifa-status-feedback-banner';
import { useTarifaSedeModal } from '../../application/use-tarifa-sede-modal';
import { TarifaSedeModal } from './tarifa-sede-modal';
import { useTarifaBedModal } from '../../application/use-tarifa-bed-modal';
import { TarifaBedModal } from './tarifa-bed-modal';
import { getBedTypeDisplayName } from '../../domain/tarifa-cama';
import { fetchBedTypeNamesMap } from '../../infrastructure/api-tarifa-bed-service';
import type { TarifaViewMode } from '../molecules/tarifas-view-mode-toggle';

const SWITCH_SPRING_CONFIG = {
  type: 'spring',
  stiffness: 500,
  damping: 30,
} as const;

/**
 * Variantes de Stagger Reveal (Revelado Escalonado) en Framer Motion
 * El contenedor propaga automáticamente los estados 'hidden' y 'visible'
 * aplicando staggerChildren en cada fila o tarjeta.
 */
const TABLE_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
};

const TABLE_ROW_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      damping: 26,
      stiffness: 300,
      mass: 0.8,
    },
  },
};

export interface TarifasTableProps {
  rates: TarifaItemResponse[];
  isLoading: boolean;
  onSelectTarifa: (tarifa: TarifaItemResponse) => void;
  onResetFilters: () => void;
  onRateUpdated?: (tarifa: TarifaItemResponse) => void;
  viewMode?: TarifaViewMode;
  onViewModeChange?: (mode: TarifaViewMode) => void;
}

export function TarifasTable({
  rates,
  isLoading,
  onSelectTarifa,
  onResetFilters,
  onRateUpdated,
  viewMode: propViewMode,
}: TarifasTableProps) {
  const [internalViewMode] =
    useState<TarifaViewMode>('cards');
  const activeViewMode = propViewMode ?? internalViewMode;
  const [sedesNamesMap, setSedesNamesMap] = useState<Record<string, string>>(
    {}
  );
  const [bedTypesNamesMap, setBedTypesNamesMap] = useState<
    Record<string, string>
  >({});

  // Sincronización de tarifas locales para actualización inmediata de la interfaz
  const [localRates, setLocalRates] = useState<TarifaItemResponse[]>(rates);
  useEffect(() => {
    setLocalRates(rates);
  }, [rates]);

  // Control de estado modificado por switch (rateId -> 'active' | 'inactive')
  const [selectedStatusMap, setSelectedStatusMap] = useState<
    Record<string, 'active' | 'inactive'>
  >({});

  // Estados para loader.tsx y feedback con psicología del usuario
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updatingTarifaName, setUpdatingTarifaName] = useState<string>('');
  const [updateFeedback, setUpdateFeedback] =
    useState<StatusCodePsychology | null>(null);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState<boolean>(false);

  /**
   * Alterna el estado de la tarifa mediante el switch interactivo
   */
  const handleToggleSwitch = (rateId: string, currentSavedStatus: string) => {
    const current =
      selectedStatusMap[rateId] ??
      (currentSavedStatus.toLowerCase() === 'active' ? 'active' : 'inactive');
    const next = current === 'active' ? 'inactive' : 'active';
    setSelectedStatusMap((prev) => ({
      ...prev,
      [rateId]: next,
    }));
  };

  /**
   * Aplica la actualización de la tarifa en segundo plano construyendo el payload
   * y evaluando los status codes HTTP (200, 400, 404, 422, 500) con psicología.
   */
  const handleAplicarActualizacion = async (rate: TarifaItemResponse) => {
    const targetStatus =
      selectedStatusMap[rate.id] ??
      (rate.status.toLowerCase() === 'active' ? 'active' : 'inactive');

    // 1. Mostrar en pantalla el componente loader.tsx
    setIsUpdating(true);
    setUpdatingTarifaName(rate.name);
    setUpdateFeedback(null);

    // 2. Construir en segundo plano el payload exacto solicitado
    const payload = buildUpdateTarifaPayload(rate, targetStatus);

    try {
      // 3. Enviar al endpoint /rates/{id} con PUT y evaluar switch de status codes
      const result = await actualizarTarifa(rate.id, payload, rate.name);

      // 4. Mostrar el mensaje con psicología en pantalla
      setUpdateFeedback(result.feedback);
      setShowFeedbackBanner(true);

      // 5. Si fue exitoso (200), reflejar el cambio en la tabla y notificar
      if (result.success) {
        const updatedRate: TarifaItemResponse = {
          ...rate,
          status: targetStatus,
          updated_at: new Date().toISOString(),
        };
        setLocalRates((prev) =>
          prev.map((r) => (r.id === rate.id ? updatedRate : r))
        );
        onRateUpdated?.(updatedRate);

        // Limpiamos el cambio pendiente para esa tarifa
        setSelectedStatusMap((prev) => {
          const next = { ...prev };
          delete next[rate.id];
          return next;
        });
      }
    } catch {
      setUpdateFeedback({
        statusCode: 0,
        type: 'error',
        title: 'Pausa momentánea en la sincronización',
        message:
          'No pudimos conectar con el servidor en este instante. Tu tarifa permanece a salvo.',
        subtext: 'Verifica tu red o pulsa reintentar en unos segundos.',
        suggestedActionLabel: 'Reintentar',
      });
      setShowFeedbackBanner(true);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    void fetchHeadquarterNamesMap().then((map) => {
      if (isMounted) setSedesNamesMap(map);
    });
    void fetchBedTypeNamesMap().then((map) => {
      if (isMounted) setBedTypesNamesMap(map);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    isOpen: isSedeModalOpen,
    headquarterId: selectedHqId,
    sedeData,
    subSedes,
    loading: sedeLoading,
    sedeError,
    subSedeError,
    openSedeModal,
    closeModal: closeSedeModal,
    refetch: refetchSede,
  } = useTarifaSedeModal();

  const {
    isOpen: isBedModalOpen,
    bedId: selectedBedId,
    isGeneral: isBedGeneral,
    bedData,
    loading: bedLoading,
    errorMessage: bedErrorMessage,
    openBedModal,
    closeModal: closeBedModal,
    refetch: refetchBed,
  } = useTarifaBedModal();

  /**
   * Renderiza una tarjeta individual de tarifa reutilizable para vista en cartas y vista móvil
   */
  const renderTarifaCard = (rate: TarifaItemResponse) => {
    const savedIsActive = rate.status.toLowerCase() === 'active';
    const currentSelectedStatus =
      selectedStatusMap[rate.id] ?? (savedIsActive ? 'active' : 'inactive');
    const isActive = currentSelectedStatus === 'active';
    const isPendingUpdate =
      selectedStatusMap[rate.id] !== undefined &&
      currentSelectedStatus !== (savedIsActive ? 'active' : 'inactive');

    return (
      <motion.div
        key={rate.id}
        variants={TABLE_ROW_VARIANTS}
        className="flex flex-col justify-between rounded-3xl border border-stone-200/80 bg-white p-4 shadow-xs transition hover:shadow-md dark:border-stone-800 dark:bg-stone-900/90"
      >
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-ink text-base font-bold dark:text-white">
                {rate.name}
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => handleToggleSwitch(rate.id, rate.status)}
                className={`focus-visible:ring-primary/40 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 active:scale-95 ${
                  isActive
                    ? 'justify-end bg-emerald-500'
                    : 'justify-start bg-stone-300 dark:bg-stone-700'
                }`}
                title={`Haz clic para cambiar a ${isActive ? 'Inactiva' : 'Activa'}`}
              >
                <motion.span
                  layout
                  transition={SWITCH_SPRING_CONFIG}
                  className="inline-block size-5 rounded-full bg-white shadow-md"
                />
              </button>
              <div className="flex flex-col">
                <span
                  className={`text-xs font-bold transition-colors ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {isActive ? 'Activa' : 'Inactiva'}
                </span>
                {isPendingUpdate && (
                  <span className="animate-pulse text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    Por aplicar
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-y border-stone-100 py-3 dark:border-stone-800/80">
            <TarifaModalityBadge modality={rate.modality} />
            <TarifaPriceBadge price={rate.price} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-stone-700 dark:text-stone-300">
            <div>
              <button
                type="button"
                onClick={() => openSedeModal(rate.headquarter_id)}
                className="group/mobilesede text-primary mt-0.5 block cursor-pointer text-left text-xs font-bold hover:underline"
                title={`Haz clic para ver detalles de ${getSedeDisplayName(rate.headquarter_id, sedesNamesMap)}`}
              >
                <span className="block truncate">
                  {getSedeDisplayName(rate.headquarter_id, sedesNamesMap)} ↗
                </span>
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => openBedModal(rate.room_type_id)}
                className="group/mobilebed mt-0.5 block cursor-pointer text-left text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                title="Haz clic para ver las especificaciones del tipo de cama"
              >
                <span className="text-ink block truncate font-bold dark:text-white">
                  {getBedTypeDisplayName(rate.room_type_id, bedTypesNamesMap)} ↗
                </span>
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between rounded-xl bg-stone-50/80 px-3 py-2 text-[11px] dark:bg-stone-800/40">
            <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
              Horario:
            </span>
            <span className="text-ink font-semibold dark:text-white">
              {formatHoraAmigable(rate.start_time)} hasta{' '}
              {formatHoraAmigable(rate.end_time)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex justify-end border-t border-stone-100 pt-3 dark:border-stone-800">
          {isPendingUpdate ? (
            <button
              type="button"
              onClick={() => void handleAplicarActualizacion(rate)}
              className="bg-primary hover:bg-primary-hover inline-flex w-full animate-pulse items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white shadow-xs transition active:scale-95"
            >
              <span>Aplicar actualización</span>
              <span>✓</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTarifa(rate)}
              className="hover:border-primary/50 hover:text-primary inline-flex w-full items-center justify-center gap-1 rounded-xl border border-stone-200 bg-white py-2 text-xs font-semibold text-stone-700 shadow-2xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
            >
              <span>Ver ficha</span>
              <span>→</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-12 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/60" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/40"
          />
        ))}
      </div>
    );
  }

  if (rates.length === 0) {
    return (
      <div className="rounded-3xl border border-stone-200 bg-stone-50/50 p-10 text-center shadow-xs dark:border-stone-800 dark:bg-stone-900/40">
        <span className="text-4xl" aria-hidden="true">
          🏷️
        </span>
        <h4 className="text-ink mt-3 text-base font-bold dark:text-white">
          No encontramos tarifas que coincidan con la búsqueda
        </h4>
        <p className="mx-auto mt-1 max-w-md text-xs text-stone-700 dark:text-stone-300">
          Tus datos están completamente intactos. Puedes modificar el texto o
          los filtros de modalidad y estado para visualizar los resultados
          disponibles.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="bg-primary hover:bg-primary-hover mt-4 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-xs transition active:scale-95"
        >
          Mostrar todas las tarifas
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Componente reutilizable Loader con overlay y label psicológico de tranquilidad */}
      <Loader
        overlay
        visible={isUpdating}
        label={`Aplicando actualización a «${updatingTarifaName}» con total seguridad…`}
      />

      {/* Banner de retroalimentación psicológica con validación de status code en pantalla */}
      <TarifaStatusFeedbackBanner
        feedback={updateFeedback}
        visible={showFeedbackBanner}
        onClose={() => setShowFeedbackBanner(false)}
        onActionClick={() => setShowFeedbackBanner(false)}
      />

      {/* Visualización mutuamente excluyente: Solo Tabla o Solo Cartas */}
      {activeViewMode === 'table' ? (
        /* Vista Exclusiva de Tabla (Solo se visualiza la tabla, sin cartas) */
        <div
          key="table-view"
          className="overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-xs dark:border-stone-800 dark:bg-stone-900/90"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-100 bg-stone-50/90 text-stone-700 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300">
                <tr>
                  <th scope="col" className="px-5 py-4 font-semibold">
                    Nombre de Tarifa
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Sede
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Habitación
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Modalidad
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Precio
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Horario
                  </th>
                  <th scope="col" className="px-4 py-4 font-semibold">
                    Estado
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-4 text-right font-semibold"
                  >
                    Detalles
                  </th>
                </tr>
              </thead>
              <motion.tbody
                variants={TABLE_CONTAINER_VARIANTS}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.05 }}
                className="divide-y divide-stone-100 dark:divide-stone-800/80"
              >
                {localRates.map((rate) => {
                  const savedIsActive = rate.status.toLowerCase() === 'active';
                  const currentSelectedStatus =
                    selectedStatusMap[rate.id] ??
                    (savedIsActive ? 'active' : 'inactive');
                  const isActive = currentSelectedStatus === 'active';
                  const isPendingUpdate =
                    selectedStatusMap[rate.id] !== undefined &&
                    currentSelectedStatus !==
                      (savedIsActive ? 'active' : 'inactive');

                  return (
                    <motion.tr
                      key={rate.id}
                      variants={TABLE_ROW_VARIANTS}
                      className="group transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-800/40"
                    >
                      {/* name */}
                      <td className="text-ink px-5 py-4 font-medium dark:text-white">
                        <div className="flex flex-col">
                          <span className="group-hover:text-primary text-sm font-bold transition-colors">
                            {rate.name}
                          </span>
                        </div>
                      </td>

                      {/* Sede: Nombre de la sede con indicador interactivo y modal */}
                      <td className="px-4 py-4 text-stone-700 dark:text-stone-300">
                        <button
                          type="button"
                          onClick={() => openSedeModal(rate.headquarter_id)}
                          className="group/sede hover:bg-primary/10 inline-flex max-w-[220px] cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition active:scale-95"
                          title={`Haz clic para ver detalles y subsedes de: ${getSedeDisplayName(rate.headquarter_id, sedesNamesMap)} (ID: ${rate.headquarter_id})`}
                        >
                          <span className="bg-primary/70 group-hover/sede:bg-primary ring-primary/20 group-hover/sede:ring-primary/40 inline-block size-2 shrink-0 rounded-full ring-2 transition" />
                          <div className="flex min-w-0 flex-col">
                            <span className="text-ink group-hover/sede:text-primary decoration-primary/40 truncate text-xs font-bold underline decoration-dotted underline-offset-2 dark:text-white">
                              {getSedeDisplayName(
                                rate.headquarter_id,
                                sedesNamesMap
                              )}
                            </span>
                          </div>
                          <span className="text-primary/70 group-hover/sede:text-primary ml-0.5 shrink-0 text-[10px] font-bold">
                            ↗
                          </span>
                        </button>
                      </td>

                      {/* Habitación / Tipo de cama con nombre legible y modal interactivo */}
                      <td className="px-4 py-4 text-stone-700 dark:text-stone-300">
                        {rate.room_type_id ? (
                          <button
                            type="button"
                            onClick={() => openBedModal(rate.room_type_id)}
                            className="group/bed inline-flex max-w-[220px] cursor-pointer items-center gap-2 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-indigo-50/80 active:scale-95 dark:hover:bg-indigo-950/40"
                            title={`Haz clic para ver las especificaciones de cama de: ${getBedTypeDisplayName(rate.room_type_id, bedTypesNamesMap)} (ID: ${rate.room_type_id})`}
                          >
                            <span className="inline-block size-2 shrink-0 rounded-full bg-indigo-500/70 ring-2 ring-indigo-500/20 transition group-hover/bed:bg-indigo-500 group-hover/bed:ring-indigo-500/40" />
                            <div className="flex min-w-0 flex-col">
                              <span className="text-ink truncate text-xs font-bold underline decoration-indigo-400/40 decoration-dotted underline-offset-2 group-hover/bed:text-indigo-600 dark:text-white dark:group-hover/bed:text-indigo-400">
                                {getBedTypeDisplayName(
                                  rate.room_type_id,
                                  bedTypesNamesMap
                                )}
                              </span>
                            </div>
                            <span className="ml-0.5 shrink-0 text-[10px] font-bold text-indigo-600/70 group-hover/bed:text-indigo-600 dark:text-indigo-400">
                              ↗
                            </span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openBedModal(null)}
                            className="group/bed hover:text-ink inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed border-stone-200 px-2.5 py-1.5 text-left text-xs font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                            title="Haz clic para ver el alcance universal de esta tarifa"
                          >
                            <span className="inline-block size-2 rounded-full bg-stone-300 dark:bg-stone-600" />
                            <span className="italic">General / Todas</span>
                            <span className="text-[10px] opacity-70">↗</span>
                          </button>
                        )}
                      </td>

                      {/* modality (en español) */}
                      <td className="px-4 py-4">
                        <TarifaModalityBadge modality={rate.modality} />
                      </td>

                      {/* price (formato moneda colombiana) */}
                      <td className="px-4 py-4">
                        <TarifaPriceBadge price={rate.price} />
                      </td>

                      {/* start_time - end_time */}
                      <td className="px-4 py-4 text-stone-700 dark:text-stone-300">
                        <div className="flex flex-col text-[11px]">
                          <span className="text-ink font-medium dark:text-white">
                            {formatHoraAmigable(rate.start_time)}
                          </span>
                          <span className="text-stone-700 dark:text-stone-300">
                            hasta {formatHoraAmigable(rate.end_time)}
                          </span>
                        </div>
                      </td>

                      {/* status con switch interactivo (Activa / Inactiva) */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            onClick={() =>
                              handleToggleSwitch(rate.id, rate.status)
                            }
                            className={`focus-visible:ring-primary/40 relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-hidden focus-visible:ring-2 active:scale-95 ${
                              isActive
                                ? 'justify-end bg-emerald-500'
                                : 'justify-start bg-stone-300 dark:bg-stone-700'
                            }`}
                            title={`Haz clic para cambiar a ${isActive ? 'Inactiva' : 'Activa'}`}
                          >
                            <motion.span
                              layout
                              transition={SWITCH_SPRING_CONFIG}
                              className="inline-block size-5 rounded-full bg-white shadow-md"
                            />
                          </button>

                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-bold transition-colors ${
                                isActive
                                  ? 'text-emerald-700 dark:text-emerald-300'
                                  : 'text-stone-700 dark:text-stone-300'
                              }`}
                            >
                              {isActive ? 'Activa' : 'Inactiva'}
                            </span>
                            {isPendingUpdate && (
                              <span className="animate-pulse text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                                Por aplicar
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Acciones: Cambia a "Aplicar actualización" si el switch fue modificado */}
                      <td className="px-5 py-4 text-right">
                        {isPendingUpdate ? (
                          <button
                            type="button"
                            onClick={() =>
                              void handleAplicarActualizacion(rate)
                            }
                            className="bg-primary hover:bg-primary-hover border-primary inline-flex animate-pulse items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95"
                            title="Aplica la actualización de estado a esta tarifa"
                          >
                            <span>Aplicar actualización</span>
                            <span>✓</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onSelectTarifa(rate)}
                            className="hover:border-primary/50 hover:text-primary inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-2xs transition hover:bg-stone-50 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                          >
                            <span>Ver ficha</span>
                            <span>→</span>
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Vista Exclusiva de Cartas (Solo se visualizan las cartas, la tabla desaparece por completo) */
        <motion.div
          key="cards-view"
          variants={TABLE_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.05 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {localRates.map((rate) => renderTarifaCard(rate))}
        </motion.div>
      )}

      {/* Modal interactivo de Sede y Subsedes con switch de status code y sin mensaje en 200 */}
      <TarifaSedeModal
        isOpen={isSedeModalOpen}
        onClose={closeSedeModal}
        headquarterId={selectedHqId}
        sedeData={sedeData}
        subSedes={subSedes}
        loading={sedeLoading}
        sedeError={sedeError}
        subSedeError={subSedeError}
        onRetry={refetchSede}
      />

      {/* Modal interactivo de Detalle del Tipo de Cama (GET /types-bed/{id}) */}
      <TarifaBedModal
        isOpen={isBedModalOpen}
        onClose={closeBedModal}
        bedId={selectedBedId}
        bedData={bedData}
        isGeneral={isBedGeneral}
        loading={bedLoading}
        errorMessage={bedErrorMessage}
        onRetry={refetchBed}
      />
    </div>
  );
}
