import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import type {
  RoomTariffPayload,
  RoomTariffRepository,
} from '../domain/room-tariff'

export class ApiRoomTariffRepository implements RoomTariffRepository {
  async assignTariff(payload: RoomTariffPayload): Promise<{
    ok: boolean
    status: number
    data?: unknown
    error?: unknown
  }> {
    try {
      const response = await api.post('/room_tariff', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: () => true, // Evaluamos manualmente el status code sin excepciones automáticas
      })

      return {
        ok: response.status === 201,
        status: response.status,
        data: response.data,
      }
    } catch (error) {
      const status = isAxiosError(error) ? (error.response?.status ?? 0) : 0
      return {
        ok: false,
        status,
        error,
      }
    }
  }
}
