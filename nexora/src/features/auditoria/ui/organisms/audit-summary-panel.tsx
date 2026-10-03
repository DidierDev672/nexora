import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { useAuditScope } from '../../application/audit-scope-context'
import { EntitySummaryChips } from '../molecules/entity-summary-chips'
import { AuditKpiGrid } from './audit-kpi-grid'

export function AuditSummaryPanel() {
  const { summary, summaryLoading, summaryError, refreshSummary } = useAuditScope()

  if (summaryLoading && !summary) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-56 animate-pulse rounded-2xl border border-stone-200/80 bg-stone-100 dark:border-stone-800 dark:bg-stone-800/50"
            />
          ))}
        </div>
        <div className="h-16 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/40" />
      </div>
    )
  }

  if (summaryError && !summary) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
        <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
          No se pudo sincronizar el resumen de auditoría
        </p>
        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{summaryError}</p>
        <button
          type="button"
          onClick={() => void refreshSummary()}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
        >
          Reintentar consulta
        </button>
      </div>
    )
  }

  if (!summary) return null

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* 1. Grilla interactiva de KPIs K1–K6 */}
      <section aria-labelledby="kpis-heading">
        <h3 id="kpis-heading" className="sr-only">
          Indicadores clave de auditoría K1 a K6
        </h3>
        <AuditKpiGrid kpis={summary.kpis} />
      </section>

      {/* 2. Desglose compacto de entidades (con tooltip de activos/inactivos) */}
      <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900/80">
        <EntitySummaryChips entities={summary.entities} />
      </section>

      {/* 3. Indicador de cálculo periódico y estado del job */}
      <section className="flex flex-col items-start justify-between gap-3 rounded-xl border border-stone-200/70 bg-stone-50/60 px-4 py-3 text-xs text-stone-700 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-300 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>
            Último job de cálculo:{' '}
            <strong className="text-ink dark:text-white">
              {new Date(summary.calculated_at).toLocaleDateString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
              })}
            </strong>{' '}
            ({summary.relative_time})
          </span>
        </div>

        <button
          type="button"
          disabled={summaryLoading}
          onClick={() => void refreshSummary()}
          className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline disabled:opacity-50"
        >
          <span>🔄 Recalcular indicadores</span>
        </button>
      </section>
    </motion.div>
  )
}
