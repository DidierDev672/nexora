import axios from 'axios'
import { api } from '../../../lib/api'
import {
  ReservaApiError,
  type BedApiResponse,
  type PersonApiResponse,
  type ReservaPayload,
  type RoomApiResponse,
  type TipoCamaApiResponse,
} from '../domain/reserva'
import type { ReservaRepository } from '../domain/reserva-repository'

export class ApiReservaRepository implements ReservaRepository {
  private roomCache = new Map<string, Promise<RoomApiResponse>>()
  private typesBedCache: Promise<TipoCamaApiResponse[]> | null = null

  /**
   * Consulta las camas disponibles (GET /beds)
   * Manejo de status codes: 200 (OK), 401 (Auth), 500 (Server), 0 (Network)
   */
  async getBeds(): Promise<BedApiResponse[]> {
    try {
      const response = await api.get<BedApiResponse[]>('/beds')
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        Array.isArray((response.data as { data?: unknown }).data)
      ) {
        return (response.data as unknown as { data: BedApiResponse[] }).data
      }
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        if (status === 401) {
          throw new ReservaApiError(401, 'Tu sesión ha expirado para consultar las camas. Por favor reingresa.')
        }
        if (status >= 500) {
          throw new ReservaApiError(status, 'El servidor de inventario de camas está en mantenimiento.')
        }
        throw new ReservaApiError(status, 'No fue posible cargar las camas disponibles en este momento.')
      }
      throw new ReservaApiError(0, 'Fallo inesperado de red al conectar con el inventario de camas.')
    }
  }

  /**
   * Consulta la habitación por ID (GET /rooms/{id})
   * Manejo de status codes: 200 (OK), 404 (Not found con fallback resiliente), 500
   */
  async getRoom(id: string): Promise<RoomApiResponse> {
    const cached = this.roomCache.get(id)
    if (cached) {
      return cached
    }

    const fetchPromise = (async () => {
      try {
        const response = await api.get<RoomApiResponse>(`/rooms/${id}`)
        if (response.status === 200 && response.data) {
          return response.data
        }
        return {
          id,
          name: `Habitación ${id.slice(0, 6)}`,
          floor: 1,
          status: 'active',
          price: 185000,
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const status = error.response?.status ?? 0
          if (status === 404) {
            // Fallback resiliente: no rompemos la UI si una habitación fue renombrada
            return {
              id,
              name: `Habitación ${id.slice(0, 6)}`,
              floor: 1,
              status: 'active',
              price: 185000,
            }
          }
        }
        return {
          id,
          name: `Habitación ${id.slice(0, 6)}`,
          floor: 1,
          status: 'active',
          price: 185000,
        }
      }
    })()

    this.roomCache.set(id, fetchPromise)
    return fetchPromise
  }

  /**
   * Consulta el catálogo de confort de camas (GET /types-bed)
   * Manejo de status codes: 200 (OK), 500
   */
  async getTypesBed(): Promise<TipoCamaApiResponse[]> {
    if (this.typesBedCache) {
      return this.typesBedCache
    }

    const fetchPromise = (async () => {
      try {
        const response = await api.get<TipoCamaApiResponse[]>('/types-bed')
        if (response.status === 200 && Array.isArray(response.data)) {
          return response.data
        }
        return []
      } catch {
        return []
      }
    })()

    this.typesBedCache = fetchPromise
    return fetchPromise
  }

  /**
   * Consulta el registro de personas para vincular huéspedes (GET /persons)
   */
  async getPersons(): Promise<PersonApiResponse[]> {
    try {
      const response = await api.get<PersonApiResponse[]>('/persons')
      if (Array.isArray(response.data)) {
        return response.data
      }
      if (
        response.data &&
        typeof response.data === 'object' &&
        'data' in response.data &&
        Array.isArray((response.data as { data?: unknown }).data)
      ) {
        return (response.data as unknown as { data: PersonApiResponse[] }).data
      }
      return []
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        if (status === 401) {
          throw new ReservaApiError(401, 'Sesión no autorizada para consultar personas.')
        }
      }
      return []
    }
  }

  /**
   * Envía la creación de una reserva (POST /reserve)
   * Validación explícita de todos los status codes HTTP:
   * - 200 / 201: Creada
   * - 400: Datos incompletos
   * - 401: Token caducado
   * - 403: Sin permisos
   * - 404: Habitación o cama dada de baja
   * - 409: Conflicto de disponibilidad (cama ocupada)
   * - 422: Regla de negocio rota
   * - 500: Fallo de servidor
   * - 0: Network error / timeout
   */
  async createReserva(payload: ReservaPayload): Promise<{ id?: string; message: string }> {
    try {
      const response = await api.post('/reserve', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Evaluamos manualmente los status codes
      })

      if (response.status === 200 || response.status === 201) {
        const respId =
          response.data && typeof response.data === 'object' && 'id' in response.data
            ? String((response.data as { id: unknown }).id)
            : undefined
        return {
          id: respId,
          message: '¡Tu estadía ha sido asegurada exitosamente en Nexora!',
        }
      }

      const serverMsg =
        typeof response.data === 'object' && response.data !== null && 'message' in response.data
          ? String((response.data as { message: unknown }).message)
          : undefined

      switch (response.status) {
        case 400:
          throw new ReservaApiError(
            400,
            serverMsg || 'Verifica las fechas y datos de tu reserva: faltan parámetros requeridos.',
          )
        case 401:
          throw new ReservaApiError(
            401,
            'Tu sesión ha expirado durante el proceso. Por favor reingresa para confirmar.',
          )
        case 403:
          throw new ReservaApiError(
            403,
            'No cuentas con permisos suficientes para confirmar reservas en este establecimiento.',
          )
        case 404:
          throw new ReservaApiError(
            404,
            'La cama o habitación seleccionada no se encuentra disponible en el catálogo activo.',
          )
        case 409:
          throw new ReservaApiError(
            409,
            '¡Esta cama ya está reservada para ese rango de fechas! Por favor arrastra otra cama desde la barra 3D.',
          )
        case 422:
          throw new ReservaApiError(
            422,
            serverMsg || 'El número de huéspedes excede la capacidad admitida por esta habitación.',
          )
        case 500:
        default:
          throw new ReservaApiError(
            response.status,
            'Tuvimos un inconveniente en los servidores centrales. No te preocupes: tus datos siguen intactos en el formulario.',
          )
      }
    } catch (error) {
      if (error instanceof ReservaApiError) {
        throw error
      }
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 0
        throw new ReservaApiError(
          status,
          'No se pudo establecer conexión con el servidor de reservas. Revisa tu conexión a internet e inténtalo de nuevo.',
        )
      }
      throw new ReservaApiError(
        0,
        'Ocurrió una pausa inesperada en la red. Tus datos permanecen a salvo en el formulario.',
      )
    }
  }
}
