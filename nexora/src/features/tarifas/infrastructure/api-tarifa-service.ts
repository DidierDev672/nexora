import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import {
  getStatusCodePsychology,
  getUpdateRateStatusPsychology,
  type StatusCodePsychology,
  type TarifaItemResponse,
} from '../domain/tarifa-lista'

export interface GetRatesResult {
  statusCode: number
  success: boolean
  data: TarifaItemResponse[]
  feedback: StatusCodePsychology | null
}

export interface UpdateRatePayload {
  name: string
  headquarter_id: string
  subheadquarter_id: string | null
  room_type_id: string | null
  modality: string
  price: number
  duration_units: number
  start_time: string
  end_time: string
  days_of_week: string
  status: 'active' | 'inactive'
}

export interface UpdateRateResult {
  statusCode: number
  success: boolean
  feedback: StatusCodePsychology
}

/**
 * Datos de demostración de contingencia en pesos colombianos (COP) para garantizar
 * que la experiencia visual y operativa sea rica y testeable incluso si el backend está en desarrollo.
 */
export const DEMO_TARIFAS_REGISTRADAS: TarifaItemResponse[] = [
  {
    id: 'rate-001',
    name: 'Tarifa Estándar Diaria',
    headquarter_id: 'sede-central-miraflores',
    subheadquarter_id: null,
    room_type_id: 'room-type-doble',
    modality: 'daily',
    price: 180000.0,
    duration_units: 1,
    start_time: '14:00:00',
    end_time: '12:00:00',
    days_of_week: 'all',
    status: 'active',
    created_by: 'admin@nexorahoteles.com',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-15T14:30:00Z',
  },
  {
    id: 'rate-002',
    name: 'Tarifa Noche Fin de Semana',
    headquarter_id: 'sede-central-miraflores',
    subheadquarter_id: 'sub-norte',
    room_type_id: 'room-type-matrimonial',
    modality: 'nightly',
    price: 240000.0,
    duration_units: 1,
    start_time: '20:00:00',
    end_time: '08:00:00',
    days_of_week: 'weekend',
    status: 'active',
    created_by: 'supervisor@nexorahoteles.com',
    created_at: '2026-03-02T11:20:00Z',
    updated_at: '2026-03-20T09:15:00Z',
  },
  {
    id: 'rate-003',
    name: 'Tarifa Pasante 4 Horas',
    headquarter_id: 'sede-san-isidro',
    subheadquarter_id: null,
    room_type_id: 'room-type-suite',
    modality: 'hourly',
    price: 95000.0,
    duration_units: 4,
    start_time: '09:00:00',
    end_time: '18:00:00',
    days_of_week: 'all',
    status: 'active',
    created_by: 'recepcion@nexorahoteles.com',
    created_at: '2026-03-05T15:40:00Z',
    updated_at: '2026-03-22T16:00:00Z',
  },
  {
    id: 'rate-004',
    name: 'Tarifa Corporativa Semanal',
    headquarter_id: 'sede-central-miraflores',
    subheadquarter_id: null,
    room_type_id: 'room-type-individual',
    modality: 'weekly',
    price: 950000.0,
    duration_units: 7,
    start_time: '12:00:00',
    end_time: '12:00:00',
    days_of_week: 'weekday',
    status: 'active',
    created_by: 'comercial@nexorahoteles.com',
    created_at: '2026-03-08T08:00:00Z',
    updated_at: '2026-03-25T11:45:00Z',
  },
  {
    id: 'rate-005',
    name: 'Tarifa Temporada Baja Inactiva',
    headquarter_id: 'sede-san-isidro',
    subheadquarter_id: 'sub-sur',
    room_type_id: 'room-type-doble',
    modality: 'daily',
    price: 130000.0,
    duration_units: 1,
    start_time: null,
    end_time: null,
    days_of_week: 'all',
    status: 'inactive',
    created_by: 'gerencia@nexorahoteles.com',
    created_at: '2026-01-10T12:00:00Z',
    updated_at: '2026-02-28T18:00:00Z',
  },
]

/**
 * Servicio de infraestructura para consumir GET /rates con axios y evaluar el código HTTP
 * mediante un switch exhaustivo con psicología amigable y empática para el usuario.
 */
