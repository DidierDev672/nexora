import axios from 'axios'
import { api } from '../../../lib/api'
import { validateStatusCode, type StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { ReservaApiDto, ReservaTone, ReservaViewItem } from '../domain/reserva-list-types'
import { MOCK_PERSON_CATALOG, MOCK_RESERVAS_DATA, MOCK_ROOM_CATALOG } from './mock-reservas-data'

export interface FetchReservasResult {
  items: ReservaViewItem[]
  validation: StatusCodeValidationResult
  isFallback: boolean
}

function parseReservaTone(state: string): { label: string; tone: ReservaTone } {
  const norm = (state || '').toLowerCase().trim()
  if (norm === 'confirmed' || norm === 'confirmada') return { label: 'Confirmada', tone: 'emerald' }
  if (norm === 'pending' || norm === 'pendiente') return { label: 'Pendiente', tone: 'amber' }
  if (norm === 'in progress' || norm === 'en curso') return { label: 'En curso', tone: 'blue' }
  if (norm === 'completed' || norm === 'finalizada') return { label: 'Finalizada', tone: 'purple' }
  if (norm === 'canceled' || norm === 'cancelada') return { label: 'Cancelada', tone: 'red' }
  if (norm === 'no show' || norm === 'no se presento') return { label: 'No se presentó', tone: 'stone' }
  return { label: state || 'Sin estado', tone: 'stone' }
}

function formatLocalDate(isoDate: string): string {
  try {
    const d = new Date(isoDate)
    if (isNaN(d.getTime())) return 'Fecha por definir'
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Fecha por definir'
  }
}

function calculateNights(checkIn: string, checkOut: string): number {
  try {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    const nights = Math.round(diff / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights : 1
  } catch {
    return 1
  }
}

function formatPriceCOP(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '$ 0 COP'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function transformReservaDto(
  dto: ReservaApiDto,
  roomsMap: Map<string, string>,
  personsMap: Map<string, string>
): ReservaViewItem {
  const { label: stateLabel, tone: stateTone } = parseReservaTone(dto.state)
  const roomName = roomsMap.get(dto.room_id) || MOCK_ROOM_CATALOG[dto.room_id]?.name || 'Habitación asignada'
  const personName = personsMap.get(dto.person_id) || MOCK_PERSON_CATALOG[dto.person_id] || 'Huésped registrado'

  return {
    id: dto.id,
    roomId: dto.room_id,
    roomDisplayName: roomName,
    personId: dto.person_id,
    personDisplayName: personName,
    checkInDate: dto.check_in_date,
    checkInFormatted: formatLocalDate(dto.check_in_date),
    checkOutDate: dto.check_out_date,
    checkOutFormatted: formatLocalDate(dto.check_out_date),
    nights: calculateNights(dto.check_in_date, dto.check_out_date),
    numberOfGuests: dto.number_of_guests || 1,
    state: dto.state,
    stateLabel,
    stateTone,
    totalPrice: dto.total_price || 0,
    totalPriceFormatted: formatPriceCOP(dto.total_price || 0),
    createdBy: dto.created_by || 'Recepción',
    createdAt: dto.created_at,
  }
}

export async function fetchReservasFromApi(): Promise<FetchReservasResult> {
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

    const response = await api.get<ReservaApiDto[]>('/reserve', {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && Array.isArray(response.data) && response.data.length > 0) {
      const items = response.data.map((dto) => transformReservaDto(dto, roomsMap, personsMap))
      return { items, validation, isFallback: false }
    }

    // Si responde 200 pero vacío, o código no válido, aplicamos fallback ordenado
    const fallbackItems = MOCK_RESERVAS_DATA.map((dto) => transformReservaDto(dto, roomsMap, personsMap))
    return { items: fallbackItems, validation, isFallback: true }
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status ?? 0 : 0
    const validation = validateStatusCode(status)
    const fallbackItems = MOCK_RESERVAS_DATA.map((dto) => transformReservaDto(dto, roomsMap, personsMap))
    return { items: fallbackItems, validation, isFallback: true }
  }
}
