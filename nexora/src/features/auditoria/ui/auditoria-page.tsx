import { motion } from 'motion/react';
import { slideIn } from '../../../design-tokens/motion';
import {
  AuditScopeProvider,
  useAuditScope,
} from '../application/audit-scope-context';
import type { AuditTabId } from '../domain/audit-types';
import { AuditGapsPanel } from './organisms/audit-gaps-panel';
import { AuditRatesPanel } from './organisms/audit-rates-panel';
import { AuditRoomsPanel } from './organisms/audit-rooms-panel';
import { AuditSummaryPanel } from './organisms/audit-summary-panel';

const TABS: { id: AuditTabId; label: string; icon: string }[] = [
  { id: 'resumen', label: 'Resumen Ejecutivo', icon: '📊' },
  { id: 'habitaciones', label: 'Habitaciones (Matriz)', icon: '🛏️' },
  { id: 'tarifas', label: 'Tarifas del Hotel', icon: '🏷️' },
  { id: 'brechas', label: 'Brechas Operativas', icon: '⚡' },
];

function AuditoriaContent() {
  const {
    activeTab,
    setActiveTab,
    scope,
    setScope,
    summary,
    summaryLoading,
    refreshSummary,
  } = useAuditScope();

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Encabezado de Auditoría con slide-in animado */}
      <motion.div
        variants={slideIn}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 rounded-3xl border border-stone-200/90 bg-gradient-to-r from-stone-50 via-white to-stone-50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-stone-800 dark:from-stone-900 dark:via-stone-900/95 dark:to-stone-900"
      >
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-xl">
              📋
            </span>
            <span className="text-primary text-xs font-semibold tracking-wider uppercase">
              Módulo de Control y Calidad
            </span>
          </div>
          <h1 className="text-ink mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl dark:text-white">
            Auditoría Operativa y Tarifaria
          </h1>
          <p className="mt-1 text-xs text-stone-700 dark:text-stone-300">
            Conciliación de inventario físico vs. sistema, invariantes
            financieras y brechas operativas.
          </p>
        </div>

        {/* Controles de Sede, Período y Actualización */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de Sede */}
          <div className="flex flex-col">
            <label
              htmlFor="audit-headquarter-select"
              className="text-[10px] font-semibold text-stone-700 dark:text-stone-300"
            >
              Sede activa
            </label>
            <select
              id="audit-headquarter-select"
              aria-label="Sede activa"
              value={scope.headquarter_id || 'sede-central'}
              onChange={(e) => setScope({ headquarter_id: e.target.value })}
              className="text-ink focus:border-primary h-9 rounded-xl border border-stone-300 bg-white px-3 text-xs font-medium shadow-sm focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            >
              <option value="sede-central">Sede Principal Miraflores</option>
              <option value="sede-san-isidro">Sede San Isidro Suites</option>
            </select>
          </div>

          {/* Selector de Período */}
          <div className="flex flex-col">
            <label
              htmlFor="audit-period-select"
              className="text-[10px] font-semibold text-stone-700 dark:text-stone-300"
            >
              Período
            </label>
            <select
              id="audit-period-select"
              aria-label="Período"
              value={scope.periodo}
              onChange={(e) => setScope({ periodo: e.target.value })}
              className="text-ink focus:border-primary h-9 rounded-xl border border-stone-300 bg-white px-3 text-xs font-medium shadow-sm focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            >
              <option value="Hoy">Hoy (En tiempo real)</option>
              <option value="Semana actual">Semana actual</option>
              <option value="Mes en curso (2026)">Mes en curso (2026)</option>
            </select>
          </div>

          {/* Botón refrescar */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              disabled={summaryLoading}
              onClick={() => void refreshSummary()}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-stone-900 px-4.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-stone-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-stone-900 dark:hover:bg-stone-100"
              title="Recalcular métricas de auditoría"
            >
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Indicador de antigüedad del dato (Sección 7 del documento) */}
      <div className="flex items-center justify-between px-2 text-xs text-stone-700 dark:text-stone-300">
        <div className="flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
          <span>
            {summary?.relative_time
              ? `Datos de auditoría calculados ${summary.relative_time}`
              : 'Sincronizado'}
          </span>
        </div>

        <span className="hidden text-[11px] sm:inline">
          Contexto compartido en toda la sesión
        </span>
      </div>

      {/* 2. Barra de pestañas internas */}
      <div
        role="tablist"
        aria-label="Pestañas del módulo de auditoría"
        className="flex overflow-x-auto rounded-2xl border-b border-stone-200/80 bg-white/70 p-1 shadow-xs backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/60"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={`focus-visible:ring-primary relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none ${
                isActive
                  ? 'text-ink font-bold dark:text-white'
                  : 'hover:text-ink text-stone-700 dark:text-stone-300 dark:hover:text-stone-200'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-audit-tab-pill"
                  className="absolute inset-0 rounded-xl bg-stone-100 dark:bg-stone-800"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span>{tab.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Contenido de las pestañas */}
      <div className="pt-2">
        {activeTab === 'resumen' && <AuditSummaryPanel />}
        {activeTab === 'habitaciones' && <AuditRoomsPanel />}
        {activeTab === 'tarifas' && <AuditRatesPanel />}
        {activeTab === 'brechas' && <AuditGapsPanel />}
      </div>
    </div>
  );
}

export function AuditoriaPage() {
  return (
    <AuditScopeProvider>
      <AuditoriaContent />
    </AuditScopeProvider>
  );
}
