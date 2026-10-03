import { useState } from 'react';
import { motion } from 'motion/react';
import { slideIn } from '../../../design-tokens/motion';
import { useTarifasLista } from '../application/use-tarifas-lista';
import { TarifaStatusFeedbackBanner } from './molecules/tarifa-status-feedback-banner';
import { TarifasListaFiltros } from './molecules/tarifas-lista-filtros';
import { type TarifaViewMode } from './molecules/tarifas-view-mode-toggle';
import { TarifaDetalleModal } from './organisms/tarifa-detalle-modal';
import { TarifasTable } from './organisms/tarifas-table';

export interface TarifasListaPageProps {
  onGoToRegister?: () => void;
  viewMode?: TarifaViewMode;
  onViewModeChange?: (mode: TarifaViewMode) => void;
}

export function TarifasListaPage({
  onGoToRegister,
  viewMode: propViewMode,
  onViewModeChange,
}: TarifasListaPageProps) {
  const [localViewMode, setLocalViewMode] = useState<TarifaViewMode>('cards');
  const viewMode = propViewMode ?? localViewMode;
  const handleViewModeChange = onViewModeChange ?? setLocalViewMode;

  const {
    rates,
    loading,
    feedback,
    showFeedbackBanner,
    dismissFeedbackBanner,
    refetch,
    filtros,
    setBusqueda,
    setModalidad,
    setEstado,
    resetFiltros,
    selectedTarifa,
    setSelectedTarifa,
    updateRateInList,
  } = useTarifasLista();

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Encabezado principal con animación slide-in */}
      <motion.div
        variants={slideIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 rounded-3xl border border-stone-200/90 bg-gradient-to-r from-stone-50 via-white to-stone-50 p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-900"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              🏷️
            </span>
            <span className="text-xs font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-300">
              Gestión Comercial y Precios
            </span>
          </div>
          <h1 className="text-ink mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl dark:text-white">
            Tarifas Registradas
          </h1>
          <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">
            Consulta centralizada de políticas tarifarias, vigencias y turnos en
            moneda colombiana (COP).
          </p>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-3">
          {onGoToRegister && (
            <button
              type="button"
              onClick={onGoToRegister}
              className="bg-primary hover:bg-primary-hover inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white shadow-xs transition active:scale-95"
            >
              <span>➕ Registrar nueva tarifa</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* 3. Banner de retroalimentación psicológica según el status code */}
      <TarifaStatusFeedbackBanner
        feedback={feedback}
        visible={showFeedbackBanner}
        onClose={dismissFeedbackBanner}
        onActionClick={() => {
          if (feedback?.statusCode === 204 && onGoToRegister) {
            onGoToRegister();
          } else {
            void refetch();
          }
        }}
      />

      {/* 4. Barra de filtros de búsqueda, modalidad y estado con menú de visualización por figuras */}
      <TarifasListaFiltros
        filtros={filtros}
        onSearchChange={setBusqueda}
        onModalityChange={setModalidad}
        onStatusChange={setEstado}
        onReset={resetFiltros}
        onRefresh={() => void refetch()}
        isLoading={loading}
        totalFiltered={rates.length}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* 5. Tabla o cuadrícula de cartas de tarifas registradas */}
      <TarifasTable
        rates={rates}
        isLoading={loading}
        onSelectTarifa={(tarifa) => setSelectedTarifa(tarifa)}
        onResetFilters={resetFiltros}
        onRateUpdated={updateRateInList}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* 6. Modal de detalle completo de la tarifa */}
      <TarifaDetalleModal
        tarifa={selectedTarifa}
        isOpen={Boolean(selectedTarifa)}
        onClose={() => setSelectedTarifa(null)}
      />
    </div>
  );
}
