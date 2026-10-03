import type {
  AuditScope,
  AuditSummaryResponse,
  InactiveTariffInUse,
  PhysicalCheckRecord,
  RateAuditItem,
  RateFilterParams,
  RoomAuditItem,
  RoomAuditStatus,
  RoomWithoutTariff,
} from './audit-types'

export interface AuditRepository {
  /**
   * Obtiene el resumen ejecutivo con KPIs K1–K6 y desglose por entidad (GET /audit/summary).
   */
  getSummary(scope?: Partial<AuditScope>): Promise<AuditSummaryResponse>

  /**
   * Obtiene las habitaciones filtradas por estado físico/sistema (GET /audit/rooms/by-status/{status}).
   */
  getRoomsByStatus(status: RoomAuditStatus, scope?: Partial<AuditScope>): Promise<RoomAuditItem[]>

  /**
   * Obtiene la auditoría de tarifas con validación de invariante R14 (GET /audit/rates).
   */
  getRates(params?: RateFilterParams, scope?: Partial<AuditScope>): Promise<RateAuditItem[]>

  /**
   * Obtiene las habitaciones sin tarifa asignada (GET /audit/rooms-without-tariff).
   */
  getRoomsWithoutTariff(scope?: Partial<AuditScope>): Promise<RoomWithoutTariff[]>

  /**
   * Obtiene las tarifas inactivas que siguen aplicadas a habitaciones (GET /audit/tariffs-inactive-in-use).
   */
  getTariffsInactiveInUse(scope?: Partial<AuditScope>): Promise<InactiveTariffInUse[]>

  /**
   * Registra la verificación física manual (offline-first o persistida).
   */
  savePhysicalCheck(roomId: string, record: PhysicalCheckRecord): Promise<void>

  /**
   * Reactiva una tarifa inactiva que está en uso.
   */
  reactivateTariff(tariffId: string): Promise<boolean>

  /**
   * Desvincula una tarifa inactiva de las habitaciones afectadas.
   */
  unlinkTariffFromRooms(tariffId: string, roomIds: string[]): Promise<boolean>
}
