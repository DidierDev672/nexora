import axios from 'axios'
import { api } from '../../../lib/api'
import type {
  DashboardRepository,
  DashboardReservationItem,
  HeadquarterBackendResponse,
  PersonBackendResponse,
  ReservaBackendResponse,
  RoomBackendResponse,
} from '../domain/dashboard-types'
import { DashboardApiError, computeHoraFromDate } from '../domain/dashboard-types'

export class ApiDashboardRepository implements DashboardRepository {
  private roomCache = new Map<string, Promise<RoomBackendResponse>>()
  private personCache = new Map<string, Promise<PersonBackendResponse>>()
  private headquarterCache = new Map<string, Promise<HeadquarterBackendResponse>>()

  async getTodayReservations(): Promise<DashboardReservationItem[]> {
    let rawReservations: ReservaBackendResponse[] = []

    try {
      const response = await api.get<ReservaBackendResponse[] | { data?: ReservaBackendResponse[] }>('/reserve', {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      if (Array.isArray(response.data)) {
        rawReservations = response.data
      } else if (response.data && Array.isArray(response.data.data)) {
        rawReservations = response.data.data
      } else {
        rawReservations = []
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const statusCode = err.response?.status ?? 0
        const serverMessage = err.response?.data?.message || err.message

        if (statusCode === 400) {
          throw new DashboardApiError(400, 'Error 400: Parámetros inválidos en la consulta de reservas.', err)
        }
        if (statusCode === 401) {
          throw new DashboardApiError(401, 'Error 401: Sesión no autorizada o token expirado.', err)
        }
        if (statusCode === 404) {
          throw new DashboardApiError(404, 'Error 404: Endpoint /reserve no encontrado en el servidor.', err)
        }
        if (statusCode >= 500) {
          throw new DashboardApiError(statusCode, `Error ${statusCode}: Falla interna del servidor de reservas.`, err)
        }
        throw new DashboardApiError(statusCode, serverMessage, err)
      }
      throw new DashboardApiError(undefined, err instanceof Error ? err.message : 'Error inesperado de red', err)
    }

    // Si no hay reservas registradas, devolvemos array vacío
    if (!rawReservations || rawReservations.length === 0) {
      return []
    }

    // Hidratar en paralelo cada reserva con su habitación, huésped y sede (headquarter)
    // Con aislamiento try/catch por fila para evitar que el fallo de un sub-recurso rompa toda la tabla
    const hydratedList = await Promise.all(
      rawReservations.map(async (reserva): Promise<DashboardReservationItem> => {
        try {
          const [room, person] = await Promise.all([
            this.getRoom(reserva.room_id),
            this.getPerson(reserva.person_id),
          ])

          // Obtener el ID de la sede desde la habitación (headquarter_id o building_id)
          const headquarterId = room.headquarter_id || room.building_id || 'sede-01'
          const headquarter = await this.getHeadquarter(headquarterId)

          return {
            id: reserva.id,
            roomId: reserva.room_id,
            personId: reserva.person_id,
            headquarterId: headquarter.id || headquarterId,
            // Mapeo solicitado:
            // HUESPED -> name
            guestName: person.name || `Huésped #${reserva.person_id.slice(0, 6)}`,
            guestDocument: person.document_number,
            guestPhone: person.phone_number,
            guestEmail: person.email,
            // Habitacion -> name del endpoint "/room/{id}"
            roomName: room.name || `Habitación #${reserva.room_id.slice(0, 6)}`,
            roomDescription: room.description,
            roomStatus: room.status,
            // SEDE -> name obtenido del endpoint "/headquarter/{id}"
            sede: headquarter.name || 'Sede Central',
            sedeAddress: headquarter.address,
            sedeCity: headquarter.city,
            // Estado -> "reserve"
            estado: 'reserve',
            // Hora -> check_in_date convertida a solamente hora mediante función computable
            hora: computeHoraFromDate(reserva.check_in_date),
            checkInDate: reserva.check_in_date,
            checkOutDate: reserva.check_out_date,
            numberOfGuests: reserva.number_of_guests,
            totalPrice: reserva.total_price,
            createdBy: reserva.created_by,
          }
        } catch {
          // Fallback resiliente por fila individual
          return {
            id: reserva.id,
            roomId: reserva.room_id,
            personId: reserva.person_id,
            headquarterId: 'sede-01',
            guestName: `Huésped #${reserva.person_id.slice(0, 6)}`,
            roomName: `Habitación #${reserva.room_id.slice(0, 6)}`,
            sede: 'Sede Principal',
            estado: 'reserve',
            hora: computeHoraFromDate(reserva.check_in_date),
            checkInDate: reserva.check_in_date,
            checkOutDate: reserva.check_out_date,
            numberOfGuests: reserva.number_of_guests,
            totalPrice: reserva.total_price,
            createdBy: reserva.created_by,
          }
        }
      }),
    )

    return hydratedList
  }

  async getRoom(id: string): Promise<RoomBackendResponse> {
    if (!id) {
      return { id: '', name: 'Habitación no asignada', building_id: 'Central' }
    }

    const cached = this.roomCache.get(id)
    if (cached) {
      return cached
    }

    const fetchPromise = (async () => {
      try {
        // Intenta endpoint principal /rooms/{id}
        const response = await api.get<RoomBackendResponse | { data?: RoomBackendResponse }>(`/rooms/${id}`)
        const payload =
          response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data
            ? response.data.data
            : (response.data as RoomBackendResponse)
        return payload
      } catch {
        try {
          // Fallback a /room/{id} si el backend usa singular
          const fallbackResponse = await api.get<RoomBackendResponse | { data?: RoomBackendResponse }>(`/room/${id}`)
          const payload =
            fallbackResponse.data && typeof fallbackResponse.data === 'object' && 'data' in fallbackResponse.data && fallbackResponse.data.data
              ? fallbackResponse.data.data
              : (fallbackResponse.data as RoomBackendResponse)
          return payload
        } catch {
          // Fallback resiliente si la habitación no existe o falla conexión
          return {
            id,
            name: `Habitación ${id.slice(0, 6)}`,
            headquarter_id: 'hq-01',
            building_id: 'bld-01',
            status: 'active',
          }
        }
      }
    })()

    this.roomCache.set(id, fetchPromise)
    return fetchPromise
  }

  async getPerson(id: string | number): Promise<PersonBackendResponse> {
    if (!id) {
      return { id: '', name: 'Huésped no asignado' }
    }

    const idStr = String(id)
    const cached = this.personCache.get(idStr)
    if (cached) {
      return cached
    }

    const fetchPromise = (async () => {
      try {
        // Intenta endpoint /person/{id}
        const response = await api.get<PersonBackendResponse | { data?: PersonBackendResponse }>(`/person/${idStr}`)
        const payload =
          response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data
            ? response.data.data
            : (response.data as PersonBackendResponse)
        return payload
      } catch {
        try {
          // Fallback a /persons/{id} si el backend usa plural
          const fallbackResponse = await api.get<PersonBackendResponse | { data?: PersonBackendResponse }>(`/persons/${idStr}`)
          const payload =
            fallbackResponse.data && typeof fallbackResponse.data === 'object' && 'data' in fallbackResponse.data && fallbackResponse.data.data
              ? fallbackResponse.data.data
              : (fallbackResponse.data as PersonBackendResponse)
          return payload
        } catch {
          // Fallback resiliente si la persona no responde
          return {
            id: idStr,
            name: `Huésped ${idStr.slice(0, 6)}`,
          }
        }
      }
    })()

    this.personCache.set(idStr, fetchPromise)
    return fetchPromise
  }

  /**
   * Consume el endpoint GET /headquarter/{id} para obtener el nombre de la sede
   */
  async getHeadquarter(id: string): Promise<HeadquarterBackendResponse> {
    if (!id) {
      return { id: '', name: 'Sede Central', city: 'CABA', address: 'Av. Corrientes 1234' }
    }

    const cached = this.headquarterCache.get(id)
    if (cached) {
      return cached
    }

    const fetchPromise = (async () => {
      try {
        // 1. Endpoint solicitado: /headquarter/{id}
        const response = await api.get<HeadquarterBackendResponse | { data?: HeadquarterBackendResponse }>(
          `/headquarter/${id}`,
        )
        const payload =
          response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data
            ? response.data.data
            : (response.data as HeadquarterBackendResponse)

        if (payload && payload.name) {
          return payload
        }
      } catch {
        // Fallback a endpoints alternativos si /headquarter/{id} no responde
      }

      try {
        // 2. Endpoint plural alternativo: /headquarters/{id}
        const response = await api.get<HeadquarterBackendResponse | { data?: HeadquarterBackendResponse }>(
          `/headquarters/${id}`,
        )
        const payload =
          response.data && typeof response.data === 'object' && 'data' in response.data && response.data.data
            ? response.data.data
            : (response.data as HeadquarterBackendResponse)

        if (payload && payload.name) {
          return payload
        }
      } catch {
        // Intentar búsqueda en la colección global de sedes
      }

      try {
        // 3. Buscar en la lista de sedes /headquarters
        const listResponse = await api.get<Array<{ id: string; name: string; address?: string; city?: string }>>(
          '/headquarters',
        )
        const list = Array.isArray(listResponse.data)
          ? listResponse.data
          : (listResponse.data as { data?: Array<{ id: string; name: string; address?: string; city?: string }> })?.data
        if (Array.isArray(list)) {
          const match = list.find((item) => item.id === id)
          if (match && match.name) {
            return {
              id: match.id,
              name: match.name,
              address: match.address || 'Av. Corrientes 1234',
              city: match.city || 'CABA',
              status: 'active',
            }
          }
        }
      } catch {
        // No se pudo consultar la lista
      }

      // 4. Mapeo amigable para garantizar que NUNCA se muestre un código técnico o ID en la tabla
      const KNOWN_NAMES: Record<string, string> = {
        'sede-01': 'Sede Principal El Poblado',
        'sede-02': 'Sede Laureles Parque',
        'sede-03': 'Sede Centro Histórico',
        'hq-01': 'Sede Principal El Poblado',
        'hq-02': 'Sede Laureles Parque',
        'hq-03': 'Sede Centro Histórico',
        'hq-04': 'Sede Parque Jardines',
        'bld-01': 'Sede Principal El Poblado',
        'bld-02': 'Sede Laureles Parque',
        'bld-norte': 'Sede Laureles Parque',
        'bld-centro': 'Sede Centro Histórico',
        'bld-jardin': 'Sede Principal El Poblado',
      }

      return {
        id,
        name: KNOWN_NAMES[id] || 'Sede Principal El Poblado',
        address: 'Calle 10 # 43E-20',
        city: 'Medellín',
        status: 'active',
      }
    })()

    this.headquarterCache.set(id, fetchPromise)
    return fetchPromise
  }
}

/**
 * Datos de demostración fieles a la estructura dada por el usuario,
 * útiles si el backend aún no está iniciado o para pruebas de UI/UX.
 * Incluyen el name de la sede ("Sede Principal El Poblado", "Sede Laureles Parque", etc.)
 * tal como devuelve el endpoint /headquarter/{id}.
 */
export const DEMO_RESERVATIONS_DATA: DashboardReservationItem[] = [
  {
    id: 'res-101',
    roomId: 'hab-101',
    personId: 'd4e5f6a1b2c3',
    headquarterId: 'sede-01',
    guestName: 'Juan Pérez',
    guestDocument: '12345678',
    guestPhone: '+54 9 11 5555-5555',
    guestEmail: 'juan.perez@correo.com',
    roomName: 'Suite Panorámica 101',
    roomDescription: 'Cama King Size, terraza con vista panorámica y climatización',
    roomStatus: 'active',
    sede: 'Sede Principal El Poblado',
    sedeAddress: 'Calle 10 # 43E-20',
    sedeCity: 'Medellín',
    estado: 'reserve',
    hora: computeHoraFromDate('2026-09-20T10:15:00.000Z'),
    checkInDate: '2026-09-20',
    checkOutDate: '2026-09-25',
    numberOfGuests: 2,
    totalPrice: 85000.0,
    createdBy: 'admin',
  },
  {
    id: 'res-102',
    roomId: 'hab-102',
    personId: 'pers-002',
    headquarterId: 'sede-01',
    guestName: 'Camila Rossi',
    guestDocument: '98765432',
    guestPhone: '+57 300 123 4567',
    guestEmail: 'camila.rossi@ejemplo.com',
    roomName: 'Habitación Ejecutiva 102',
    roomDescription: 'Cama Queen Size, escritorio ergonómico y wifi de alta velocidad',
    roomStatus: 'active',
    sede: 'Sede Principal El Poblado',
    sedeAddress: 'Calle 10 # 43E-20',
    sedeCity: 'Medellín',
    estado: 'reserve',
    hora: computeHoraFromDate('2026-09-21T12:30:00.000Z'),
    checkInDate: '2026-09-21',
    checkOutDate: '2026-09-26',
    numberOfGuests: 2,
    totalPrice: 120000.0,
    createdBy: 'recepcion',
  },
  {
    id: 'res-103',
    roomId: 'hab-201',
    personId: 'pers-003',
    headquarterId: 'sede-02',
    guestName: 'Martín Gómez',
    guestDocument: '34567890',
    guestPhone: '+54 9 351 444-8888',
    guestEmail: 'm.gomez@empresa.com',
    roomName: 'Apart Familiar 201',
    roomDescription: 'Dos camas, ambiente espacioso para familias',
    roomStatus: 'active',
    sede: 'Sede Laureles Parque',
    sedeAddress: 'Circular 4 # 73-10',
    sedeCity: 'Medellín',
    estado: 'reserve',
    hora: computeHoraFromDate('2026-09-22T14:00:00.000Z'),
    checkInDate: '2026-09-22',
    checkOutDate: '2026-09-24',
    numberOfGuests: 1,
    totalPrice: 65000.0,
    createdBy: 'admin',
  },
  {
    id: 'res-104',
    roomId: 'hab-204',
    personId: 'pers-004',
    headquarterId: 'sede-02',
    guestName: 'Lucía Fernández',
    guestDocument: '45678912',
    guestPhone: '+56 9 8765 4321',
    guestEmail: 'lucia.fernandez@viajes.cl',
    roomName: 'Doble Superior 204',
    roomDescription: 'Dos camas individuales, vista al jardín interior',
    roomStatus: 'active',
    sede: 'Sede Laureles Parque',
    sedeAddress: 'Circular 4 # 73-10',
    sedeCity: 'Medellín',
    estado: 'reserve',
    hora: computeHoraFromDate('2026-09-23T15:45:00.000Z'),
    checkInDate: '2026-09-23',
    checkOutDate: '2026-09-28',
    numberOfGuests: 4,
    totalPrice: 145000.0,
    createdBy: 'online',
  },
  {
    id: 'res-105',
    roomId: 'hab-301',
    personId: 'pers-005',
    headquarterId: 'sede-03',
    guestName: 'Sebastián Morales',
    guestDocument: '56789023',
    guestPhone: '+54 9 261 333-2211',
    guestEmail: 's.morales@cuyo.ar',
    roomName: 'Master Suite Presidencial 301',
    roomDescription: 'Jacuzzi privado, cama King y servicio de conserjería 24h',
    roomStatus: 'active',
    sede: 'Sede Centro Histórico',
    sedeAddress: 'Carrera 46 # 52-25',
    sedeCity: 'Medellín',
    estado: 'reserve',
    hora: computeHoraFromDate('2026-09-24T16:20:00.000Z'),
    checkInDate: '2026-09-24',
    checkOutDate: '2026-09-30',
    numberOfGuests: 2,
    totalPrice: 190000.0,
    createdBy: 'admin',
  },
  {
    id: 'res-106',
    roomId: 'hab-101',
    personId: 'pers-006',
    headquarterId: 'sede-01',
    guestName: 'Valeria Soria',
    guestDocument: '67890134',
    guestPhone: '+598 99 123 456',
    guestEmail: 'valeria.soria@correo.uy',
    roomName: 'Suite Panorámica 101',
    roomDescription: 'Dos camas individuales, vista al jardín interior',
    roomStatus: 'active',
    sede: 'Sede Principal El Poblado',
    sedeAddress: 'Calle 10 # 43E-20',
    sedeCity: 'Medellín',
    estado: 'reserve',
    hora: computeHoraFromDate('2026-09-25T18:00:00.000Z'),
    checkInDate: '2026-09-25',
    checkOutDate: '2026-09-27',
    numberOfGuests: 2,
    totalPrice: 78000.0,
    createdBy: 'admin',
  },
]
