import { motion, type Variants } from 'motion/react';
import type { RoomRow } from '../../domain/habitacion-lista';
import { HabitacionStatusBadge } from './habitacion-status-badge';

export const CARD_ITEM_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
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

interface HabitacionCardItemProps {
  room: RoomRow;
  hasTariff?: boolean;
  isVerifying?: boolean;
  tariffPrice?: number | null;
  tariffName?: string | null;
  variants?: Variants;
  onRetryBuilding: (id: string) => void;
  onRetryBed: (id: string) => void;
  onOpenBuilding?: (id: string, summary?: RoomRow['building']) => void;
  onOpenBed?: (id: string | null, summary?: RoomRow['bed']) => void;
  onOpenTarifas?: (room: { number: string; floor: number | string }) => void;
  onOpenRoomDetail?: (room: RoomRow) => void;
  onSelectHabitacion?: (room: RoomRow) => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Reciente';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Reciente';
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Hace un momento';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export function HabitacionCardItem({
  room,
  hasTariff = false,
  isVerifying = false,
  tariffPrice = null,
  tariffName = null,
  variants,
  onRetryBuilding,
  onRetryBed,
  onOpenBuilding,
  onOpenBed,
  onOpenTarifas,
  onOpenRoomDetail,
  onSelectHabitacion,
}: HabitacionCardItemProps) {
  const handleRoomClick = () => {
    if (onSelectHabitacion) {
      onSelectHabitacion(room);
    } else if (onOpenRoomDetail) {
      onOpenRoomDetail(room);
    }
  };

  return (
    <motion.div
      variants={variants ?? CARD_ITEM_VARIANTS}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('a')) return;
        handleRoomClick();
      }}
      className="group border-line bg-panel hover:border-primary/30 relative cursor-pointer rounded-2xl border p-4.5 shadow-2xs transition-all hover:shadow-sm"
    >
      {/* Header: Número y Estado */}
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={handleRoomClick}
          className="group/num focus-visible:ring-primary/40 flex cursor-pointer items-center gap-2.5 rounded-xl text-left focus-visible:ring-2 focus-visible:outline-none"
          title="Haz clic para asignar huésped a esta habitación"
        >
          <span
            className={
              hasTariff
                ? 'relative grid size-9.5 shrink-0 place-items-center rounded-xl border border-emerald-500/35 bg-emerald-500/15 text-sm font-bold text-emerald-700 shadow-xs transition-colors group-hover/num:bg-emerald-600 group-hover/num:text-white dark:text-emerald-400'
                : 'bg-primary/10 text-primary group-hover/num:bg-primary relative grid size-9.5 shrink-0 place-items-center rounded-xl text-sm font-bold shadow-xs transition-colors group-hover/num:text-white'
            }
            title={
              hasTariff
                ? `Habitación ${room.number} con tarifa aplicada: ${tariffName || 'Tarifa activa'}`
                : `Habitación ${room.number}`
            }
          >
            {room.number}
            {hasTariff && (
              <span
                className="absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full bg-emerald-600 text-[8px] font-black text-white shadow-xs"
                title="Tarifa aplicada"
              >
                ✓
              </span>
            )}
          </span>
          <div>
            <span className="text-ink-muted group-hover/num:text-primary text-[11px] font-medium transition-colors">
              Piso {room.floor} · Asignar huésped
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Identificador de tarifa aplicada en el número de la habitación */}
              {hasTariff ? (
                <span
                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 shadow-2xs dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300"
                  title={`Tarifa aplicada: ${tariffName || 'Tarifa activa'}`}
                >
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span>Tarifa aplicada</span>
                </span>
              ) : isVerifying ? (
                <span
                  className="border-line bg-canvas/80 text-ink-muted inline-flex animate-pulse items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
                  title="Verificando tarifa..."
                >
                  <span>Verificando…</span>
                </span>
              ) : (
                <span
                  className="border-line bg-canvas/80 text-ink-muted inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium"
                  title="Sin tarifa aplicada"
                >
                  <span>Sin tarifa</span>
                </span>
              )}
            </div>
          </div>
        </button>

        <HabitacionStatusBadge status={room.status} />
      </div>

      {/* Detalles: Edificio y Cama */}
      <div className="border-line/60 mt-3.5 space-y-2 border-t pt-3 text-xs">
        {/* Edificio */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-ink-muted flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-secondary size-3.5"
            >
              <path d="M3 21h18" />
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            </svg>
            Edificio:
          </span>
          <div className="text-right">
            {room.building.loading ? (
              <span className="bg-line/60 inline-block h-3.5 w-20 animate-pulse rounded" />
            ) : room.building.error ? (
              <button
                type="button"
                onClick={() =>
                  room.buildingId && onRetryBuilding(room.buildingId)
                }
                className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                title="Pulsa para reintentar cargar el edificio"
              >
                <span>⚠️ No disp.</span>
                <span className="underline">Reintentar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  room.buildingId &&
                  onOpenBuilding?.(room.buildingId, room.building)
                }
                className="border-line/60 bg-canvas/80 text-ink hover:border-primary/40 hover:bg-primary/10 hover:text-primary inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all"
                title="Haz clic para inspeccionar los detalles del edificio"
              >
                <span>{room.building.name}</span>
                <span className="text-primary/70 text-[10px]">🔍</span>
              </button>
            )}
          </div>
        </div>

        {/* Tipo de Cama */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-ink-muted flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-primary size-3.5"
            >
              <path d="M2 4v16" />
              <path d="M2 8h18a2 2 0 0 1 2 2v10" />
              <path d="M2 17h20" />
              <path d="M6 8v9" />
            </svg>
            Cama:
          </span>
          <div className="text-right">
            {room.bed.loading ? (
              <span className="bg-line/60 inline-block h-3.5 w-24 animate-pulse rounded" />
            ) : room.bed.error ? (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    onOpenBed?.(room.roomTypesId ?? null, room.bed)
                  }
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-amber-600 hover:underline dark:text-amber-400"
                  title="Pulsa para ver el detalle de la cama"
                >
                  <span>⚠️ No disp.</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    room.roomTypesId && onRetryBed(room.roomTypesId)
                  }
                  className="text-ink-muted hover:text-ink cursor-pointer text-[11px] font-semibold underline"
                  title="Pulsa para reintentar cargar la cama"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenBed?.(room.roomTypesId ?? null, room.bed)}
                className="border-line/60 bg-canvas/80 text-ink hover:border-primary/40 hover:bg-primary/10 hover:text-primary inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all"
                title="Haz clic para inspeccionar los detalles del tipo de cama"
              >
                <span>{room.bed.name}</span>
                {room.bed.capacityPeople ? (
                  <span className="bg-primary/10 py-0.2 text-primary rounded-full px-1.5 text-[10px] font-bold">
                    {room.bed.capacityPeople}p
                  </span>
                ) : null}
                <span className="text-primary/70 text-[10px]">🔍</span>
              </button>
            )}
          </div>
        </div>

        {/* Tarifas disponibles */}
        <div className="border-line/40 flex items-center justify-between gap-2 border-t pt-2">
          <span className="text-ink-muted flex items-center gap-1.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={
                hasTariff
                  ? 'size-3.5 text-emerald-600 dark:text-emerald-400'
                  : 'text-secondary size-3.5'
              }
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Tarifas:
          </span>
          <div className="text-right">
            <button
              type="button"
              onClick={() =>
                onOpenTarifas?.({ number: room.number, floor: room.floor })
              }
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold transition-all ${
                hasTariff
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 shadow-2xs hover:bg-emerald-500/20 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300'
                  : 'border-line/60 bg-canvas/80 text-ink hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600'
              }`}
              title={
                hasTariff
                  ? `Tarifa activa: ${tariffName || 'Tarifa verificada y aplicada'}`
                  : isVerifying
                    ? 'Verificando estado de tarifas…'
                    : 'Haz clic para ver y aplicar tarifas a esta habitación'
              }
            >
              {hasTariff ? (
                <>
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span className="max-w-[120px] truncate">
                    {tariffName || 'Tarifa aplicada'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    ✓
                  </span>
                </>
              ) : isVerifying ? (
                <>
                  <span className="size-1.5 animate-ping rounded-full bg-amber-500" />
                  <span className="text-ink-muted">Verificando…</span>
                </>
              ) : (
                <>
                  <span>Sin tarifa</span>
                  <span className="text-primary text-[10px] font-bold">➕</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer: Precio y Actualización */}
      <div className="border-line/60 mt-3 flex items-center justify-between border-t pt-2.5 text-xs">
        <div className="space-y-1">
          {room.priceOverride != null ? (
            <div className="flex flex-col">
              <span className="text-primary text-[10px] font-bold tracking-wider uppercase">
                Precio especial
              </span>
              <span className="text-ink text-sm font-extrabold">
                {formatCurrency(room.priceOverride)}
              </span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-ink-muted text-[10px] font-semibold uppercase">
                Precio base
              </span>
              <span className="text-ink-soft text-xs font-semibold">
                Tarifa del tipo
              </span>
            </div>
          )}

          {/* En caso de que una habitación cuente con tarifa: + el precio para que el recepcionista pueda visualizarlo */}
          {hasTariff && (
            <div className="flex items-center gap-1 pt-0.5">
              <span
                className="inline-flex items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300"
                title={`Tarifa aplicada${tariffName ? `: ${tariffName}` : ''}`}
              >
                <span className="leading-none font-black text-emerald-600 dark:text-emerald-400">
                  +
                </span>
                <span className="font-extrabold">
                  {tariffPrice != null
                    ? formatCurrency(tariffPrice)
                    : 'Tarifa activa'}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="text-ink-muted text-right text-[11px]">
          <span title={room.updatedAt || 'Fecha no registrada'}>
            {formatRelativeTime(room.updatedAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
