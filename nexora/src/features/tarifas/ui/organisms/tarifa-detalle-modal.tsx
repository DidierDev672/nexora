import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  formatCurrencyCOP,
  formatHoraAmigable,
  type TarifaItemResponse,
} from '../../domain/tarifa-lista';
import {
  getSedeDisplayName,
  translateSedeStatus,
  type HeadquarterInfo,
  type SubHeadquarterInfo,
} from '../../domain/tarifa-sede';
import {
  getBedTypeDisplayName,
  formatBedCapacity,
  type BedTypeInfo,
} from '../../domain/tarifa-cama';
import {
  fetchHeadquarterById,
  fetchSubHeadquartersByHq,
} from '../../infrastructure/api-tarifa-sede-service';
import { fetchBedTypeById } from '../../infrastructure/api-tarifa-bed-service';
import {
  TarifaModalityBadge,
  TarifaStatusBadge,
} from '../molecules/tarifa-row-badge';

export interface TarifaDetalleModalProps {
  tarifa: TarifaItemResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TarifaDetalleModal({
  tarifa,
  isOpen,
  onClose,
}: TarifaDetalleModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [sedeData, setSedeData] = useState<HeadquarterInfo | null>(null);
  const [subSedes, setSubSedes] = useState<SubHeadquarterInfo[]>([]);
  const [sedeLoading, setSedeLoading] = useState(false);
  const [bedData, setBedData] = useState<BedTypeInfo | null>(null);
  const [bedLoading, setBedLoading] = useState(false);

  // Efecto de profundidad 3D iOS: Escalar contenedor raíz (#root)
  useEffect(() => {
    if (!isOpen) return;

    const root = document.getElementById('root');
    const originalRootTransform = root?.style.transform || '';
    const originalRootRadius = root?.style.borderRadius || '';
    const originalRootOrigin = root?.style.transformOrigin || '';
    const originalRootOverflow = root?.style.overflow || '';
    const originalRootTransition = root?.style.transition || '';
    const originalBodyBg = document.body.style.backgroundColor || '';
    const originalBodyOverflow = document.body.style.overflow || '';

    // Fondo negro detrás de la app para el efecto de apilamiento iOS
    document.body.style.backgroundColor = '#000000';
    document.body.style.overflow = 'hidden';

    if (root) {
      root.style.transformOrigin = 'bottom center';
      root.style.transition =
        'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
      root.style.transform = 'scale(0.93)';
      root.style.borderRadius = '24px';
      root.style.overflow = 'hidden';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.backgroundColor = originalBodyBg;
      document.body.style.overflow = originalBodyOverflow;
      if (root) {
        root.style.transform = originalRootTransform;
        root.style.borderRadius = originalRootRadius;
        root.style.transformOrigin = originalRootOrigin;
        root.style.overflow = originalRootOverflow;
        root.style.transition = originalRootTransition;
      }
    };
  }, [isOpen, onClose]);

  // Cargar detalles completos de la sede, subsedes y tipo de habitación / cama
  useEffect(() => {
    if (!isOpen || !tarifa) {
      setSedeData(null);
      setSubSedes([]);
      setBedData(null);
      return;
    }

    let isMounted = true;

    // 1. Cargar datos detallados de la sede y sus subsedes
    if (tarifa.headquarter_id) {
      setSedeLoading(true);
      Promise.all([
        fetchHeadquarterById(tarifa.headquarter_id),
        fetchSubHeadquartersByHq(tarifa.headquarter_id),
      ])
        .then(([sedeRes, subsRes]) => {
          if (!isMounted) return;
          if (sedeRes.data) {
            setSedeData(sedeRes.data);
          }
          if (subsRes.data) {
            setSubSedes(subsRes.data);
          }
        })
        .catch(() => {
          // Errores gestionados con fallback limpio
        })
        .finally(() => {
          if (isMounted) setSedeLoading(false);
        });
    }

    // 2. Cargar datos detallados del tipo de habitación / cama
    if (tarifa.room_type_id) {
      setBedLoading(true);
      fetchBedTypeById(tarifa.room_type_id)
        .then((bedRes) => {
          if (!isMounted) return;
          if (bedRes.data) {
            setBedData(bedRes.data);
          }
        })
        .catch(() => {
          // Fallback limpio
        })
        .finally(() => {
          if (isMounted) setBedLoading(false);
        });
    } else {
      setBedData(null);
      setBedLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, tarifa?.headquarter_id, tarifa?.room_type_id]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Fallback silencioso
    }
  };

  return (
    <AnimatePresence>
      {isOpen && tarifa && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="tarifa-detalle-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop con desenfoque suave estilo iOS */}
          <motion.div
            key="backdrop-detalle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Modal animado: Tarjeta estilo iOS (desliza desde abajo con física Spring) */}
          <motion.div
            key="modal-detalle-content"
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
            className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] border border-stone-200 bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-7 dark:border-stone-800 dark:bg-stone-900"
          >
            {/* Indicador de arrastre superior estilo iOS (Pill handle) */}
            <div
              className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700"
              aria-hidden="true"
            />

            {/* Cabecera */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <TarifaStatusBadge status={tarifa.status} />
                  <TarifaModalityBadge modality={tarifa.modality} />
                </div>
                <h3
                  id="tarifa-detalle-title"
                  className="text-ink mt-2 text-xl font-extrabold tracking-tight dark:text-white"
                >
                  {tarifa.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="hover:text-ink rounded-xl p-2 text-stone-700 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Precio prominente en COP */}
            <div className="mt-4 rounded-2xl border border-stone-100 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-800/60">
              <span className="text-[11px] font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
                Valor de la tarifa comercial
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-ink text-3xl font-black dark:text-white">
                  {formatCurrencyCOP(tarifa.price)}
                </span>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {/* SECCIÓN 1: SEDE ASIGNADA (DETALLE COMPLETO) */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/60 p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-800/40">
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 dark:border-stone-700/60">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary inline-flex size-7 items-center justify-center rounded-lg text-sm">
                      🏢
                    </span>
                    <h4 className="text-ink text-xs font-bold tracking-wider uppercase dark:text-white">
                      Sede Asignada
                    </h4>
                  </div>
                  {sedeData && (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                        sedeData.status.toLowerCase() === 'active'
                          ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-700 ring-stone-400/20 dark:bg-stone-800 dark:text-stone-300'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          sedeData.status.toLowerCase() === 'active'
                            ? 'animate-pulse bg-emerald-500'
                            : 'bg-stone-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{translateSedeStatus(sedeData.status)}</span>
                    </span>
                  )}
                </div>

                {sedeLoading ? (
                  <div className="mt-3.5 space-y-2.5">
                    <div className="h-5 w-3/4 animate-pulse rounded-lg bg-stone-200/70 dark:bg-stone-700/60" />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div className="h-14 animate-pulse rounded-xl bg-stone-200/50 dark:bg-stone-700/40" />
                      <div className="h-14 animate-pulse rounded-xl bg-stone-200/50 dark:bg-stone-700/40" />
                      <div className="h-14 animate-pulse rounded-xl bg-stone-200/50 dark:bg-stone-700/40" />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3.5 space-y-3">
                    <div>
                      <span className="text-[10px] font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
                        Nombre de la Sede
                      </span>
                      <p className="text-ink mt-0.5 text-base font-extrabold dark:text-white">
                        {sedeData?.name ||
                          getSedeDisplayName(tarifa.headquarter_id)}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-2.5 text-xs sm:grid-cols-3">
                      {/* Ciudad */}
                      <div className="rounded-xl border border-stone-200/80 bg-white p-3 dark:border-stone-700/80 dark:bg-stone-800/80">
                        <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                          Ciudad / Ubicación
                        </span>
                        <p className="text-ink mt-0.5 font-bold dark:text-white">
                          {sedeData?.city || 'No especificada'}
                        </p>
                      </div>

                      {/* Dirección */}
                      <div className="rounded-xl border border-stone-200/80 bg-white p-3 dark:border-stone-700/80 dark:bg-stone-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                            Dirección
                          </span>
                          {sedeData?.address && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(sedeData.address, 'sede-address')
                              }
                              className="text-primary text-[10px] font-semibold hover:underline"
                            >
                              {copiedKey === 'sede-address'
                                ? '✓ Copiado'
                                : 'Copiar'}
                            </button>
                          )}
                        </div>
                        <p
                          className="text-ink mt-0.5 truncate font-bold dark:text-white"
                          title={sedeData?.address}
                        >
                          {sedeData?.address || 'No especificada'}
                        </p>
                      </div>

                      {/* Teléfono */}
                      <div className="rounded-xl border border-stone-200/80 bg-white p-3 dark:border-stone-700/80 dark:bg-stone-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                            Teléfono
                          </span>
                          {sedeData?.phone && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(sedeData.phone, 'sede-phone')
                              }
                              className="text-primary text-[10px] font-semibold hover:underline"
                            >
                              {copiedKey === 'sede-phone'
                                ? '✓ Copiado'
                                : 'Copiar'}
                            </button>
                          )}
                        </div>
                        <p className="text-ink mt-0.5 font-bold dark:text-white">
                          {sedeData?.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>

                    {/* Subsedes vinculadas */}
                    {subSedes.length > 0 ? (
                      <div className="rounded-xl border border-stone-200/70 bg-white/70 p-3 dark:border-stone-700/60 dark:bg-stone-800/60">
                        <span className="text-[10px] font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
                          Subsedes Vinculadas ({subSedes.length})
                        </span>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {subSedes.map((sub) => (
                            <span
                              key={sub.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-medium text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200"
                            >
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              <span>{sub.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-stone-700 dark:text-stone-300">
                        <span>Sede central sin subsedes secundarias.</span>
                        <span className="font-mono text-[10px]">
                          ID: {tarifa.headquarter_id}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECCIÓN 2: TIPO DE HABITACIÓN / CAMA (DETALLE COMPLETO) */}
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/60 p-4 sm:p-5 dark:border-stone-800 dark:bg-stone-800/40">
                <div className="flex items-center justify-between border-b border-stone-200/70 pb-3 dark:border-stone-700/60">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-50 text-sm text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      🛏️
                    </span>
                    <h4 className="text-ink text-xs font-bold tracking-wider uppercase dark:text-white">
                      Tipo de Habitación y Cama
                    </h4>
                  </div>
                  {bedData ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-500/20 ring-inset dark:bg-indigo-950/40 dark:text-indigo-300">
                      <span>👥</span>
                      <span>{formatBedCapacity(bedData.capacity_people)}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 ring-1 ring-stone-300/30 ring-inset dark:bg-stone-800 dark:text-stone-300">
                      <span>✨ Universal</span>
                    </span>
                  )}
                </div>

                {bedLoading ? (
                  <div className="mt-3.5 space-y-2.5">
                    <div className="h-5 w-1/2 animate-pulse rounded-lg bg-stone-200/70 dark:bg-stone-700/60" />
                    <div className="h-12 animate-pulse rounded-xl bg-stone-200/50 dark:bg-stone-700/40" />
                  </div>
                ) : tarifa.room_type_id ? (
                  <div className="mt-3.5 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-[10px] font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
                          Denominación de la Cama
                        </span>
                        <p className="text-ink mt-0.5 text-base font-extrabold dark:text-white">
                          {bedData?.name ||
                            getBedTypeDisplayName(tarifa.room_type_id)}
                        </p>
                      </div>
                      {bedData && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {Array.from({
                            length: Math.min(
                              6,
                              Math.max(1, bedData.capacity_people)
                            ),
                          }).map((_, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200/80 bg-white px-2 py-0.5 text-[11px] font-semibold text-indigo-900 shadow-2xs dark:border-indigo-800 dark:bg-stone-800 dark:text-indigo-200"
                            >
                              <span>👤</span>
                              <span>Huésped {i + 1}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Descripción y confort */}
                    {bedData?.description && (
                      <div className="rounded-xl border border-stone-200/80 bg-white p-3 dark:border-stone-700/80 dark:bg-stone-800/80">
                        <span className="text-[10px] font-semibold tracking-wider text-stone-700 uppercase dark:text-stone-300">
                          Descripción y Confort
                        </span>
                        <p className="text-ink mt-1 text-xs leading-relaxed dark:text-stone-200">
                          {bedData.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3.5 rounded-xl border border-stone-200/80 bg-white p-4 text-center dark:border-stone-700/80 dark:bg-stone-800/80">
                    <span className="text-2xl" aria-hidden="true">
                      ✨
                    </span>
                    <h5 className="text-ink mt-1 text-sm font-bold dark:text-white">
                      Aplica a Todos los Tipos de Habitación y Cama
                    </h5>
                    <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-stone-700 dark:text-stone-300">
                      Esta tarifa posee un alcance <strong>general</strong>. No
                      se encuentra limitada a una tipología de cama específica y
                      puede aplicarse de manera uniforme a camas matrimoniales,
                      dobles, individuales o suites según disponibilidad.
                    </p>
                  </div>
                )}
              </div>

              {/* SECCIÓN 3: CONDICIONES DE HORARIO Y VIGENCIA */}
              <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
                {/* Horario de inicio */}
                <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-800/40">
                  <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                    Hora de Inicio
                  </span>
                  <p className="text-ink mt-0.5 font-bold dark:text-white">
                    {formatHoraAmigable(tarifa.start_time)}
                  </p>
                </div>

                {/* Horario de fin */}
                <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-800/40">
                  <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                    Hora de Fin
                  </span>
                  <p className="text-ink mt-0.5 font-bold dark:text-white">
                    {formatHoraAmigable(tarifa.end_time)}
                  </p>
                </div>

                {/* Días aplicables */}
                <div className="rounded-xl border border-stone-100 bg-stone-50/50 p-3 dark:border-stone-800 dark:bg-stone-800/40">
                  <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">
                    Días de la Semana
                  </span>
                  <p className="text-ink mt-0.5 font-bold dark:text-white">
                    {tarifa.days_of_week === 'all'
                      ? 'Todos los días'
                      : tarifa.days_of_week === 'weekend'
                        ? 'Fines de semana'
                        : tarifa.days_of_week === 'weekday'
                          ? 'Entre semana'
                          : tarifa.days_of_week}
                  </p>
                </div>
              </div>
            </div>

            {/* Pie del modal */}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
              >
                Cerrar detalle
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
