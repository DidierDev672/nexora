import { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { fadeIn } from '../../../../design-tokens/motion';

/**
 * Variantes de Stagger Reveal (Revelado Escalonado) en Framer Motion
 * El contenedor propaga automáticamente los estados 'hidden' y 'visible'
 * aplicando delayChildren y staggerChildren en cada elemento hijo sucesivo.
 */
export const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.06,
    },
  },
};

export const STAGGER_ROW_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
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
import {
  InfiniteScroll,
  InfiniteScrollEnd,
} from '../../../../shared/ui/InfiniteScroll';
import { EdificioDetalleModal } from '../../../edificios/ui/organisms/edificio-detalle-modal';
import { TipoCamaDetalleModal } from './tipo-cama-detalle-modal';
import { TarifasModal } from './tarifas-modal';
import { HabitacionDetalleModal } from './habitacion-detalle-modal';
import type { RoomRow } from '../../domain/habitacion-lista';
import { useHabitacionesLista } from '../../application/use-habitaciones-lista';
import { HabitacionCardItem } from '../molecules/habitacion-card-item';
import { HabitacionesFiltrosBar } from '../molecules/habitaciones-filtros-bar';
import { HabitacionStatusBadge } from '../molecules/habitacion-status-badge';
import {
  HabitacionCardsSkeleton,
  HabitacionTableSkeletonRows,
} from '../molecules/habitacion-table-skeleton';
import { useVerificarHabitacionesTarifas } from '../../application/use-verificar-habitaciones-tarifas';
import type { HabitacionesViewMode } from '../molecules/habitaciones-view-mode-toggle';

