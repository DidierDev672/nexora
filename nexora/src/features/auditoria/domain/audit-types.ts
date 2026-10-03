/**
 * Tipos de dominio para el módulo de auditoría de Nexora
 * Basado en la especificación de arquitectura de auditoría (K1-K6, R1-R20, matriz físico vs. sistema).
 */

export type AuditTabId = 'resumen' | 'habitaciones' | 'tarifas' | 'brechas'

export type ConformityVerdict = 'conforme' | 'no_conforme' | 'en_observacion'

export type RoomAuditStatus =
  | 'disponibles'
  | 'ocupadas'
  | 'mantenimiento'
  | 'limpieza'
  | 'inactivas'

export type PhysicalVerificationStatus = 'coincide' | 'no_coincide' | 'pendiente'

export interface AuditScope {
  headquarter_id?: string
  subheadquarter_id?: string
  periodo: string
}

export interface KpiProgressMetric {
  value: number // p. ej. 88.1
  target: number // p. ej. 95
  label: string
  subtext: string
  isCompliant: boolean
}

export interface KpiCountMetric {
  count: number
  target: number
  label: string
  severity: 'baja' | 'media' | 'alta'
  subtext: string
}

export interface AuditKpis {
  k1_tariff_coverage: KpiProgressMetric & {
    total_rooms: number
    rooms_with_tariff: number
  }
  k2_state_coherence: KpiProgressMetric & {
    matching_rooms: number
    total_evaluated: number
  }
  k3_duplicate_default_tariffs: KpiCountMetric & {
    affected_modalities: string[]
  }
  k4_financial_gaps: KpiCountMetric & {
    unpriced_rooms_count: number
  }
  k5_inactive_tariffs_in_use: KpiCountMetric & {
    affected_rooms_count: number
    tariffs_count: number
  }
  k6_traceability: KpiProgressMetric & {
    total_audited_records: number
    records_with_creator: number
  }
}

export interface EntityCountDetail {
  total: number
  active: number
  inactive: number
}

export interface EntitySummary {
  edificios: EntityCountDetail
  habitaciones: EntityCountDetail & {
    by_status: Record<RoomAuditStatus, number>
  }
  tipos_cama: EntityCountDetail
  sedes: EntityCountDetail
  sub_sedes: EntityCountDetail
  tarifas: EntityCountDetail
  tarifas_aplicadas: {
    total: number
    unique_rooms: number
  }
}

export interface AuditSummaryResponse {
  scope: AuditScope
  calculated_at: string
  relative_time: string
  job_status: 'completed' | 'running' | 'stale'
  kpis: AuditKpis
  entities: EntitySummary
}

export interface PhysicalCheckRecord {
  status: PhysicalVerificationStatus
  notes?: string
  verified_at?: string
  verified_by?: string
}

export interface RoomAuditItem {
  id: string
  number: string
  floor: number | string
  building_id: string
  building_name: string
  room_types_id?: string
  room_type_name?: string
  system_status: RoomAuditStatus
  applied_tariff_id?: string | null
  applied_tariff_name?: string | null
  applied_tariff_price?: number | null
  has_tariff: boolean
  verdict: ConformityVerdict
  verdict_notes?: string
  physical_check?: PhysicalCheckRecord
}

export interface RateAuditItem {
  id: string
  name: string
  price: number
  modality: string
  days_of_week: string[]
  days_of_week_label: string
  status: 'active' | 'inactive'
  is_default: boolean
  rooms_count: number
  /** Regla R14: Invariante financiera donde price <= 0 */
  has_financial_anomaly: boolean
}

export interface RateFilterParams {
  modality?: string
  status?: string
  days_of_week?: string
  search?: string
}

export interface RoomWithoutTariff {
  id: string
  number: string
  building_name: string
  floor: number | string
  system_status: string
  capacity: number
}

export interface InactiveTariffAffectedRoom {
  id: string
  number: string
  building_name: string
  floor: number | string
}

export interface InactiveTariffInUse {
  tariff_id: string
  tariff_name: string
  price: number
  modality: string
  rooms_count: number
  affected_rooms: InactiveTariffAffectedRoom[]
}

export interface AuditGapsResponse {
  rooms_without_tariff: RoomWithoutTariff[]
  tariffs_inactive_in_use: InactiveTariffInUse[]
}
