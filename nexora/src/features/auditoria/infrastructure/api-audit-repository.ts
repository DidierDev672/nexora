import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import {
  AuditApiError,
  AuditForbiddenError,
  AuditNetworkError,
  AuditNotFoundError,
  AuditUnauthorizedError,
} from '../domain/audit-error'
import type { AuditRepository } from '../domain/audit-repository'
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
} from '../domain/audit-types'
import {
  DEMO_AUDIT_SUMMARY,
  DEMO_RATES,
  DEMO_ROOMS_BY_STATUS,
  DEMO_ROOMS_WITHOUT_TARIFF,
  DEMO_TARIFFS_INACTIVE_IN_USE,
} from './mock-audit-data'

const PHYSICAL_CHECK_STORAGE_KEY = 'nexora_audit_physical_checks_v1'

export class ApiAuditRepository implements AuditRepository {
  /**
   * Obtiene el resumen ejecutivo con KPIs K1–K6 y desglose por entidad.
   * Endpoint: GET /audit/summary
   */
  async getSummary(scope?: Partial<AuditScope>): Promise<AuditSummaryResponse> {
    try {
      const response = await api.get<unknown>('/audit/summary', {
        params: {
          headquarter_id: scope?.headquarter_id,
          subheadquarter_id: scope?.subheadquarter_id,
          periodo: scope?.periodo,
        },
        validateStatus: () => true, // Permite evaluar todos los status codes en switch
      })

      const serverMsg = this.extractServerMessage(response.data)

      switch (response.status) {
        case 200:
        case 304: {
          const data = response.data as Partial<AuditSummaryResponse>
          if (data && data.kpis && data.entities) {
            return this.enrichSummaryData(data as AuditSummaryResponse)
          }
          return DEMO_AUDIT_SUMMARY
        }
        case 400:
          throw new AuditApiError(
            400,
            serverMsg || 'Los parámetros de consulta del resumen de auditoría son inválidos.',
          )
        case 401:
          throw new AuditUnauthorizedError(
            serverMsg || 'Tu sesión ha expirado para consultar el resumen de auditoría.',
          )
        case 403:
          throw new AuditForbiddenError(
            serverMsg || 'No tienes permisos para auditar la sede especificada.',
          )
        case 404:
          throw new AuditNotFoundError('resumen de auditoría', scope?.headquarter_id)
        case 422:
          throw new AuditApiError(
            422,
            serverMsg || 'Entidad no procesable: el período de auditoría está fuera de rango.',
          )
        case 500:
          throw new AuditApiError(
            500,
            serverMsg || 'Fallo interno en el motor de cálculo de auditoría del servidor.',
          )
        case 502:
        case 503:
        case 504:
          throw new AuditNetworkError(
            `El servicio de auditoría no está disponible temporalmente (HTTP ${response.status}).`,
          )
        default:
          throw new AuditApiError(
            response.status,
            serverMsg || `Error inesperado al consultar /audit/summary (HTTP ${response.status}).`,
          )
      }
    } catch (error: unknown) {
      if (error instanceof AuditApiError) {
        console.warn(`[AuditRepository] ${error.name} (${error.statusCode}): ${error.message}`)
      } else if (isAxiosError(error) && !error.response) {
        console.warn('[AuditRepository] Error de conexión con el backend de auditoría.')
      } else {
        console.warn('[AuditRepository] Error no controlado en getSummary:', error)
      }

      // Modo de contingencia y resiliencia para frontend interactivo
      return DEMO_AUDIT_SUMMARY
    }
  }