interface HabitacionesListaTableProps {
  onNewHabitacion?: () => void;
  viewMode?: HabitacionesViewMode;
  onViewModeChange?: (mode: HabitacionesViewMode) => void;
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
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function HabitacionesListaTable({
  onNewHabitacion,
  viewMode: propViewMode,
  onViewModeChange,
  onSelectHabitacion,
}: HabitacionesListaTableProps) {
  const [internalViewMode, setInternalViewMode] = useState<HabitacionesViewMode>('cards');
  const activeViewMode = propViewMode ?? internalViewMode;
  const handleViewModeChange = onViewModeChange ?? setInternalViewMode;

  const [selectedBuilding, setSelectedBuilding] = useState<{
    id: string;
    summary?: RoomRow['building'];
    room: {
      number: string;
      floor: number | string;
    };
  } | null>(null);

  const [selectedBed, setSelectedBed] = useState<{
    id: string | null;
    summary?: RoomRow['bed'];
    room: {
      number: string;
      floor: number | string;
    };
  } | null>(null);

  const [selectedRoomForTarifas, setSelectedRoomForTarifas] = useState<{
    id: string;
    number: string;
    floor: number | string;
    hasTariff?: boolean;
    rateId?: string | null;
  } | null>(null);

  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<RoomRow | null>(null);

  const {
    rows,
    totalRawCount,
    loadedCount,
    initialLoading,
    loadingMore,
    hasMore,
    error,
    filters,
    knownBuildings,
    setFilters,
    loadMore,
    reload,
    retryBuilding,
    retryBed,
  } = useHabitacionesLista();

  const {
    hasTariff,
    getRateId,
    getTariffPrice,
    getTariffName,
    markRoomWithTariff,
    recheckAll,
    isVerifying,
  } = useVerificarHabitacionesTarifas({ rooms: rows });

  return (
    <motion.section
      aria-label="Catálogo e inventario de habitaciones"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* 1. Barra de Controles y Filtros */}
      <div className="border-line bg-panel rounded-2xl border p-4 shadow-sm sm:p-5">
        <HabitacionesFiltrosBar
          filters={filters}
          knownBuildings={knownBuildings}
          loadedCount={loadedCount}
          totalCount={totalRawCount}
          filteredCount={rows.length}
          onFilterChange={setFilters}
          onReload={() => {
            reload();
            recheckAll();
          }}
          isReloading={initialLoading}
          viewMode={activeViewMode}
          onViewModeChange={handleViewModeChange}
          onRecheckTarifas={recheckAll}
          isVerifyingTarifas={isVerifying}
        />
      </div>

      {/* 2. Contenedor de la Tabla / Infinite Scroll */}
      <div className="border-line bg-panel rounded-2xl border p-4 shadow-sm sm:p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <span className="bg-danger/10 text-danger grid size-12 place-items-center rounded-full">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-6"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <p className="text-danger max-w-md text-sm font-medium">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="border-line bg-panel text-ink hover:border-primary/40 hover:text-primary mt-2 cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold shadow-2xs transition"
            >
              Reintentar carga de habitaciones
            </button>
          </div>
        ) : initialLoading ? (
          <div className="space-y-4">
            {activeViewMode === 'cards' ? (
              <HabitacionCardsSkeleton
                count={8}
                className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              />
            ) : (
              <div className="border-line overflow-x-auto rounded-xl border">
                <table className="w-full text-left text-xs">
                  <thead className="bg-canvas border-line text-ink-muted border-b font-semibold tracking-wider uppercase">
                    <tr>
                      <th className="px-5 py-3.5 sm:px-6">Número</th>
                      <th className="px-4 py-3.5">Piso</th>
                      <th className="px-4 py-3.5">Edificio</th>
                      <th className="px-4 py-3.5">Tipo de cama</th>
                      <th className="px-4 py-3.5">Estado</th>
                      <th className="px-4 py-3.5">Precio</th>
                      <th className="px-4 py-3.5">Tarifas</th>
                      <th className="px-4 py-3.5 text-right">Actualizado</th>
                    </tr>
                  </thead>
                  <HabitacionTableSkeletonRows count={7} />
                </table>
              </div>
            )}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="bg-primary/10 text-primary grid size-14 place-items-center rounded-2xl">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-7"
              >
                <path d="M2 4v16" />
                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                <path d="M2 17h20" />
                <path d="M6 8v9" />
              </svg>
            </span>
            <h3 className="text-ink text-base font-bold">
              No hay habitaciones para mostrar
            </h3>
            <p className="text-ink-muted max-w-sm text-xs leading-relaxed">
              {filters.search ||
              filters.status !== 'all' ||
              filters.buildingId !== 'all'
                ? 'Ninguna habitación coincide con los filtros aplicados. Prueba restableciendo los filtros para ver todo tu inventario.'
                : 'Aún no se han registrado habitaciones en este establecimiento. Registra una nueva habitación para comenzar tu catálogo.'}
            </p>
            {onNewHabitacion && (
              <button
                type="button"
                onClick={onNewHabitacion}
                className="bg-primary hover:bg-primary-hover mt-2 cursor-pointer rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition"
              >
                + Registrar primera habitación
              </button>
            )}
          </div>
        ) : (
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={hasMore}
            isLoading={loadingMore}
            loader={
              <div
                role="status"
                aria-live="polite"
                className="text-ink-muted flex items-center justify-center gap-2.5 py-6 text-xs font-medium"
              >
                <span className="border-primary/25 border-t-primary inline-block size-4.5 animate-spin rounded-full border-2" />
                <span>Cargando más habitaciones…</span>
              </div>
            }
            endMessage={
              <InfiniteScrollEnd label="Has llegado al final de las habitaciones registradas." />
            }
          >
            {/* Visualización mutuamente excluyente: Tabla o Tarjetas */}
            {activeViewMode === 'table' ? (
              /* 1. Vista Tabla (con scroll horizontal responsivo) */
              <div
                key="habitaciones-table-view"
                className="border-line overflow-x-auto rounded-xl border"
              >
              <table className="w-full text-left text-xs">
                <thead className="bg-canvas border-line text-ink-muted border-b text-[11px] font-semibold tracking-wider uppercase">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 sm:px-6">
                      Número
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Piso
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Edificio
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Tipo de cama
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Estado
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Precio
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Tarifas
                    </th>
                    <th scope="col" className="px-4 py-3.5 text-right">
                      Actualizado
                    </th>
                  </tr>
                </thead>

                <motion.tbody
                  variants={STAGGER_CONTAINER_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  className="divide-line divide-y"
                >
                  {rows.map((row) => (
                    <motion.tr
                      key={row.id}
                      variants={STAGGER_ROW_VARIANTS}
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        if (target.closest('button') || target.closest('a')) return;
                        if (onSelectHabitacion) {
                          onSelectHabitacion(row);
                        } else {
                          setSelectedRoomForDetail(row);
                        }
                      }}
                      className="group hover:bg-canvas/70 transition-colors cursor-pointer"
                    >
                      {/* 1. NÚMERO */}
                      <td className="px-5 py-3.5 whitespace-nowrap sm:px-6">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectHabitacion) {
                              onSelectHabitacion(row);
                            } else {
                              setSelectedRoomForDetail(row);
                            }
                          }}
                          className="group/num flex items-center gap-3 text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-xl"
                          title="Haz clic para asignar huésped a esta habitación"
                        >
                          <span
                            className={
                              hasTariff(row.id)
                                ? 'relative grid size-8 shrink-0 place-items-center rounded-lg border border-emerald-500/35 bg-emerald-500/15 text-xs font-bold text-emerald-700 shadow-2xs transition-colors group-hover/num:bg-emerald-600 group-hover/num:text-white dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300'
                                : 'bg-primary/10 text-primary group-hover/num:bg-primary relative grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold shadow-2xs transition-colors group-hover/num:text-white'
                            }
                            title={
                              hasTariff(row.id)
                                ? `Habitación ${row.number} con tarifa aplicada: ${getTariffName(row.id) || 'Tarifa activa'}`
                                : `Habitación ${row.number}`
                            }
                          >
                            {row.number}
                            {hasTariff(row.id) && (
                              <span
                                className="absolute -top-1 -right-1 grid size-3.5 place-items-center rounded-full bg-emerald-600 text-[8px] font-black text-white shadow-xs"
                                title="Tarifa aplicada"
                              >
                                ✓
                              </span>
                            )}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-ink group-hover/num:text-primary block font-bold transition-colors">
                                Habitación{' '}
                                <span
                                  className={
                                    hasTariff(row.id)
                                      ? 'font-extrabold text-emerald-600 dark:text-emerald-400'
                                      : ''
                                  }
                                >
                                  {row.number}
                                </span>
                              </span>

                              {/* Identificador de tarifa aplicada en el número de la habitación (Tabla) */}
                              {hasTariff(row.id) ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-300 shadow-2xs"
                                  title={`Tarifa aplicada: ${getTariffName(row.id) || 'Tarifa activa'}`}
                                >
                                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  <span>Tarifa aplicada</span>
                                </span>
                              ) : isVerifying ? (
                                <span
                                  className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas/80 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted animate-pulse"
                                  title="Verificando tarifa..."
                                >
                                  <span>Verificando…</span>
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center gap-1 rounded-md border border-line bg-canvas/80 px-1.5 py-0.5 text-[10px] font-medium text-ink-muted"
                                  title="Sin tarifa aplicada"
                                >
                                  <span>Sin tarifa</span>
                                </span>
                              )}
                            </div>
                            <span className="text-ink-muted group-hover/num:text-primary/80 block text-[11px] transition-colors">
                              Piso {row.floor} · Asignar huésped
                            </span>
                          </div>
                        </button>
                      </td>

                      {/* 2. PISO */}
                      <td className="text-ink px-4 py-3.5 font-medium whitespace-nowrap">
                        Piso {row.floor}
                      </td>

                      {/* 3. EDIFICIO */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {row.building.loading ? (
                          <span className="bg-line/60 inline-block h-4 w-24 animate-pulse rounded" />
                        ) : row.building.error ? (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <span title="No se pudo obtener información del edificio">
                              ⚠️ No disponible
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                row.buildingId && retryBuilding(row.buildingId)
                              }
                              className="text-[11px] font-semibold underline hover:text-amber-700"
                              title="Reintentar consulta de este edificio"
                            >
                              Reintentar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              row.buildingId &&
                              setSelectedBuilding({
                                id: row.buildingId,
                                summary: row.building,
                                room: {
                                  number: row.number,
                                  floor: row.floor,
                                },
                              })
                            }
                            className="group/bldg border-line/40 bg-canvas/60 hover:border-primary/40 hover:bg-primary/10 focus-visible:ring-primary/40 flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-left transition-all hover:shadow-2xs focus-visible:ring-2 focus-visible:outline-none"
                            title="Haz clic para ver la ficha detallada del edificio"
                          >
                            <span className="bg-primary/10 text-primary group-hover/bldg:bg-primary grid size-7 shrink-0 place-items-center rounded-lg shadow-2xs transition-colors group-hover/bldg:text-white">
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
                                <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
                                <path d="M9 9h1" />
                                <path d="M9 13h1" />
                                <path d="M9 17h1" />
                                <path d="M14 9h1" />
                                <path d="M14 13h1" />
                                <path d="M14 17h1" />
                              </svg>
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-ink group-hover/bldg:text-primary truncate font-semibold transition-colors">
                                  {row.building.name}
                                </span>
                              </div>
                            </div>
                          </button>
                        )}
                      </td>