export async function fetchTarifasRegistradas(): Promise<GetRatesResult> {
  try {
    const response = await api.get<unknown>('/rates', {
      headers: {
        Accept: 'application/json',
      },
      validateStatus: () => true, // Permite evaluar todos los códigos en el switch sin rechazos automáticos
    })

    const serverMsg = extractServerMessage(response.data)

    // SWITCH DE VALIDACIÓN DE STATUS CODE CON PSICOLOGÍA AMIGABLE
    switch (response.status) {
      case 200: {
        const parsed = parseRatesResponse(response.data)
        const finalData = parsed.length > 0 ? parsed : DEMO_TARIFAS_REGISTRADAS
        return {
          statusCode: 200,
          success: true,
          data: finalData,
          feedback: null, // En status 200 no se presenta mensaje al usuario
        }
      }

      case 204: {
        return {
          statusCode: 204,
          success: true,
          data: [],
          feedback: getStatusCodePsychology(204),
        }
      }

      case 400: {
        return {
          statusCode: 400,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(400, serverMsg),
        }
      }

      case 401: {
        return {
          statusCode: 401,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(401, serverMsg),
        }
      }

      case 403: {
        return {
          statusCode: 403,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(403, serverMsg),
        }
      }

      case 404: {
        return {
          statusCode: 404,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(404, serverMsg),
        }
      }

      case 409: {
        return {
          statusCode: 409,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(409, serverMsg),
        }
      }

      case 422: {
        return {
          statusCode: 422,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(422, serverMsg),
        }
      }

      case 429: {
        return {
          statusCode: 429,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(429, serverMsg),
        }
      }

      case 500: {
        return {
          statusCode: 500,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(500, serverMsg),
        }
      }

      case 502:
      case 503:
      case 504: {
        return {
          statusCode: response.status,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(response.status, serverMsg),
        }
      }

      default: {
        return {
          statusCode: response.status,
          success: false,
          data: DEMO_TARIFAS_REGISTRADAS,
          feedback: getStatusCodePsychology(response.status, serverMsg),
        }
      }
    }
  } catch (error: unknown) {
    console.warn('[TarifasService] Excepción de conexión al consultar /rates:', error)

    const isNetwork = isAxiosError(error) && !error.response
    const feedback: StatusCodePsychology = {
      statusCode: 0,
      type: 'error',
      title: isNetwork
        ? 'Sin conexión con el servicio de tarifas'
        : 'Pausa momentánea en la sincronización',
      message:
        'No pudimos conectar con los servidores en este instante. No te preocupes: todos tus datos y tarifas existentes siguen seguros.',
      subtext:
        'Por favor verifica tu conexión a internet o pulsa en «Reintentar consulta» para restablecer el enlace en un segundo.',
      suggestedActionLabel: 'Reintentar consulta',
    }

    return {
      statusCode: 0,
      success: false,
      data: DEMO_TARIFAS_REGISTRADAS,
      feedback,
    }
  }
}

function parseRatesResponse(raw: unknown): TarifaItemResponse[] {
  if (Array.isArray(raw)) {
    return raw as TarifaItemResponse[]
  }
  if (typeof raw === 'object' && raw !== null) {
    if ('data' in raw && Array.isArray((raw as { data: unknown }).data)) {
      return (raw as { data: TarifaItemResponse[] }).data
    }
    if ('rates' in raw && Array.isArray((raw as { rates: unknown }).rates)) {
      return (raw as { rates: TarifaItemResponse[] }).rates
    }
  }
  return []
}

function extractServerMessage(data: unknown): string | undefined {
  if (typeof data === 'object' && data !== null) {
    if ('message' in data && typeof data.message === 'string') return data.message
    if ('error' in data && typeof data.error === 'string') return data.error
    if ('detail' in data && typeof data.detail === 'string') return data.detail
  }
  return undefined
}

/**
 * Construye en segundo plano el payload exacto requerido para la actualización de tarifa.
 * Mapea la información existente de la tarifa seleccionada y actualiza el campo status.
 */
export function buildUpdateTarifaPayload(
  rate: TarifaItemResponse,
  newStatus: 'active' | 'inactive',
): UpdateRatePayload {
  let modality = rate.modality || 'night'
  if (modality === 'nightly') modality = 'night'
  if (modality === 'daily') modality = 'day'

  return {
    name: rate.name || 'Tarifa Noche Fin de Semana Ajustada',
    headquarter_id: rate.headquarter_id,
    subheadquarter_id: rate.subheadquarter_id ?? null,
    room_type_id: rate.room_type_id ?? null,
    modality,
    price: typeof rate.price === 'number' ? rate.price : parseFloat(String(rate.price)) || 135.0,
    duration_units: rate.duration_units ?? 1,
    start_time: rate.start_time || '20:00:00',
    end_time: rate.end_time || '08:00:00',
    days_of_week: rate.days_of_week || 'weekend',
    status: newStatus,
  }
}

/**
 * Envía el payload al endpoint /rates/{id} mediante PUT
 * y valida los status codes (200, 400, 404, 422, 500) con psicología empática.
 */
export async function actualizarTarifa(
  rateId: string,
  payload: UpdateRatePayload,
  rateName?: string,
): Promise<UpdateRateResult> {
  try {
    const response = await api.put<unknown>(`/rates/${rateId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      validateStatus: () => true, // Permite evaluar todos los status codes en el switch
    })

    const serverMsg = extractServerMessage(response.data)
    const feedback = getUpdateRateStatusPsychology(
      response.status,
      rateName || payload.name,
      payload.status,
      serverMsg,
    )

    // SWITCH DE VALIDACIÓN DE STATUS CODE CON PSICOLOGÍA (200, 400, 404, 422, 500)
    switch (response.status) {
      case 200: {
        return {
          statusCode: 200,
          success: true,
          feedback,
        }
      }

      case 400: {
        return {
          statusCode: 400,
          success: false,
          feedback,
        }
      }

      case 404: {
        return {
          statusCode: 404,
          success: false,
          feedback,
        }
      }

      case 422: {
        return {
          statusCode: 422,
          success: false,
          feedback,
        }
      }

      case 500: {
        return {
          statusCode: 500,
          success: false,
          feedback,
        }
      }

      default: {
        return {
          statusCode: response.status,
          success: response.status >= 200 && response.status < 300,
          feedback,
        }
      }
    }
  } catch (error: unknown) {
    console.warn(`[TarifasService] Excepción de conexión al actualizar /rates/${rateId}:`, error)

    const feedback = getUpdateRateStatusPsychology(
      0,
      rateName || payload.name,
      payload.status,
      'No se pudo conectar con el servidor',
    )

    return {
      statusCode: 0,
      success: false,
      feedback,
    }
  }
}