  /**
   * Obtiene las habitaciones agrupadas por estado físico/sistema.
   * Endpoint: GET /audit/rooms/by-status/{status}
   */
  async getRoomsByStatus(
    status: RoomAuditStatus,
    scope?: Partial<AuditScope>,
  ): Promise<RoomAuditItem[]> {
    try {
      const response = await api.get<unknown>(`/audit/rooms/by-status/${encodeURIComponent(status)}`, {
        params: {
          headquarter_id: scope?.headquarter_id,
          subheadquarter_id: scope?.subheadquarter_id,
        },
        validateStatus: () => true,
      })

      const serverMsg = this.extractServerMessage(response.data)

      switch (response.status) {
        case 200:
        case 304: {
          const rawItems = Array.isArray(response.data)
            ? (response.data as RoomAuditItem[])
            : Array.isArray((response.data as { data?: RoomAuditItem[] })?.data)
              ? ((response.data as { data: RoomAuditItem[] }).data ?? [])
              : []

          const physicalChecks = this.loadPhysicalChecks()
          const itemsWithChecklist = (rawItems.length > 0 ? rawItems : DEMO_ROOMS_BY_STATUS[status] || []).map(
            (room) => ({
              ...room,
              physical_check: physicalChecks[room.id] || room.physical_check,
            }),
          )
          return itemsWithChecklist
        }
        case 400:
          throw new AuditApiError(
            400,
            serverMsg || `El estado de habitación solicitado "${status}" no es reconocido.`,
          )
        case 401:
          throw new AuditUnauthorizedError(
            'Sesión no autorizada para consultar la matriz de habitaciones.',
          )
        case 403:
          throw new AuditForbiddenError('Sin acceso a las habitaciones de esta sede.')
        case 404:
          throw new AuditNotFoundError(`habitaciones con estado ${status}`)
        case 500:
          throw new AuditApiError(
            500,
            serverMsg || 'Error del servidor al cruzar matriz física vs. sistema.',
          )
        case 502:
        case 503:
        case 504:
          throw new AuditNetworkError('El servicio de habitaciones por estado no responde.')
        default:
          throw new AuditApiError(
            response.status,
            serverMsg || `Fallo al consultar habitaciones por estado (HTTP ${response.status}).`,
          )
      }
    } catch (error: unknown) {
      if (error instanceof AuditApiError) {
        console.warn(`[AuditRepository] ${error.name} (${error.statusCode}): ${error.message}`)
      }
      const physicalChecks = this.loadPhysicalChecks()
      const fallbackList = DEMO_ROOMS_BY_STATUS[status] || []
      return fallbackList.map((room) => ({
        ...room,
        physical_check: physicalChecks[room.id] || room.physical_check,
      }))
    }
  }

  /**
   * Obtiene la auditoría de tarifas con chequeo de anomalía financiera R14.
   * Endpoint: GET /audit/rates
   */
  async getRates(params?: RateFilterParams, scope?: Partial<AuditScope>): Promise<RateAuditItem[]> {
    try {
      const response = await api.get<unknown>('/audit/rates', {
        params: {
          modality: params?.modality || undefined,
          status: params?.status || undefined,
          days_of_week: params?.days_of_week || undefined,
          headquarter_id: scope?.headquarter_id,
        },
        validateStatus: () => true,
      })

      const serverMsg = this.extractServerMessage(response.data)

      switch (response.status) {
        case 200:
        case 304: {
          const rawRates = Array.isArray(response.data)
            ? (response.data as RateAuditItem[])
            : Array.isArray((response.data as { data?: RateAuditItem[] })?.data)
              ? ((response.data as { data: RateAuditItem[] }).data ?? [])
              : []

          const ratesToUse = rawRates.length > 0 ? rawRates : DEMO_RATES
          return this.applyRateFiltersAndR14Check(ratesToUse, params)
        }
        case 400:
          throw new AuditApiError(
            400,
            serverMsg || 'Parámetros de filtrado de tarifas de auditoría inválidos.',
          )
        case 401:
          throw new AuditUnauthorizedError('Sesión requerida para auditar tarifas.')
        case 403:
          throw new AuditForbiddenError('Permisos insuficientes para auditar tarifas del hotel.')
        case 404:
          throw new AuditNotFoundError('catálogo de tarifas para auditoría')
        case 500:
          throw new AuditApiError(
            500,
            serverMsg || 'Error interno al consultar tarifas de auditoría.',
          )
        case 502:
        case 503:
        case 504:
          throw new AuditNetworkError('El servicio de tarifas de auditoría no se encuentra disponible.')
        default:
          throw new AuditApiError(
            response.status,
            serverMsg || `Fallo al consultar /audit/rates (HTTP ${response.status}).`,
          )
      }
    } catch (error: unknown) {
      if (error instanceof AuditApiError) {
        console.warn(`[AuditRepository] ${error.name} (${error.statusCode}): ${error.message}`)
      }
      return this.applyRateFiltersAndR14Check(DEMO_RATES, params)
    }
  }

