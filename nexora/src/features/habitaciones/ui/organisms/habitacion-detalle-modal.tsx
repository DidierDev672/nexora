import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Button } from '../atoms/button';
import { HabitacionStatusBadge } from '../molecules/habitacion-status-badge';
import type { RoomRow } from '../../domain/habitacion-lista';
import { api } from '../../../../lib/api';

export interface HabitacionDetalleModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomRow | null;
  hasTariff?: boolean;
  tariffPrice?: number | null;
  tariffName?: string | null;
  rateId?: string | null;
  onOpenTarifas?: (room: {
    id?: string;
    number: string;
    floor: number | string;
    hasTariff?: boolean;
    rateId?: string | null;
  }) => void;
  onOpenBed?: (bedId: string | null, summary?: RoomRow['bed']) => void;
  onOpenBuilding?: (buildingId: string, summary?: RoomRow['building']) => void;
}

interface RoomExtraDetails {
  description?: string;
  createdBy?: string;
  headquarterId?: string;
  subHeadquarterId?: string;
  loading: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatFullDate(dateString?: string): string {
  if (!dateString) return 'Fecha no registrada';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Fecha no registrada';
  return date.toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function HabitacionDetalleModal({
  isOpen,
  onClose,
  room,
  hasTariff = false,
  tariffPrice = null,
  tariffName = null,
  rateId = null,
  onOpenTarifas,
  onOpenBed,
  onOpenBuilding,
}: HabitacionDetalleModalProps) {
  const [extraDetails, setExtraDetails] = useState<RoomExtraDetails>({
    loading: false,
  });

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

  // Consulta complementaria en segundo plano para obtener descripción y autor
  useEffect(() => {
    if (!isOpen || !room?.id) {
      setExtraDetails({ loading: false });
      return;
    }

    let isMounted = true;
    setExtraDetails({ loading: true });

    const fetchExtra = async () => {
      const cleanId = String(room.id).trim();
      try {
        const res = await api.get<Record<string, unknown>>(
          `/rooms/${cleanId}`,
          {
            validateStatus: (s: number) => s === 200,
          }
        );
        if (!isMounted) return;
        const payload = (
          res.data?.data && typeof res.data.data === 'object'
            ? res.data.data
            : res.data
        ) as Record<string, unknown>;
        setExtraDetails({
          description:
            typeof payload?.description === 'string'
              ? payload.description
              : undefined,
          createdBy:
            typeof payload?.created_by === 'string'
              ? payload.created_by
              : undefined,
          headquarterId:
            typeof payload?.headquarter_id === 'string'
              ? payload.headquarter_id
              : undefined,
          subHeadquarterId:
            typeof payload?.sub_headquarter_id === 'string'
              ? payload.sub_headquarter_id
              : undefined,
          loading: false,
        });
      } catch {
        try {
          const fallbackRes = await api.get<Record<string, unknown>>(
            `/room/${cleanId}`,
            {
              validateStatus: (s: number) => s === 200,
            }
          );
          if (!isMounted) return;
          const payload = (
            fallbackRes.data?.data && typeof fallbackRes.data.data === 'object'
              ? fallbackRes.data.data
              : fallbackRes.data
          ) as Record<string, unknown>;
          setExtraDetails({
            description:
              typeof payload?.description === 'string'
                ? payload.description
                : undefined,
            createdBy:
              typeof payload?.created_by === 'string'
                ? payload.created_by
                : undefined,
            headquarterId:
              typeof payload?.headquarter_id === 'string'
                ? payload.headquarter_id
                : undefined,
            subHeadquarterId:
              typeof payload?.sub_headquarter_id === 'string'
                ? payload.sub_headquarter_id
                : undefined,
            loading: false,
          });
        } catch {
          if (isMounted) {
            setExtraDetails({ loading: false });
          }
        }
      }
    };

    void fetchExtra();

    return () => {
      isMounted = false;
    };
  }, [isOpen, room?.id]);

  if (!room) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-habitacion-title"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
        >
          {/* Fondo con desenfoque / Backdrop */}
          <motion.div
            key="backdrop-habitacion-detalle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Tarjeta de Contenido con física Spring */}
          <motion.div
            key="modal-habitacion-content"
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
            className="border-line bg-panel relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] border p-6 shadow-2xl transition-all sm:rounded-3xl sm:p-7.5"
          >
            {/* Tirador táctil para móvil */}
            <div className="bg-line/80 mx-auto -mt-2 mb-4 h-1.5 w-12 rounded-full sm:hidden" />

            {/* Cabecera Superior: Etiqueta y Botón Cerrar */}
            <div className="border-line/70 flex items-center justify-between gap-3 border-b pb-4.5">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
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
                    <path d="M3 21h18" />
                    <path d="M19 21v-4" />
                    <path d="M19 17a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v4" />
                    <path d="M2 4h20" />
                    <path d="M2 8h20" />
                    <path d="M6 12h12" />
                  </svg>
                  <span>Ficha completa de la habitación</span>
                </span>

                {hasTariff && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>Con tarifa</span>
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4.5"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {/* Hero Principal de la Habitación */}
            <div className="border-line/80 bg-canvas/70 mt-5 flex flex-col gap-4 rounded-2xl border p-4.5 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-3.5">
                {/* Badge Grande del Número */}
                <div
                  className={`relative grid size-14 shrink-0 place-items-center rounded-2xl text-lg font-black shadow-xs ${
                    hasTariff
                      ? 'border border-emerald-500/35 bg-emerald-500/15 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-primary/10 text-primary'
                  }`}
                  title={
                    hasTariff
                      ? `Habitación ${room.number} con tarifa aplicada: ${tariffName || 'Tarifa activa'}`
                      : `Habitación ${room.number}`
                  }
                >
                  {room.number}
                  {hasTariff && (
                    <span
                      className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-emerald-600 text-[10px] font-black text-white shadow-xs"
                      title="Tarifa aplicada"
                    >
                      ✓
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      id="modal-habitacion-title"
                      className={`text-lg font-black sm:text-xl ${
                        hasTariff
                          ? 'text-emerald-700 dark:text-emerald-400'
                          : 'text-ink'
                      }`}
                    >
                      Habitación {room.number}
                    </h3>

                    {/* Identificador de tarifa aplicada en el número de la habitación */}
                    {hasTariff ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-2xs"
                        title={`Tarifa aplicada: ${tariffName || 'Tarifa activa'}`}
                      >
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Tarifa aplicada</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas/80 px-2 py-0.5 text-xs font-medium text-ink-muted"
                        title="Sin tarifa aplicada"
                      >
                        <span>Sin tarifa</span>
                      </span>
                    )}
                  </div>
                  <p className="text-ink-muted text-xs">
                    Piso {room.floor} · {room.building.name}
                  </p>
                </div>
              </div>

              {/* Estado Operacional */}
              <div className="flex items-center gap-2 self-start sm:self-center">
                <HabitacionStatusBadge status={room.status} />
              </div>
            </div>

            {/* Rejilla de Módulos de Información */}
            <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {/* 1. Módulo: Edificio y Ubicación */}
              <div className="border-line bg-panel rounded-2xl border p-4 shadow-2xs">
                <div className="border-line/60 flex items-center justify-between gap-2 border-b pb-2.5">
                  <span className="text-ink flex items-center gap-1.5 text-xs font-bold">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primary size-4"
                    >
                      <path d="M3 21h18" />
                      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                      <path d="M9 9h1" />
                      <path d="M9 13h1" />
                      <path d="M9 17h1" />
                      <path d="M14 9h1" />
                      <path d="M14 13h1" />
                      <path d="M14 17h1" />
                    </svg>
                    Ubicación y Edificio
                  </span>
                  {room.buildingId && onOpenBuilding && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenBuilding(room.buildingId!, room.building)
                      }
                      className="text-primary cursor-pointer text-[11px] font-semibold hover:underline"
                    >
                      Ver edificio →
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Edificio:</span>
                    <span className="text-ink font-semibold">
                      {room.building.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Nivel / Piso:</span>
                    <span className="text-ink font-semibold">
                      Piso {room.floor}
                      {room.building.floorNumber
                        ? ` (de ${room.building.floorNumber} pisos)`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Módulo: Tipo de Cama y Capacidad */}
              <div className="border-line bg-panel rounded-2xl border p-4 shadow-2xs">
                <div className="border-line/60 flex items-center justify-between gap-2 border-b pb-2.5">
                  <span className="text-ink flex items-center gap-1.5 text-xs font-bold">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-primary size-4"
                    >
                      <path d="M2 4v16" />
                      <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                      <path d="M2 17h20" />
                      <path d="M6 8v9" />
                    </svg>
                    Alojamiento y Capacidad
                  </span>
                  {room.roomTypesId && onOpenBed && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenBed(room.roomTypesId ?? null, room.bed)
                      }
                      className="text-primary cursor-pointer text-[11px] font-semibold hover:underline"
                    >
                      Ver cama →
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Tipo de cama:</span>
                    <span className="text-ink font-semibold">
                      {room.bed.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">
                      Capacidad recomendada:
                    </span>
                    <span className="text-ink font-semibold">
                      {room.bed.capacityPeople
                        ? `${room.bed.capacityPeople} ${room.bed.capacityPeople === 1 ? 'persona' : 'personas'}`
                        : 'No especificada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Módulo: Tarifas y Precios */}
              <div className="border-line bg-panel rounded-2xl border p-4 shadow-2xs sm:col-span-2">
                <div className="border-line/60 flex items-center justify-between gap-2 border-b pb-2.5">
                  <span className="text-ink flex items-center gap-1.5 text-xs font-bold">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-4 text-emerald-600 dark:text-emerald-400"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Tarifas y Facturación
                  </span>

                  {onOpenTarifas && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenTarifas({
                          id: room.id,
                          number: room.number,
                          floor: room.floor,
                          hasTariff,
                          rateId,
                        })
                      }
                      className="cursor-pointer text-[11px] font-semibold text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      {hasTariff ? 'Ver plan tarifario →' : 'Asignar tarifa →'}
                    </button>
                  )}
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  {/* Precio de la habitación */}
                  <div className="border-line/60 bg-canvas/60 rounded-xl border p-3">
                    <span className="text-ink-muted block text-[11px]">
                      Precio de habitación
                    </span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-ink text-base font-extrabold">
                        {room.priceOverride != null
                          ? formatCurrency(room.priceOverride)
                          : 'Tarifa base'}
                      </span>
                      {room.priceOverride != null && (
                        <span className="text-primary text-[10px] font-semibold tracking-wider uppercase">
                          Precio especial
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Estado de Tarifa Aplicada */}
                  <div
                    className={`rounded-xl border p-3 ${
                      hasTariff
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-line/60 bg-canvas/60'
                    }`}
                  >
                    <span className="text-ink-muted block text-[11px]">
                      Tarifa comercial aplicada
                    </span>
                    {hasTariff ? (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div>
                          <span className="block font-bold text-emerald-950 dark:text-emerald-200">
                            {tariffName ?? 'Tarifa activa configurada'}
                          </span>
                          {tariffPrice != null && (
                            <span className="font-extrabold text-emerald-700 dark:text-emerald-300">
                              + {formatCurrency(tariffPrice)}
                            </span>
                          )}
                        </div>
                        <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                          ACTIVA
                        </span>
                      </div>
                    ) : (
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="text-ink-muted italic">
                          Sin tarifa aplicada actualmente
                        </span>
                        {onOpenTarifas && (
                          <button
                            type="button"
                            onClick={() =>
                              onOpenTarifas({
                                id: room.id,
                                number: room.number,
                                floor: room.floor,
                                hasTariff: false,
                                rateId: null,
                              })
                            }
                            className="bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer rounded-lg px-2 py-1 text-[11px] font-semibold"
                          >
                            Vincular
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Módulo: Metadatos y Auditoría */}
              <div className="border-line bg-panel rounded-2xl border p-4 shadow-2xs sm:col-span-2">
                <span className="border-line/60 text-ink block border-b pb-2 text-xs font-bold">
                  Metadatos y Auditoría del Sistema
                </span>

                <div className="mt-3 flex flex-row gap-2.5 text-xs sm:grid-cols-2">
                  {/* Fechas de Creación y Actualización */}
                  <div className="border-line/60 bg-canvas/60 space-y-1 rounded-xl border px-3 py-2">
                    <div className="flex justify-between">
                      <span className="text-ink-muted text-[11px]">
                        Última actualización:
                      </span>
                      <span className="text-ink text-[11px] font-semibold">
                        {formatFullDate(room.updatedAt)}
                      </span>
                    </div>
                    {room.createdAt && (
                      <div className="flex justify-between">
                        <span className="text-ink-muted text-[11px]">
                          Registrada el:
                        </span>
                        <span className="text-ink text-[11px] font-semibold">
                          {formatFullDate(room.createdAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Descripción o Creador Adicional si está disponible */}
                  {extraDetails.description && (
                    <div className="border-line/60 bg-canvas/60 rounded-xl border px-3 py-2 sm:col-span-2">
                      <span className="text-ink-muted block text-[10px] font-semibold uppercase">
                        Descripción u observaciones
                      </span>
                      <p className="text-ink mt-0.5 text-xs leading-relaxed">
                        {extraDetails.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="border-line/70 mt-6 flex flex-col-reverse items-center justify-end gap-2.5 border-t pt-4.5 sm:flex-row">
              <Button
                variant="ghost"
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cerrar
              </Button>

              {onOpenTarifas && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onOpenTarifas({
                      id: room.id,
                      number: room.number,
                      floor: room.floor,
                      hasTariff,
                      rateId,
                    });
                  }}
                  className="w-full sm:w-auto"
                >
                  {hasTariff
                    ? 'Consultar tarifas'
                    : 'Asignar tarifa a la habitación'}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
