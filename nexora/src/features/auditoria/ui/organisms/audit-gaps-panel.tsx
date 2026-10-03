import { motion } from 'motion/react';
import { fadeIn } from '../../../../design-tokens/motion';
import { TarifasModal } from '../../../habitaciones/ui/organisms/tarifas-modal';
import { useAuditGaps } from '../../application/use-audit-gaps';
import { useAuditScope } from '../../application/audit-scope-context';
import { GapCard } from '../molecules/gap-card';

export function AuditGapsPanel() {
  const { selectedGapsSection, setSelectedGapsSection } = useAuditScope();
  const {
    roomsWithoutTariff,
    roomsLoading,
    roomsError,
    refetchRooms,
    tariffsInactive,
    tariffsLoading,
    tariffsError,
    refetchTariffs,
    assigningRoom,
    isTariffPickerOpen,
    openTariffPickerForRoom,
    closeTariffPicker,
    onTariffAssigned,
    actionInProgress,
    reactivateTariff,
    unlinkTariff,
  } = useAuditGaps();

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Selector de sub-sección de brechas */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-ink text-base font-bold dark:text-white">
            Brechas Operativas y de Facturación
          </h3>
          <p className="text-xs text-stone-700 dark:text-stone-300">
            Resuelve anomalías de catálogo con acciones directas de asignación y
            desvinculación.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Seleccionar categoría de brecha"
          className="inline-flex rounded-2xl bg-stone-100/90 p-1.5 dark:bg-stone-900/80"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedGapsSection === 'unpriced'}
            onClick={() => setSelectedGapsSection('unpriced')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedGapsSection === 'unpriced'
                ? 'text-ink bg-white shadow-sm dark:bg-stone-800 dark:text-white'
                : 'hover:text-ink text-stone-700 dark:text-stone-300 dark:hover:text-stone-200'
            }`}
          >
            <span>Sin tarifa aplicada</span>
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              {roomsWithoutTariff.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={selectedGapsSection === 'inactive_rates'}
            onClick={() => setSelectedGapsSection('inactive_rates')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              selectedGapsSection === 'inactive_rates'
                ? 'text-ink bg-white shadow-sm dark:bg-stone-800 dark:text-white'
                : 'hover:text-ink text-stone-700 dark:text-stone-300 dark:hover:text-stone-200'
            }`}
          >
            <span>Tarifas inactivas en uso</span>
            <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
              {tariffsInactive.length}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Sub-sección 5.1: Habitaciones sin tarifa aplicada */}
      {selectedGapsSection === 'unpriced' && (
        <section aria-label="Habitaciones sin tarifa asignada">
          {roomsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50"
                />
              ))}
            </div>
          ) : roomsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Fallo al cargar habitaciones sin tarifa
              </p>
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {roomsError}
              </p>
              <button
                type="button"
                onClick={refetchRooms}
                className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                Reintentar carga
              </button>
            </div>
          ) : roomsWithoutTariff.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-10 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <span className="text-3xl" aria-hidden="true">
                🎉
              </span>
              <h4 className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Excelente: 100% de habitaciones con tarifa asignada
              </h4>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                No existen brechas de habitaciones sin precio en esta sede.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roomsWithoutTariff.map((room) => (
                <GapCard
                  key={room.id}
                  type="room_without_tariff"
                  room={room}
                  onAssignTariff={openTariffPickerForRoom}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 3. Sub-sección 5.2: Tarifas inactivas en uso */}
      {selectedGapsSection === 'inactive_rates' && (
        <section aria-label="Tarifas inactivas aplicadas a habitaciones">
          {tariffsLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 animate-pulse rounded-2xl border border-stone-200 bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50"
                />
              ))}
            </div>
          ) : tariffsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
              <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
                Fallo al cargar tarifas inactivas en uso
              </p>
              <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                {tariffsError}
              </p>
              <button
                type="button"
                onClick={refetchTariffs}
                className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                Reintentar carga
              </button>
            </div>
          ) : tariffsInactive.length === 0 ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-10 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <span className="text-3xl" aria-hidden="true">
                ✅
              </span>
              <h4 className="mt-2 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Sin tarifas inactivas en uso
              </h4>
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Todas las habitaciones tienen tarifas vigentes del catálogo
                activo.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tariffsInactive.map((item) => (
                <GapCard
                  key={item.tariff_id}
                  type="inactive_tariff_in_use"
                  item={item}
                  onReactivate={reactivateTariff}
                  onUnlink={unlinkTariff}
                  isActionInProgress={
                    actionInProgress === `reactivate-${item.tariff_id}` ||
                    actionInProgress === `unlink-${item.tariff_id}`
                  }
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* 4. Reutilización directa de TariffPicker (TarifasModal) para asignar tarifa sin pantallas extras */}
      {isTariffPickerOpen && assigningRoom && (
        <TarifasModal
          isOpen={isTariffPickerOpen}
          onClose={closeTariffPicker}
          hasTariff={false}
          linkedRoom={{
            id: assigningRoom.id,
            number: assigningRoom.number,
            floor: assigningRoom.floor,
            hasTariff: false,
          }}
          onTariffApplied={(roomId) => onTariffAssigned(roomId)}
        />
      )}
    </motion.div>
  );
}