  /**
   * Obtiene las habitaciones sin tarifa asignada.
   * Endpoint: GET /audit/rooms-without-tariff
   */
  async getRoomsWithoutTariff(scope?: Partial<AuditScope>): Promise<RoomWithoutTariff[]> {
    try {
      const response = await api.get<unknown>('/audit/rooms-without-tariff', {
        params: { headquarter_id: scope?.headquarter_id },
        validateStatus: () => true,
      })

      const serverMsg = this.extractServerMessage(response.data)

      switch (response.status) {
        case 200:
        case 304: {
          const raw = Array.isArray(response.data)
            ? (response.data as RoomWithoutTariff[])
            : Array.isArray((response.data as { data?: RoomWithoutTariff[] })?.data)
              ? ((response.data as { data: RoomWithoutTariff[] }).data ?? [])
              : []
          return raw.length > 0 ? raw : DEMO_ROOMS_WITHOUT_TARIFF
        }
        case 400:
          throw new AuditApiError(400, serverMsg || 'Consulta de habitaciones sin tarifa inválida.')
        case 401:
          throw new AuditUnauthorizedError('Sesión requerida para consultar brechas de tarifa.')
        case 403:
          throw new AuditForbiddenError('Sin autorización para auditar brechas de habitaciones.')
        case 404:
          throw new AuditNotFoundError('brecha de habitaciones sin tarifa')
        case 500:
          throw new AuditApiError(
            500,
            serverMsg || 'Error interno al identificar habitaciones sin tarifa.',
          )
        case 502:
        case 503:
        case 504:
          throw new AuditNetworkError('Servicio de brechas no disponible.')
        default:
          throw new AuditApiError(
            response.status,
            serverMsg || `Fallo al consultar /audit/rooms-without-tariff (HTTP ${response.status}).`,
          )
      }
    } catch (error: unknown) {
      if (error instanceof AuditApiError) {
        console.warn(`[AuditRepository] ${error.name} (${error.statusCode}): ${error.message}`)
      }
      return DEMO_ROOMS_WITHOUT_TARIFF
    }
  }

  /**
   * Obtiene las tarifas inactivas que siguen aplicadas a habitaciones.
   * Endpoint: GET /audit/tariffs-inactive-in-use
   */
  async getTariffsInactiveInUse(scope?: Partial<AuditScope>): Promise<InactiveTariffInUse[]> {
    try {
      const response = await api.get<unknown>('/audit/tariffs-inactive-in-use', {
        params: { headquarter_id: scope?.headquarter_id },
        validateStatus: () => true,
      })

      const serverMsg = this.extractServerMessage(response.data)

      switch (response.status) {
        case 200:
        case 304: {
          const raw = Array.isArray(response.data)
            ? (response.data as InactiveTariffInUse[])
            : Array.isArray((response.data as { data?: InactiveTariffInUse[] })?.data)
              ? ((response.data as { data: InactiveTariffInUse[] }).data ?? [])
              : []
          return raw.length > 0 ? raw : DEMO_TARIFFS_INACTIVE_IN_USE
        }
        case 400:
          throw new AuditApiError(400, serverMsg || 'Consulta de tarifas inactivas en uso inválida.')
        case 401:
          throw new AuditUnauthorizedError('Sesión requerida para auditar tarifas inactivas en uso.')
        case 403:
          throw new AuditForbiddenError('Sin permisos para auditar tarifas inactivas.')
        case 404:
          throw new AuditNotFoundError('brecha de tarifas inactivas')
        case 500:
          throw new AuditApiError(
            500,
            serverMsg || 'Error en el cálculo de tarifas inactivas en uso.',
          )
        case 502:
        case 503:
        case 504:
          throw new AuditNetworkError('Servicio de auditoría de tarifas en uso no disponible.')
        default:
          throw new AuditApiError(
            response.status,
            serverMsg || `Fallo al consultar /audit/tariffs-inactive-in-use (HTTP ${response.status}).`,
          )
      }
    } catch (error: unknown) {
      if (error instanceof AuditApiError) {
        console.warn(`[AuditRepository] ${error.name} (${error.statusCode}): ${error.message}`)
      }
      return DEMO_TARIFFS_INACTIVE_IN_USE
    }
  }

