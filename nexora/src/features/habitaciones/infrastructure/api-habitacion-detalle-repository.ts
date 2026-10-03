import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { HabitacionApiError } from '../domain/habitacion-error'
import type { HabitacionDetalleInput } from '../domain/habitacion-detalle'
import { HABITACION_ESTADO_STATUS } from '../domain/habitacion-detalle'
import type {
  HabitacionDetalleRepository,
  HabitacionRegistroResult,
} from '../domain/habitacion-detalle-repository'
import { readAuthTokenEmail, readAuthUserEmail } from '../../../shared/auth-storage'

function readFloor(value: string): number {
  return Math.trunc(Number(value.trim()))
}

function readPrecio(value: string): number | null {
  const trimmed = value.trim()
  return trimmed ? Number(trimmed.replace(',', '.')) : null
}

export function extractRoomId(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string' && data.trim().length > 0) return data.trim()
  if (typeof data === 'number') return String(data)
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (obj.id != null && String(obj.id).trim().length > 0) return String(obj.id).trim()
    if (obj.room_id != null && String(obj.room_id).trim().length > 0) return String(obj.room_id).trim()
    if (obj.roomId != null && String(obj.roomId).trim().length > 0) return String(obj.roomId).trim()

    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>
      if (nested.id != null && String(nested.id).trim().length > 0) return String(nested.id).trim()
      if (nested.room_id != null && String(nested.room_id).trim().length > 0) return String(nested.room_id).trim()
      if (nested.roomId != null && String(nested.roomId).trim().length > 0) return String(nested.roomId).trim()
    }

    if (obj.room && typeof obj.room === 'object') {
      const nested = obj.room as Record<string, unknown>
      if (nested.id != null && String(nested.id).trim().length > 0) return String(nested.id).trim()
      if (nested.room_id != null && String(nested.room_id).trim().length > 0) return String(nested.room_id).trim()
      if (nested.roomId != null && String(nested.roomId).trim().length > 0) return String(nested.roomId).trim()
    }

    if (obj.result && typeof obj.result === 'object') {
      const nested = obj.result as Record<string, unknown>
      if (nested.id != null && String(nested.id).trim().length > 0) return String(nested.id).trim()
      if (nested.room_id != null && String(nested.room_id).trim().length > 0) return String(nested.room_id).trim()
      if (nested.roomId != null && String(nested.roomId).trim().length > 0) return String(nested.roomId).trim()
    }
  }
  return null
}

export class ApiHabitacionDetalleRepository implements HabitacionDetalleRepository {
  async save(input: HabitacionDetalleInput): Promise<HabitacionRegistroResult> {
    try {
      const createdBy = readAuthTokenEmail() || readAuthUserEmail()
      const payload: Record<string, unknown> = {
        number: input.numero.trim(),
        floor: readFloor(input.piso),
        room_types_id: input.tipoHabitacion,
        building_id: input.edificioId,
        price_override: readPrecio(input.precio),
        status: HABITACION_ESTADO_STATUS[input.estado],
        created_by: createdBy,
      }

      const response = await api.post('/room', payload)

      if (response.status !== 201) {
        throw new HabitacionApiError(response.status)
      }

      const roomId = extractRoomId(response.data)
      return {
        roomId: roomId ?? undefined,
        data: response.data,
      }
    } catch (error) {
      if (error instanceof HabitacionApiError) {
        throw error
      }
      if (isAxiosError(error)) {
        throw new HabitacionApiError(error.response?.status ?? 0)
      }
      throw new HabitacionApiError(0)
    }
  }
}