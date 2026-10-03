import { api } from '../../../lib/api'
import {
  mapDiasSemanaToEnglish,
  mapModalidadToEnglish,
  type TarifaApiPayload,
} from '../domain/tarifa'

/**
 * Obtiene el email de created_by desde el JSON `auth_token` almacenado en localStorage.
 * Busca la propiedad `Email` (o `email`). Si no existe o falla, recurre a 'supervisor@nexora.com'.
 */
export function getCreatedByFromLocalStorage(): string {
  const fallback = 'supervisor@nexora.com'
  try {
    const rawAuthToken = window.localStorage.getItem('auth_token')
    if (rawAuthToken) {
      try {
        const parsed = JSON.parse(rawAuthToken) as Record<string, unknown>
        if (parsed && typeof parsed === 'object') {
          const email = parsed.Email ?? parsed.email
          if (typeof email === 'string' && email.trim().length > 0) {
            return email.trim()
          }
        }
      } catch {
        // En caso de que sea un token JWT almacenado como cadena plana
        const parts = rawAuthToken.split('.')
        if (parts.length >= 2) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const decoded = atob(base64)
          const jwtData = JSON.parse(decoded) as Record<string, unknown>
          const email = jwtData.Email ?? jwtData.email
          if (typeof email === 'string' && email.trim().length > 0) {
            return email.trim()
          }
        }
        if (rawAuthToken.includes('@')) {
          return rawAuthToken.trim()
        }
      }
    }
  } catch {
    // Si localStorage no se encuentra disponible, se usa el fallback
  }
  return fallback
}

/**
 * Construye el payload base requerido para registrar la tarifa.
 */
export function buildTarifaPayload(
  customOverrides?: Partial<TarifaApiPayload>,
): TarifaApiPayload {
  return {
    name: customOverrides?.name ?? 'Tarifa Noche Fin de Semana',
    headquarter_id: customOverrides?.headquarter_id ?? 'hq-1',
    subheadquarter_id: customOverrides?.subheadquarter_id ?? null,
    room_type_id: customOverrides?.room_type_id ?? null,
    modality: mapModalidadToEnglish(customOverrides?.modality),
    price: customOverrides?.price ?? 120.0,
    duration_units: customOverrides?.duration_units ?? 1,
    start_time: customOverrides?.start_time ?? '20:00:00',
    end_time: customOverrides?.end_time ?? '08:00:00',
    days_of_week: mapDiasSemanaToEnglish(customOverrides?.days_of_week),
    status: customOverrides?.status ?? 'active',
    created_by: customOverrides?.created_by ?? getCreatedByFromLocalStorage(),
  }
}

export interface RegistrarTarifaResult {
  ok: boolean
  status: number
  data?: unknown
  error?: unknown
}

/**
 * Envía el payload de la tarifa al endpoint POST /rate.
 */
export async function registrarTarifaApi(
  payloadOverrides?: Partial<TarifaApiPayload>,
): Promise<RegistrarTarifaResult> {
  const payload = buildTarifaPayload(payloadOverrides)

  try {
    const response = await api.post('/rate', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Permite evaluar manualmente el status code sin excepciones automáticas
    })

    return {
      ok: response.status === 201,
      status: response.status,
      data: response.data,
    }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error,
    }
  }
}