                      {/* 4. TIPO DE CAMA */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {row.bed.loading ? (
                          <span className="bg-line/60 inline-block h-4 w-28 animate-pulse rounded" />
                        ) : row.bed.error ? (
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedBed({
                                  id: row.roomTypesId ?? null,
                                  summary: row.bed,
                                  room: {
                                    number: row.number,
                                    floor: row.floor,
                                  },
                                })
                              }
                              className="cursor-pointer text-[11px] font-semibold underline hover:text-amber-700"
                              title="Haz clic para ver los detalles del tipo de cama"
                            >
                              ⚠️ No disponible
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                row.roomTypesId && retryBed(row.roomTypesId)
                              }
                              className="cursor-pointer text-[11px] font-semibold underline hover:text-amber-700"
                              title="Reintentar consulta de esta cama"
                            >
                              Reintentar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBed({
                                id: row.roomTypesId ?? null,
                                summary: row.bed,
                                room: {
                                  number: row.number,
                                  floor: row.floor,
                                },
                              })
                            }
                            className="group/bed border-line/40 bg-canvas/60 hover:border-primary/40 hover:bg-primary/10 focus-visible:ring-primary/40 flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-1.5 text-left transition-all hover:shadow-2xs focus-visible:ring-2 focus-visible:outline-none"
                            title="Haz clic para ver la información del tipo de cama"
                          >
                            <span className="bg-primary/10 text-primary group-hover/bed:bg-primary grid size-7 shrink-0 place-items-center rounded-lg shadow-2xs transition-colors group-hover/bed:text-white">
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
                                <path d="M2 4v16" />
                                <path d="M2 8h18a2 2 0 0 1 2 2v10" />
                                <path d="M2 17h20" />
                                <path d="M6 8v9" />
                              </svg>
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-ink group-hover/bed:text-primary truncate font-semibold transition-colors">
                                  {row.bed.name}
                                </span>
                              </div>
                            </div>
                          </button>
                        )}
                      </td>

                      {/* 5. ESTADO */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <HabitacionStatusBadge status={row.status} />
                      </td>

                      {/* 6. PRECIO */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="space-y-1">
                          {row.priceOverride != null ? (
                            <div>
                              <span className="text-ink block font-extrabold">
                                {formatCurrency(row.priceOverride)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-ink-muted block text-xs font-medium italic">
                              Precio base
                            </span>
                          )}

                          {/* En caso de que una habitación cuente con tarifa: + el precio de la tarifa para el recepcionista */}
                          {hasTariff(row.id) && (
                            <div className="flex items-center gap-1">
                              <span
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 shadow-2xs transition-transform select-none hover:scale-105 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-300"
                                title={`Tarifa aplicada: ${getTariffName(row.id) ?? 'Tarifa activa'} (${getTariffPrice(row.id) != null ? formatCurrency(getTariffPrice(row.id)!) : 'Configurada'})`}
                              >
                                <span className="text-sm leading-none font-black text-emerald-600 dark:text-emerald-400">
                                  +
                                </span>
                                <span className="font-extrabold">
                                  {getTariffPrice(row.id) != null
                                    ? formatCurrency(getTariffPrice(row.id)!)
                                    : 'Tarifa activa'}
                                </span>
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 7. TARIFAS */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {hasTariff(row.id) ? (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRoomForTarifas({
                                id: row.id,
                                number: row.number,
                                floor: row.floor,
                                hasTariff: true,
                                rateId: getRateId(row.id),
                              })
                            }
                            className="group/rate border-emerald-500/40 bg-emerald-500/10 dark:border-emerald-400/30 dark:bg-emerald-500/20 flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all hover:bg-emerald-500/20 hover:shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none"
                            title={`Tarifa verificada y aplicada: ${getTariffName(row.id) || 'Tarifa activa'}. Haz clic para gestionar o cambiar tarifa.`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-emerald-700 dark:text-emerald-300 text-xs font-bold truncate max-w-[130px]">
                                  {getTariffName(row.id) || 'Tarifa aplicada'}
                                </span>
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                              </div>
                              <span className="text-emerald-700/80 dark:text-emerald-300/80 block text-[11px] font-medium">
                                {getTariffPrice(row.id) != null
                                  ? formatCurrency(getTariffPrice(row.id)!)
                                  : 'Verificada y activa'}
                              </span>
                            </div>
                          </button>
                        ) : isVerifying ? (
                          <div
                            className="border-line/40 bg-canvas/60 inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-ink-muted text-xs shadow-2xs"
                            title="Consultando y verificando tarifa con el servidor..."
                          >
                            <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                            <div className="min-w-0">
                              <span className="text-ink-muted block text-xs font-semibold">
                                Verificando…
                              </span>
                              <span className="text-[10px] text-ink-muted/80 block">
                                Consultando
                              </span>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRoomForTarifas({
                                id: row.id,
                                number: row.number,
                                floor: row.floor,
                                hasTariff: false,
                                rateId: null,
                              })
                            }
                            className="group/rate border-line/60 bg-canvas/60 hover:border-primary/40 hover:bg-primary/5 flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-1.5 text-left transition-all hover:shadow-2xs focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                            title="Habitación sin tarifa aplicada. Haz clic para asignar una tarifa."
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-ink-muted/50" />
                                <span className="text-ink text-xs font-semibold transition-colors group-hover/rate:text-primary">
                                  Sin tarifa
                                </span>
                                <span className="text-[11px] text-ink-muted group-hover/rate:text-primary">➕</span>
                              </div>
                              <span className="text-ink-muted block text-[11px] group-hover/rate:text-primary/80">
                                Asignar tarifa
                              </span>
                            </div>
                          </button>
                        )}
                      </td>

                      {/* 8. ACTUALIZADO */}
                      <td className="text-ink-muted px-4 py-3.5 text-right whitespace-nowrap">
                        <span
                          title={
                            row.updatedAt
                              ? new Date(row.updatedAt).toLocaleString('es-ES')
                              : 'Fecha no registrada'
                          }
                        >
                          {formatRelativeTime(row.updatedAt)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          ) : (
            /* 2. Vista Tarjetas / Cards (Cuadrícula responsiva con Stagger Reveal) */
            <motion.div
              key="habitaciones-cards-view"
              variants={STAGGER_CONTAINER_VARIANTS}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {rows.map((row) => (
                <HabitacionCardItem
                  key={row.id}
                  room={row}
                  hasTariff={hasTariff(row.id)}
                  isVerifying={isVerifying}
                  tariffPrice={getTariffPrice(row.id)}
                  tariffName={getTariffName(row.id)}
                  onRetryBuilding={retryBuilding}
                  onRetryBed={retryBed}
                  onOpenRoomDetail={(r) => {
                    if (onSelectHabitacion) {
                      onSelectHabitacion(r);
                    } else {
                      setSelectedRoomForDetail(r);
                    }
                  }}
                  onSelectHabitacion={onSelectHabitacion}
                  onOpenBuilding={(id, summary) =>
                    setSelectedBuilding({
                      id,
                      summary,
                      room: {
                        number: row.number,
                        floor: row.floor,
                      },
                    })
                  }
                  onOpenBed={(id, summary) =>
                    setSelectedBed({
                      id,
                      summary,
                      room: {
                        number: row.number,
                        floor: row.floor,
                      },
                    })
                  }
                  onOpenTarifas={() =>
                    setSelectedRoomForTarifas({
                      id: row.id,
                      number: row.number,
                      floor: row.floor,
                      hasTariff: hasTariff(row.id),
                      rateId: getRateId(row.id),
                    })
                  }
                />
              ))}
            </motion.div>
          )}
          </InfiniteScroll>
        )}
      </div>

      {/* 3. Modal interactivo para el detalle del edificio exclusivo de la habitación */}
      <EdificioDetalleModal
        isOpen={Boolean(selectedBuilding)}
        buildingId={selectedBuilding?.id ?? null}
        buildingSummary={selectedBuilding?.summary}
        linkedRoom={selectedBuilding?.room}
        onClose={() => setSelectedBuilding(null)}
      />

      {/* 4. Modal interactivo para el detalle del tipo de cama exclusivo de la habitación */}
      <TipoCamaDetalleModal
        isOpen={Boolean(selectedBed)}
        bedId={selectedBed?.id ?? null}
        bedSummary={selectedBed?.summary}
        linkedRoom={selectedBed?.room}
        onClose={() => setSelectedBed(null)}
      />

      {/* 5. Modal interactivo para visualizar tarifas disponibles */}
      <TarifasModal
        isOpen={Boolean(selectedRoomForTarifas)}
        linkedRoom={selectedRoomForTarifas ?? undefined}
        hasTariff={Boolean(
          selectedRoomForTarifas?.id &&
          (hasTariff(selectedRoomForTarifas.id) ||
            selectedRoomForTarifas.hasTariff)
        )}
        appliedRateId={
          selectedRoomForTarifas?.id
            ? getRateId(selectedRoomForTarifas.id) ||
              selectedRoomForTarifas.rateId
            : undefined
        }
        onTariffApplied={markRoomWithTariff}
        onClose={() => setSelectedRoomForTarifas(null)}
      />

      {/* 6. Modal con la información completa de la habitación seleccionada */}
      <HabitacionDetalleModal
        isOpen={Boolean(selectedRoomForDetail)}
        room={selectedRoomForDetail}
        hasTariff={Boolean(selectedRoomForDetail && hasTariff(selectedRoomForDetail.id))}
        tariffPrice={selectedRoomForDetail ? getTariffPrice(selectedRoomForDetail.id) : null}
        tariffName={selectedRoomForDetail ? getTariffName(selectedRoomForDetail.id) : null}
        onOpenTarifas={(r) => {
          setSelectedRoomForDetail(null);
          if (r.id) {
            setSelectedRoomForTarifas({
              id: r.id,
              number: r.number,
              floor: r.floor,
              hasTariff: r.hasTariff,
              rateId: r.rateId,
            });
          }
        }}
        onOpenBed={(bedId, summary) => {
          setSelectedRoomForDetail(null);
          setSelectedBed({
            id: bedId,
            summary,
            room: selectedRoomForDetail
              ? { number: selectedRoomForDetail.number, floor: selectedRoomForDetail.floor }
              : { number: '', floor: '' },
          });
        }}
        onOpenBuilding={(bldgId, summary) => {
          setSelectedRoomForDetail(null);
          setSelectedBuilding({
            id: bldgId,
            summary,
            room: selectedRoomForDetail
              ? { number: selectedRoomForDetail.number, floor: selectedRoomForDetail.floor }
              : { number: '', floor: '' },
          });
        }}
        onClose={() => setSelectedRoomForDetail(null)}
      />
    </motion.section>
  );
}
