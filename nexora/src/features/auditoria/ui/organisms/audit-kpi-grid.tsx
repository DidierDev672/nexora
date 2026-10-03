import { useAuditScope } from '../../application/audit-scope-context'
import type { AuditKpis } from '../../domain/audit-types'
import { KpiCard } from '../molecules/kpi-card'

export interface AuditKpiGridProps {
  kpis: AuditKpis
}

export function AuditKpiGrid({ kpis }: AuditKpiGridProps) {
  const { navigateToRoomStatus, navigateToGapsSection, navigateToRates } = useAuditScope()

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* K1: Cobertura de tarifas */}
      <KpiCard
        idBadge="K1"
        title="Cobertura de Tarifas"
        subtext={`${kpis.k1_tariff_coverage.rooms_with_tariff} de ${kpis.k1_tariff_coverage.total_rooms} hab. con tarifa activa`}
        variant={{
          type: 'continuous',
          value: kpis.k1_tariff_coverage.value,
          target: kpis.k1_tariff_coverage.target,
        }}
        onClick={() => navigateToGapsSection('unpriced')}
        actionLabel="Ver habitaciones sin tarifa"
      />

      {/* K2: Coherencia de estados (Matriz físico vs. sistema) */}
      <KpiCard
        idBadge="K2"
        title="Coherencia Físico vs. Sistema"
        subtext={`${kpis.k2_state_coherence.matching_rooms} de ${kpis.k2_state_coherence.total_evaluated} registros conciliados`}
        variant={{
          type: 'continuous',
          value: kpis.k2_state_coherence.value,
          target: kpis.k2_state_coherence.target,
        }}
        onClick={() => navigateToRoomStatus('disponibles')}
        actionLabel="Revisar matriz de estados"
      />

      {/* K3: Tarifas default duplicadas */}
      <KpiCard
        idBadge="K3"
        title="Tarifas Default Duplicadas"
        subtext={
          kpis.k3_duplicate_default_tariffs.count === 0
            ? 'Regla de unicidad satisfecha'
            : 'Conflicto de tarifas base simultáneas'
        }
        variant={{
          type: 'discrete',
          count: kpis.k3_duplicate_default_tariffs.count,
          target: kpis.k3_duplicate_default_tariffs.target,
          severity: kpis.k3_duplicate_default_tariffs.severity,
        }}
        onClick={navigateToRates}
        actionLabel="Auditar catálogo de tarifas"
      />

      {/* K4: Brechas financieras (Habitaciones sin precio auditable) */}
      <KpiCard
        idBadge="K4"
        title="Brechas Financieras"
        subtext={`${kpis.k4_financial_gaps.unpriced_rooms_count} habitaciones en riesgo de facturación`}
        variant={{
          type: 'discrete',
          count: kpis.k4_financial_gaps.count,
          target: kpis.k4_financial_gaps.target,
          severity: kpis.k4_financial_gaps.severity,
        }}
        onClick={() => navigateToGapsSection('unpriced')}
        actionLabel="Resolver brechas de precio"
      />

      {/* K5: Tarifas inactivas en uso */}
      <KpiCard
        idBadge="K5"
        title="Tarifas Inactivas en Uso"
        subtext={`${kpis.k5_inactive_tariffs_in_use.affected_rooms_count} habitaciones con tarifa descatalogada`}
        variant={{
          type: 'discrete',
          count: kpis.k5_inactive_tariffs_in_use.count,
          target: kpis.k5_inactive_tariffs_in_use.target,
          severity: kpis.k5_inactive_tariffs_in_use.severity,
        }}
        onClick={() => navigateToGapsSection('inactive_rates')}
        actionLabel="Ir a brechas de tarifas inactivas"
      />

      {/* K6: Trazabilidad (% created_by no vacío) */}
      <KpiCard
        idBadge="K6"
        title="Trazabilidad y Auditoría"
        subtext={`${kpis.k6_traceability.records_with_creator} de ${kpis.k6_traceability.total_audited_records} con autoría registrada`}
        variant={{
          type: 'continuous',
          value: kpis.k6_traceability.value,
          target: kpis.k6_traceability.target,
        }}
        onClick={() => navigateToRoomStatus('disponibles')}
        actionLabel="Ver bitácora de autoría"
      />
    </div>
  )
}
