import axios from 'axios'
import { api } from '../../../lib/api'
import { validateStatusCode, type StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { ReservaApiDto, ReservaViewItem } from '../domain/reserva-list-types'
import { MOCK_RESERVAS_DATA } from './mock-reservas-data'
import { transformReservaDto } from './api-reserva-list-repository'

export interface FetchReservaDetailResult {
  item: ReservaViewItem | null
  validation: StatusCodeValidationResult
}

export async function fetchReservaDetailFromApi(id: string): Promise<FetchReservaDetailResult> {
  const roomsMap = new Map<string, string>()
  const personsMap = new Map<string, string>()

  try {
    const [resRooms, resPersons] = await Promise.allSettled([
      api.get<Array<{ id: string; number?: string; floor?: number }>>('/room', { validateStatus: () => true }),
      api.get<Array<{ id: string; first_name?: string; last_name?: string; name?: string }>>('/persons', { validateStatus: () => true }),
    ])

    if (resRooms.status === 'fulfilled' && Array.isArray(resRooms.value.data)) {
      resRooms.value.data.forEach((r) => {
        roomsMap.set(r.id, `Habitación ${r.number ?? ''}${r.floor ? ` · Piso ${r.floor}` : ''}`.trim())
      })
    }
    if (resPersons.status === 'fulfilled' && Array.isArray(resPersons.value.data)) {
      resPersons.value.data.forEach((p) => {
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.name || 'Huésped registrado'
        personsMap.set(p.id, fullName)
      })
    }

    const response = await api.get<ReservaApiDto | ReservaApiDto[]>(`/reserve/${id}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      const rawData = Array.isArray(response.data) ? response.data[0] : response.data
      if (rawData) {
        const item = transformReservaDto(rawData, roomsMap, personsMap)
        return { item, validation }
      }
    }

    // Fallback resiliente si no se encuentra en el backend pero existe en mock
    const mockFound = MOCK_RESERVAS_DATA.find((m) => m.id === id)
    if (mockFound) {
      const item = transformReservaDto(mockFound, roomsMap, personsMap)
      return { item, validation }
    }

    return { item: null, validation }
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0
    const validation = validateStatusCode(status)

    const mockFound = MOCK_RESERVAS_DATA.find((m) => m.id === id)
    if (mockFound) {
      const item = transformReservaDto(mockFound, roomsMap, personsMap)
      return { item, validation }
    }

    return { item: null, validation }
  }
}
