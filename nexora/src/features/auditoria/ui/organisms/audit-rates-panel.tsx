import { motion } from 'motion/react'
import { fadeIn } from '../../../../design-tokens/motion'
import { useAuditRates } from '../../application/use-audit-rates'

export function AuditRatesPanel() {
  const {
    rates,
    loading,
    error,
    filters,
    setFilterField,
    resetFilters,
    refetch,
    r14AnomalyCount,
  } = useAuditRates()

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Alerta de Invariante Financiera (Regla R14) */}
      {r14AnomalyCount > 0 && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-sm dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
        >
          <span className="text-xl" aria-hidden="true">
            ⚠️
          </span>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm">
              Alerta de Integridad Financiera (Regla R14): {r14AnomalyCount}{' '}
              {r14AnomalyCount === 1 ? 'tarifa detectada' : 'tarifas detectadas'} con precio no
              positivo
            </h4>
            <p className="mt-0.5 opacity-90">
              Se han detectado tarifas con precio ≤ 0 en el catálogo. Esta es una anomalía crítica
              de dominio que no debe aplicarse a reservas activas.
            </p>
          </div>
        </div>
      )}

      {/* 2. Barra de filtros de auditoría de tarifas */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900/90 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Búsqueda */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilterField('search', e.target.value)}
              placeholder="Buscar tarifa..."
              className="h-9 w-full rounded-xl border border-stone-300 bg-stone-50/50 px-3 text-xs text-ink placeholder:text-stone-400 focus:border-primary focus:bg-white focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
            />
          </div>

          {/* Modalidad */}
          <select
            value={filters.modality}
            onChange={(e) => setFilterField('modality', e.target.value)}
            aria-label="Filtrar por modalidad"
            className="h-9 rounded-xl border border-stone-300 bg-stone-50/50 px-3 text-xs font-medium text-ink focus:border-primary focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          >
            <option value="all">Todas las modalidades</option>
            <option value="noche">Por noche</option>
            <option value="horas">Por horas</option>
            <option value="pasante">Pasante</option>
          </select>

          {/* Estado */}
          <select
            value={filters.status}
            onChange={(e) => setFilterField('status', e.target.value)}
            aria-label="Filtrar por estado de tarifa"
            className="h-9 rounded-xl border border-stone-300 bg-stone-50/50 px-3 text-xs font-medium text-ink focus:border-primary focus:outline-none dark:border-stone-700 dark:bg-stone-800 dark:text-white"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Solo activas</option>
            <option value="inactive">Solo inactivas</option>
          </select>

          {(filters.search || filters.modality !== 'all' || filters.status !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <span className="text-xs text-stone-700 dark:text-stone-300">
          Mostrando <strong>{rates.length}</strong> tarifas
        </span>
      </div>

      {/* 3. Tabla de auditoría de tarifas */}
      {loading ? (
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/60" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/40" />
          <div className="h-16 w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/40" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center dark:border-rose-900/60 dark:bg-rose-950/20">
          <p className="text-sm font-semibold text-rose-800 dark:text-rose-300">
            Error al consultar el catálogo de tarifas
          </p>
          <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            onClick={refetch}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Reintentar carga
          </button>
        </div>
      ) : rates.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-stone-50/50 p-10 text-center dark:border-stone-800 dark:bg-stone-900/40">
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No se encontraron tarifas con los filtros seleccionados
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-3 text-xs font-semibold text-primary hover:underline"
          >
            Restablecer filtros
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900/90">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-stone-100 bg-stone-50/90 text-stone-700 dark:border-stone-800 dark:bg-stone-800/50 dark:text-stone-300">
                <tr>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Nombre de Tarifa
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Precio
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Modalidad
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Vigencia (Días)
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Habitaciones Asociadas
                  </th>
                  <th scope="col" className="px-4 py-3.5 font-semibold">
                    Estado en Catálogo
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/80">
                {rates.map((rate) => (
                  <tr
                    key={rate.id}
                    className={`transition-colors hover:bg-stone-50/60 dark:hover:bg-stone-800/40 ${
                      rate.has_financial_anomaly
                        ? 'bg-rose-50/60 dark:bg-rose-950/20'
                        : ''
                    }`}
                  >
                    {/* Nombre y distintivo default */}
                    <td className="px-4 py-3.5 font-medium text-ink dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{rate.name}</span>
                        {rate.is_default && (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Default
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Precio con indicador de invariante R14 */}
                    <td className="px-4 py-3.5 font-bold">
                      {rate.has_financial_anomaly ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2 py-0.5 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                          <span>S/ {rate.price.toFixed(2)}</span>
                          <span className="text-[10px] font-extrabold uppercase">
                            (Anomalía R14)
                          </span>
                        </div>
                      ) : (
                        <span className="text-ink dark:text-white">
                          S/ {rate.price.toFixed(2)}
                        </span>
                      )}
                    </td>

                    {/* Modalidad */}
                    <td className="px-4 py-3.5 text-stone-700 dark:text-stone-300">
                      {rate.modality}
                    </td>

                    {/* Días vigentes traducidos a texto legible */}
                    <td className="px-4 py-3.5 text-stone-700 dark:text-stone-300">
                      <span className="rounded-md bg-stone-100 px-2 py-1 text-[11px] font-medium text-stone-800 dark:bg-stone-800 dark:text-stone-200">
                        {rate.days_of_week_label}
                      </span>
                    </td>

                    {/* Conteo de habitaciones */}
                    <td className="px-4 py-3.5 font-medium text-ink dark:text-white">
                      {rate.rooms_count > 0 ? (
                        <span className="font-semibold">{rate.rooms_count} hab.</span>
                      ) : (
                        <span className="text-stone-600 dark:text-stone-300">Sin uso actual</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-3.5">
                      {rate.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                          Inactiva
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