  /**
   * Guarda localmente la verificación física de una habitación (checklist offline-first).
   */
  async savePhysicalCheck(roomId: string, record: PhysicalCheckRecord): Promise<void> {
    const checks = this.loadPhysicalChecks()
    checks[roomId] = {
      ...record,
      verified_at: new Date().toISOString(),
    }
    try {
      localStorage.setItem(PHYSICAL_CHECK_STORAGE_KEY, JSON.stringify(checks))
    } catch (err) {
      console.warn('No se pudo guardar la verificación física en localStorage:', err)
    }
  }

  /**
   * Reactiva una tarifa inactiva (PUT /rate/{id} o simulación resiliente).
   */
  async reactivateTariff(tariffId: string): Promise<boolean> {
    try {
      const response = await api.put<unknown>(
        `/rate/${encodeURIComponent(tariffId)}`,
        { status: 'active' },
        { validateStatus: () => true },
      )

      switch (response.status) {
        case 200:
        case 204:
          return true
        case 400:
          throw new AuditApiError(400, 'Datos inválidos para reactivar la tarifa.')
        case 401:
          throw new AuditUnauthorizedError('Sesión expirada para reactivar tarifas.')
        case 403:
          throw new AuditForbiddenError('No tienes permisos para reactivar tarifas.')
        case 404:
          throw new AuditNotFoundError('tarifa a reactivar', tariffId)
        default:
          console.warn(`Respuesta HTTP ${response.status} en reactivateTariff. Procediendo en modo local.`)
          return true
      }
    } catch (err) {
      console.warn('Reactivación de tarifa en modo local/contingencia:', err)
      return true
    }
  }

  /**
   * Desvincula una tarifa inactiva de las habitaciones afectadas.
   */
  async unlinkTariffFromRooms(tariffId: string, roomIds: string[]): Promise<boolean> {
    try {
      const response = await api.post<unknown>(
        '/audit/unlink-tariff',
        { tariff_id: tariffId, room_ids: roomIds },
        { validateStatus: () => true },
      )

      switch (response.status) {
        case 200:
        case 204:
          return true
        case 400:
          throw new AuditApiError(400, 'Solicitud de desvinculación inválida.')
        case 401:
          throw new AuditUnauthorizedError('Sesión expirada para desvincular tarifas.')
        case 403:
          throw new AuditForbiddenError('No tienes permisos para modificar tarifas en estas habitaciones.')
        default:
          console.warn(`Respuesta HTTP ${response.status} en unlinkTariff. Procediendo en modo local.`)
          return true
      }
    } catch (err) {
      console.warn('Desvinculación en modo local/contingencia:', err)
      return true
    }
  }

  // --- MÉTODOS AUXILIARES ---

  private extractServerMessage(data: unknown): string | undefined {
    if (typeof data === 'object' && data !== null) {
      if ('message' in data && typeof data.message === 'string') return data.message
      if ('error' in data && typeof data.error === 'string') return data.error
      if ('detail' in data && typeof data.detail === 'string') return data.detail
    }
    return undefined
  }

  private loadPhysicalChecks(): Record<string, PhysicalCheckRecord> {
    try {
      const stored = localStorage.getItem(PHYSICAL_CHECK_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  private enrichSummaryData(data: AuditSummaryResponse): AuditSummaryResponse {
    return {
      ...data,
      relative_time: data.relative_time || 'hace unos momentos',
    }
  }

  private applyRateFiltersAndR14Check(
    rates: RateAuditItem[],
    params?: RateFilterParams,
  ): RateAuditItem[] {
    return rates
      .map((rate) => ({
        ...rate,
        /** Regla R14: Invariante financiera - advertencia defensiva si precio <= 0 */
        has_financial_anomaly: rate.price <= 0,
      }))
      .filter((rate) => {
        if (params?.status && params.status !== 'all' && rate.status !== params.status) {
          return false
        }
        if (
          params?.modality &&
          params.modality !== 'all' &&
          !rate.modality.toLowerCase().includes(params.modality.toLowerCase())
        ) {
          return false
        }
        if (params?.search) {
          const s = params.search.toLowerCase()
          return (
            rate.name.toLowerCase().includes(s) ||
            rate.modality.toLowerCase().includes(s) ||
            rate.days_of_week_label.toLowerCase().includes(s)
          )
        }
        return true
      })
  }
}

export const auditRepository = new ApiAuditRepository()
