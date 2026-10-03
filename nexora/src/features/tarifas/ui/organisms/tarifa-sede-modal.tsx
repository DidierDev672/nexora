import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import {
  translateSedeStatus,
  type HeadquarterInfo,
  type SubHeadquarterInfo,
} from '../../domain/tarifa-sede';

export interface TarifaSedeModalProps {
  isOpen: boolean;
  onClose: () => void;
  headquarterId: string | null;
  sedeData: HeadquarterInfo | null;
  subSedes: SubHeadquarterInfo[];
  loading: boolean;
  sedeError: string | null;
  subSedeError: string | null;
  onRetry: () => void;
}

export function TarifaSedeModal({
  isOpen,
  onClose,
  headquarterId,
  sedeData,
  subSedes,
  loading,
  sedeError,
  subSedeError,
  onRetry,
}: TarifaSedeModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Efecto iOS ModalPresentationStyle: escala la pantalla de fondo (scale-[0.93], rounded-[24px], origin-bottom)
  useEffect(() => {
    if (!isOpen) return;
    const rootEl = document.getElementById('root');
    if (!rootEl) return;

    const prevTransition = rootEl.style.transition;
    const prevTransform = rootEl.style.transform;
    const prevBorderRadius = rootEl.style.borderRadius;
    const prevTransformOrigin = rootEl.style.transformOrigin;
    const prevOverflow = rootEl.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyBg = document.body.style.backgroundColor;

    rootEl.style.transition =
      'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), border-radius 0.4s cubic-bezier(0.32, 0.72, 0, 1)';
    rootEl.style.transformOrigin = 'bottom center';
    rootEl.style.transform = 'scale(0.93)';
    rootEl.style.borderRadius = '24px';
    rootEl.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#000000';

    return () => {
      rootEl.style.transition = prevTransition;
      rootEl.style.transform = prevTransform;
      rootEl.style.borderRadius = prevBorderRadius;
      rootEl.style.transformOrigin = prevTransformOrigin;
      rootEl.style.overflow = prevOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.backgroundColor = prevBodyBg;
    };
  }, [isOpen]);

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopy = async (text: string, fieldKey: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sede-modal-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Backdrop con desenfoque suave estilo iOS */}
          <motion.div
            key="backdrop-sede"
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
            key="modal-sede-content"
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
            className="relative z-10 max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] sm:rounded-3xl border border-stone-200 bg-white p-6 shadow-2xl sm:p-7 dark:border-stone-800 dark:bg-stone-900"
          >
            {/* Indicador de arrastre superior estilo iOS (Pill handle) */}
            <div
              className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-stone-300 dark:bg-stone-700"
              aria-hidden="true"
            />
          {/* Cabecera del modal */}
          <div className="flex items-start justify-between gap-4 border-b border-stone-100 pb-4 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary inline-flex size-8 items-center justify-center rounded-xl">
                  🏢
                </span>
                <span className="text-primary text-xs font-semibold tracking-wider uppercase">
                  Ficha de la Sede y Subsedes
                </span>
              </div>
              <h3
                id="sede-modal-title"
                className="text-ink mt-1.5 text-xl font-extrabold tracking-tight dark:text-white"
              >
                {sedeData?.name || `Sede: ${headquarterId || 'Consultando...'}`}
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

          {/* Estado de carga tipo skeleton */}
          {loading && (
            <div className="space-y-4 py-6">
              <div className="h-28 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/60" />
              <div className="h-20 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/40" />
              <div className="h-32 w-full animate-pulse rounded-2xl bg-stone-100 dark:bg-stone-800/40" />
            </div>
          )}

          {/* Mensaje de error para la sede principal si status !== 200 */}
          {!loading && sedeError && (
            <div className="my-4 rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <span className="text-base" aria-hidden="true">
                  ℹ️
                </span>
                <div className="flex-1">
                  <h4 className="font-bold">Aviso del sistema de sedes</h4>
                  <p className="mt-1 leading-relaxed">{sedeError}</p>
                </div>
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-lg bg-amber-600 px-3 py-1 font-semibold text-white shadow-2xs transition hover:bg-amber-700 active:scale-95"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {!loading && (
            <div className="space-y-6 pt-4">
              {/* SECCIÓN 1: INFORMACIÓN DE LA SEDE PRINCIPAL */}
              {sedeData && (
                <section
                  aria-labelledby="info-sede-heading"
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4
                      id="info-sede-heading"
                      className="text-xs font-bold tracking-wider text-stone-700 uppercase dark:text-stone-300"
                    >
                      Información de la Sede Principal
                    </h4>
                    {/* status en español */}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
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
                      <span>
                        Estado: {translateSedeStatus(sedeData.status)}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                    {/* name */}
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
                      <span className="block text-[11px] text-stone-700 dark:text-stone-300">
                        Nombre de la Sede
                      </span>
                      <p className="text-ink mt-1 text-sm font-bold dark:text-white">
                        {sedeData.name}
                      </p>
                    </div>

                    {/* city */}
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
                      <span className="block text-[11px] text-stone-700 dark:text-stone-300">
                        Ciudad / Ubicación
                      </span>
                      <p className="text-ink mt-1 text-sm font-bold dark:text-white">
                        {sedeData.city}
                      </p>
                    </div>

                    {/* address */}
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-stone-700 dark:text-stone-300">
                          Dirección
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(sedeData.address, 'address-sede')
                          }
                          className="text-primary text-[10px] font-semibold hover:underline"
                        >
                          {copiedField === 'address-sede'
                            ? '¡Copiado!'
                            : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-ink mt-1 font-semibold dark:text-white">
                        {sedeData.address}
                      </p>
                    </div>

                    {/* phone */}
                    <div className="rounded-2xl border border-stone-200/80 bg-stone-50/70 p-3.5 dark:border-stone-800 dark:bg-stone-800/50">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-stone-700 dark:text-stone-300">
                          Teléfono de Contacto
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(sedeData.phone, 'phone-sede')
                          }
                          className="text-primary text-[10px] font-semibold hover:underline"
                        >
                          {copiedField === 'phone-sede'
                            ? '¡Copiado!'
                            : 'Copiar'}
                        </button>
                      </div>
                      <p className="text-ink mt-1 font-semibold dark:text-white">
                        {sedeData.phone}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* SECCIÓN 2: INFORMACIÓN DE LAS SUBSEDES VINCULADAS */}
              <section aria-labelledby="subsedes-heading" className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4
                    id="subsedes-heading"
                    className="text-xs font-bold tracking-wider text-stone-700 uppercase dark:text-stone-300"
                  >
                    Subsedes Vinculadas ({subSedes.length})
                  </h4>
                </div>

                {subSedeError && (
                  <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-800/60 dark:text-stone-300">
                    <p>{subSedeError}</p>
                  </div>
                )}

                {subSedes.length === 0 && !subSedeError ? (
                  <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-center text-xs text-stone-700 dark:border-stone-800 dark:text-stone-300">
                    <span className="text-2xl" aria-hidden="true">
                      🏡
                    </span>
                    <p className="mt-2 font-medium">
                      Esta sede no cuenta con subsedes secundarias registradas.
                    </p>
                    <p className="mt-0.5 text-[11px] text-stone-600 dark:text-stone-300">
                      Todas las habitaciones y tarifas se gestionan directamente
                      en la sede principal.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {subSedes.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-2xs dark:border-stone-800 dark:bg-stone-800/70"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {/* name */}
                            <h5 className="text-ink text-sm font-bold dark:text-white">
                              {sub.name}
                            </h5>
                            <span className="font-mono text-[10px] text-stone-700 dark:text-stone-300">
                              ID: {sub.id}
                            </span>
                          </div>

                          {/* status en español */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                              sub.status.toLowerCase() === 'active'
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-stone-100 text-stone-700 ring-stone-400/20 dark:bg-stone-800 dark:text-stone-300'
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                sub.status.toLowerCase() === 'active'
                                  ? 'animate-pulse bg-emerald-500'
                                  : 'bg-stone-400'
                              }`}
                              aria-hidden="true"
                            />
                            <span>{translateSedeStatus(sub.status)}</span>
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-2 border-t border-stone-100 pt-2.5 text-xs text-stone-700 sm:grid-cols-2 dark:border-stone-700/60 dark:text-stone-300">
                          {/* address */}
                          <div>
                            <span className="block text-[10px] text-stone-700 dark:text-stone-300">
                              Dirección de la subsede
                            </span>
                            <span className="text-ink font-medium dark:text-white">
                              {sub.address}
                            </span>
                          </div>

                          {/* phone */}
                          <div>
                            <span className="block text-[10px] text-stone-700 dark:text-stone-300">
                              Teléfono de la subsede
                            </span>
                            <span className="text-ink font-medium dark:text-white">
                              {sub.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {/* Pie del modal */}
          <div className="mt-6 flex justify-end border-t border-stone-100 pt-4 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-stone-800 active:scale-95 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
            >
              Cerrar información
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
}
