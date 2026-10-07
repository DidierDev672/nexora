import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import {
  calcularNoches,
  ESTADO_OPTIONS,
  formatMetodoPago,
  type CamaInfo,
  type EdificioInfo,
  type HabitacionInfo,
  type HuespedInfo,
  type Recepcion,
  type RecepcionPayload,
  type ReservaInfo,
  type SedeInfo,
  type SubSedeInfo,
  type TipoCamaInfo,
} from '../domain/recepcion'
import {
  RecepcionApiError,
  RecepcionConflictError,
  RecepcionNetworkError,
  RecepcionNotFoundError,
} from '../domain/recepcion-error'
import type { RecepcionRepository } from '../domain/recepcion-repository'

interface RawStay {
  id?: string | number
  room_id?: string
  reservation_id?: string
  person_id?: string
  check_in_date?: string
  check_out_date?: string
  payment_method?: string
  security_deposit?: number | string
  remarks?: string
  status?: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

interface RawRoom {
  id?: string | number
  number?: string | number
  name?: string
  floor?: string | number
  building_id?: string
  room_types_id?: string
  price?: number
  status?: string
  capacity?: number
}

interface RawBuilding {
  id?: string | number
  name?: string
  floor_number?: number
  headquarters_id?: string
  sub_headquarters_id?: string | null
  status?: string
}

interface RawSede {
  id?: string | number
  name?: string
  address?: string
  city?: string
  phone?: string
  status?: string
}

interface RawSubSede {
  id?: string | number
  headquarter_id?: string
  name?: string
  address?: string
  phone?: string
  status?: string
}

interface RawBed {
  id?: string | number
  room_id?: string
  types_bed_id?: string[]
  etiquette?: string
  status?: string
}

interface RawTipoCama {
  id?: string | number
  name?: string
  capacity_people?: number
  description?: string
}

interface RawReserva {
  id?: string | number
  room_id?: string
  person_id?: string
  check_in_date?: string
  check_out_date?: string
  total_price?: number
  state?: string
}

interface RawPerson {
  id?: string | number
  name?: string
  document_type?: string
  document_number?: string
  phone_number?: string
  email?: string
}

const LOCAL_STORAGE_KEY = 'nexora_recepciones_list'

export class ApiRecepcionRepository implements RecepcionRepository {
  private personCache = new Map<string, Promise<HuespedInfo | null>>()
  private roomCache = new Map<string, Promise<HabitacionInfo | null>>()

  /**
   * Obtiene la lista de recepciones/estadías activas e históricas (GET /stay).
   * Se enriquece con la jerarquía física (Sede -> Edificio -> Habitación -> Cama).
   */
  async getRecepciones(): Promise<Recepcion[]> {
    try {
      const response = await api.get<unknown>('/stay', {
        validateStatus: (status) => status >= 200 && status < 300,
      })

      const rawStays: RawStay[] = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response.data as { data?: RawStay[] })?.data)
          ? ((response.data as { data: RawStay[] }).data ?? [])
          : []

      if (rawStays.length > 0) {
        const enriched = await this.enrichRawStays(rawStays)
        this.syncLocalStorage(enriched)
        return enriched
      }
    } catch (error) {
      console.warn('Fallo al obtener recepciones desde GET /stay. Activando modo resiliente:', error)
    }

    // Fallback a almacenamiento local y datos de demostración
    const local = this.loadFromLocalStorage()
    if (local.length > 0) {
      return local
    }

    const demo = await this.getDemoRecepciones()
    this.syncLocalStorage(demo)
    return demo
  }

  /**
   * Registra y persiste una nueva recepción/estadía en el backend (POST /stay).
   */
  async createRecepcion(payload: RecepcionPayload): Promise<Recepcion> {
    try {
      const response = await api.post<Record<string, unknown>>('/stay', payload, {
        validateStatus: () => true, // Permite validar cada status sin rechazo inmediato
      })

      if (response.status === 201) {
        const idGenerado =
          response.data && typeof response.data.id === 'string'
            ? response.data.id
            : `stay-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

        const nuevaRecepcion = await this.buildEnrichedRecepcion(payload, idGenerado)
        this.saveLocally(nuevaRecepcion)
        return nuevaRecepcion
      }

      // Extracción del mensaje entregado por el backend
      const data = response.data
      const serverMsg =
        typeof data === 'object' && data !== null
          ? 'message' in data && typeof data.message === 'string'
            ? data.message
            : 'error' in data && typeof data.error === 'string'
              ? data.error
              : undefined
          : undefined

      switch (response.status) {
        case 400:
          throw new RecepcionApiError(
            400,
            serverMsg || 'Los datos de la recepción o fechas son inconsistentes.',
          )
        case 401:
          throw new RecepcionApiError(
            401,
            'Tu sesión ha expirado. Por favor ingresa nuevamente para registrar la estadía.',
          )
        case 404:
          throw new RecepcionNotFoundError('habitación o huésped', payload.room_id)
        case 409:
          throw new RecepcionConflictError(
            serverMsg || 'La habitación seleccionada ya tiene una estadía activa en ese horario.',
          )
        case 500:
        default:
          throw new RecepcionApiError(
            response.status,
            serverMsg || `Fallo interno en el servidor (Código HTTP ${response.status}).`,
          )
      }
    } catch (error: unknown) {
      if (error instanceof RecepcionApiError) {
        throw error
      }
      if (isAxiosError(error)) {
        if (!error.response) {
          throw new RecepcionNetworkError(
            'No se pudo establecer conexión con el servidor de estadías. Verifica tu conexión.',
          )
        }
        const statusCode = error.response.status
        const msg = error.response.data?.message || error.response.data?.error || error.message
        throw new RecepcionApiError(statusCode, msg)
      }
      throw new RecepcionApiError(
        0,
        error instanceof Error ? error.message : 'Error inesperado al registrar la recepción.',
      )
    }
  }

  async getSedes(): Promise<SedeInfo[]> {
    try {
      const response = await api.get<unknown>('/headquarters', {
        validateStatus: (s) => s === 200,
      })

      const raw: RawSede[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawSede[] })?.data ?? []

      if (raw.length > 0) {
        return raw.map((s) => ({
          id: String(s.id),
          name: s.name || `Sede ${String(s.id).slice(0, 5)}`,
          address: s.address || 'Dirección no especificada',
          city: s.city || 'Medellín',
          phone: s.phone || '+57 4 444 0000',
          status: s.status || 'active',
        }))
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'sede-01',
        name: 'Sede Principal El Poblado',
        address: 'Calle 10 # 43E-20',
        city: 'Medellín',
        phone: '+57 4 444 0000',
        status: 'active',
      },
      {
        id: 'sede-02',
        name: 'Sede Laureles Parque',
        address: 'Circular 4 # 73-10',
        city: 'Medellín',
        phone: '+57 4 444 1111',
        status: 'active',
      },
      {
        id: 'sede-03',
        name: 'Sede Centro Histórico',
        address: 'Carrera 46 # 52-25',
        city: 'Medellín',
        phone: '+57 4 444 2222',
        status: 'active',
      },
    ]
  }

  async getEdificios(sedeId?: string): Promise<EdificioInfo[]> {
    try {
      const response = await api.get<unknown>('/building', {
        validateStatus: (s) => s >= 200 && s < 300,
      })

      const raw: RawBuilding[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawBuilding[] })?.data ?? []

      if (raw.length > 0) {
        const list = raw.map((b) => ({
          id: String(b.id),
          name: b.name || `Torre ${String(b.id).slice(0, 5)}`,
          floor_number: typeof b.floor_number === 'number' ? b.floor_number : 5,
          headquarters_id: String(b.headquarters_id || 'sede-01'),
          sub_headquarters_id: b.sub_headquarters_id ? String(b.sub_headquarters_id) : null,
          status: b.status || 'active',
        }))

        return sedeId ? list.filter((b) => b.headquarters_id === sedeId) : list
      }
    } catch {
      // Fallback
    }

    const demoEdificios: EdificioInfo[] = [
      {
        id: 'bld-01',
        name: 'Torre Panorámica A',
        floor_number: 6,
        headquarters_id: 'sede-01',
        status: 'active',
      },
      {
        id: 'bld-02',
        name: 'Torre Ejecutiva B',
        floor_number: 4,
        headquarters_id: 'sede-01',
        status: 'active',
      },
      {
        id: 'bld-03',
        name: 'Bloque Jardines Laureles',
        floor_number: 3,
        headquarters_id: 'sede-02',
        status: 'active',
      },
      {
        id: 'bld-04',
        name: 'Edificio Colonial Centro',
        floor_number: 5,
        headquarters_id: 'sede-03',
        status: 'active',
      },
    ]

    return sedeId ? demoEdificios.filter((b) => b.headquarters_id === sedeId) : demoEdificios
  }

  async getSubSedes(sedeId: string): Promise<SubSedeInfo[]> {
    if (!sedeId) return []
    try {
      const response = await api.get<unknown>(`/sub-headquarters/by-headquarter/${sedeId}`, {
        validateStatus: (s) => s === 200,
      })

      const raw: RawSubSede[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawSubSede[] })?.data ?? []

      if (raw.length > 0) {
        return raw.map((s) => ({
          id: String(s.id),
          headquarter_id: String(s.headquarter_id || sedeId),
          name: s.name || `Sub-Sede ${String(s.id).slice(0, 5)}`,
          address: s.address || 'Dirección de sub-sede',
          phone: s.phone || '+57 4 300 0000',
          status: s.status || 'active',
        }))
      }
    } catch {
      // Fallback silencioso
    }

    // Demo subsedes para inspección rica
    if (sedeId === 'sede-01') {
      return [
        {
          id: 'sub-01',
          headquarter_id: 'sede-01',
          name: 'Sub-Sede Poblado Parque Lleras',
          address: 'Cra 37 # 8-40',
          phone: '+57 4 311 0000',
          status: 'active',
        },
        {
          id: 'sub-02',
          headquarter_id: 'sede-01',
          name: 'Sub-Sede Milla de Oro',
          address: 'Cra 43A # 1-50',
          phone: '+57 4 311 0001',
          status: 'active',
        },
      ]
    }

    return []
  }

  async getHabitaciones(edificioId?: string): Promise<HabitacionInfo[]> {
    try {
      const response = await api.get<unknown>('/room', {
        validateStatus: (s) => s >= 200 && s < 300,
      })

      const raw: RawRoom[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawRoom[] })?.data ?? []

      if (raw.length > 0) {
        const list: HabitacionInfo[] = raw
          .filter((r) => Boolean(r.id))
          .map((r) => {
            const id = String(r.id)
            const num = r.number ? String(r.number) : id.slice(0, 4)
            const name = r.name || `Habitación ${num}`
            const floor = typeof r.floor === 'number' ? r.floor : Number(r.floor) || 1
            const cap = typeof r.capacity === 'number' ? r.capacity : 2
            const price = typeof r.price === 'number' ? r.price : 150000
            const bId = r.building_id ? String(r.building_id) : 'bld-01'

            return {
              id,
              name,
              number: num,
              floor,
              capacity: cap,
              price,
              building_id: bId,
              room_types_id: r.room_types_id ? String(r.room_types_id) : undefined,
              status: r.status || 'active',
              label: `${name} · Hab. ${num} · Piso ${floor} (${cap} pers.)`,
            }
          })

        return edificioId ? list.filter((r) => r.building_id === edificioId) : list
      }
    } catch {
      // Fallback
    }

    const demoRooms: HabitacionInfo[] = [
      {
        id: 'hab-101',
        name: 'Suite Panorámica 101',
        number: '101',
        floor: 1,
        capacity: 2,
        price: 185000,
        building_id: 'bld-01',
        status: 'active',
        label: 'Suite Panorámica 101 · Piso 1 (2 personas)',
      },
      {
        id: 'hab-102',
        name: 'Habitación Ejecutiva 102',
        number: '102',
        floor: 1,
        capacity: 2,
        price: 120000,
        building_id: 'bld-01',
        status: 'active',
        label: 'Habitación Ejecutiva 102 · Piso 1 (2 personas)',
      },
      {
        id: 'hab-201',
        name: 'Apart Familiar 201',
        number: '201',
        floor: 2,
        capacity: 4,
        price: 240000,
        building_id: 'bld-01',
        status: 'active',
        label: 'Apart Familiar 201 · Piso 2 (4 personas)',
      },
      {
        id: 'hab-204',
        name: 'Doble Superior 204',
        number: '204',
        floor: 2,
        capacity: 2,
        price: 95000,
        building_id: 'bld-02',
        status: 'active',
        label: 'Doble Superior 204 · Piso 2 (2 personas)',
      },
      {
        id: 'hab-301',
        name: 'Master Suite Presidencial 301',
        number: '301',
        floor: 3,
        capacity: 3,
        price: 350000,
        building_id: 'bld-01',
        status: 'active',
        label: 'Master Suite Presidencial 301 · Piso 3 (3 personas)',
      },
    ]

    return edificioId ? demoRooms.filter((r) => r.building_id === edificioId) : demoRooms
  }

  async getHabitacionById(id: string): Promise<HabitacionInfo | null> {
    if (!id) return null
    const cached = this.roomCache.get(id)
    if (cached) return cached

    const fetchPromise = (async () => {
      try {
        const response = await api.get<unknown>(`/rooms/${id}`, {
          validateStatus: (s) => s === 200,
        })
        if (response.data && typeof response.data === 'object') {
          const r = response.data as RawRoom
          const num = r.number ? String(r.number) : id.slice(0, 4)
          const name = r.name || `Habitación ${num}`
          return {
            id,
            name,
            number: num,
            floor: typeof r.floor === 'number' ? r.floor : 1,
            capacity: typeof r.capacity === 'number' ? r.capacity : 2,
            price: typeof r.price === 'number' ? r.price : 150000,
            building_id: r.building_id ? String(r.building_id) : 'bld-01',
            status: r.status || 'active',
            label: `${name} · Hab. ${num}`,
          }
        }
      } catch {
        // Fallback al catálogo general
      }

      const all = await this.getHabitaciones()
      return all.find((r) => r.id === id) ?? null
    })()

    this.roomCache.set(id, fetchPromise)
    return fetchPromise
  }

  async getCamas(roomId?: string): Promise<CamaInfo[]> {
    try {
      const response = await api.get<unknown>('/beds', {
        validateStatus: (s) => s >= 200 && s < 300,
      })

      const raw: RawBed[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawBed[] })?.data ?? []

      if (raw.length > 0) {
        const list: CamaInfo[] = raw.map((b) => ({
          id: String(b.id),
          room_id: String(b.room_id || ''),
          types_bed_id: Array.isArray(b.types_bed_id)
            ? (b.types_bed_id as string[])
            : ['tipo-king-01'],
          etiquette: b.etiquette || 'Cama Principal',
          status: b.status || 'active',
        }))

        return roomId ? list.filter((b) => b.room_id === roomId) : list
      }
    } catch {
      // Fallback
    }

    const demoCamas: CamaInfo[] = [
      {
        id: 'cama-01',
        room_id: 'hab-101',
        types_bed_id: ['tb-01'],
        etiquette: 'Cama King Principal 01',
        status: 'active',
      },
      {
        id: 'cama-02',
        room_id: 'hab-102',
        types_bed_id: ['tb-02'],
        etiquette: 'Cama Queen Ejecutiva',
        status: 'active',
      },
      {
        id: 'cama-03',
        room_id: 'hab-201',
        types_bed_id: ['tb-01', 'tb-03'],
        etiquette: 'Cama King + Sofá Cama',
        status: 'active',
      },
      {
        id: 'cama-04',
        room_id: 'hab-204',
        types_bed_id: ['tb-04'],
        etiquette: 'Dos Camas Twin Individuales',
        status: 'active',
      },
      {
        id: 'cama-05',
        room_id: 'hab-301',
        types_bed_id: ['tb-01'],
        etiquette: 'Cama Presidencial Imperial',
        status: 'active',
      },
    ]

    return roomId ? demoCamas.filter((b) => b.room_id === roomId) : demoCamas
  }

  async getTiposCama(): Promise<TipoCamaInfo[]> {
    try {
      const response = await api.get<unknown>('/types-bed', {
        validateStatus: (s) => s === 200,
      })

      const raw: RawTipoCama[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawTipoCama[] })?.data ?? []

      if (raw.length > 0) {
        return raw.map((t) => ({
          id: String(t.id),
          name: t.name || 'Cama estándar',
          capacity_people: typeof t.capacity_people === 'number' ? t.capacity_people : 2,
          description: t.description || 'Colchón ortopédico de alta densidad',
        }))
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'tb-01',
        name: 'King Size Ortopédica',
        capacity_people: 2,
        description: 'Colchón viscoelástico de alta densidad con soporte ergonómico',
      },
      {
        id: 'tb-02',
        name: 'Queen Size Confort',
        capacity_people: 2,
        description: 'Colchón semi-firme con resortes ensacados individuales',
      },
      {
        id: 'tb-03',
        name: 'Sofá Cama Abatible',
        capacity_people: 1,
        description: 'Sistema abatible suave de lino antifluido con almohadón mullido',
      },
      {
        id: 'tb-04',
        name: 'Twin Individual',
        capacity_people: 1,
        description: 'Cama sencilla compacta con base tapizada y protección antialérgica',
      },
    ]
  }

  async getReservas(): Promise<ReservaInfo[]> {
    try {
      const response = await api.get<unknown>('/reserve', {
        validateStatus: (s) => s >= 200 && s < 300,
      })

      const raw: RawReserva[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawReserva[] })?.data ?? []

      if (raw.length > 0) {
        const enriched: ReservaInfo[] = await Promise.all(
          raw
            .filter((r) => Boolean(r.id))
            .map(async (res) => {
              const id = String(res.id)
              const roomId = String(res.room_id || '')
              const personId = String(res.person_id || '')
              let guestName = ''
              let guestPhone = ''

              if (personId) {
                const p = await this.getPersonById(personId)
                if (p) {
                  guestName = p.name
                  guestPhone = p.phone_number || ''
                }
              }

              const name = guestName || `Huésped #${personId.slice(0, 6) || id.slice(0, 6)}`
              const phone = guestPhone || 'Sin teléfono'

              return {
                id,
                roomId,
                roomName: `Habitación #${roomId.slice(0, 6)}`,
                personId,
                guestName: name,
                guestPhone: phone,
                checkInDate: res.check_in_date || '',
                checkOutDate: res.check_out_date || '',
                totalPrice: res.total_price,
                label: `${name} - ${phone}`,
              }
            }),
        )

        return enriched
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'res-101',
        roomId: 'hab-101',
        roomName: 'Suite Panorámica 101',
        personId: 'pers-001',
        guestName: 'Carlos Mendoza',
        guestPhone: '+57 310 456 7890',
        checkInDate: '2026-09-25T14:00',
        checkOutDate: '2026-09-28T12:00',
        totalPrice: 555000,
        label: 'Carlos Mendoza - +57 310 456 7890',
      },
      {
        id: 'res-102',
        roomId: 'hab-201',
        roomName: 'Apart Familiar 201',
        personId: 'pers-002',
        guestName: 'María Fernanda Gómez',
        guestPhone: '+57 300 987 6543',
        checkInDate: '2026-09-25T15:30',
        checkOutDate: '2026-09-30T11:00',
        totalPrice: 1200000,
        label: 'María Fernanda Gómez - +57 300 987 6543',
      },
      {
        id: 'res-103',
        roomId: 'hab-102',
        roomName: 'Habitación Ejecutiva 102',
        personId: 'pers-003',
        guestName: 'Andrés Felipe Restrepo',
        guestPhone: '+57 315 222 3344',
        checkInDate: '2026-09-26T12:00',
        checkOutDate: '2026-09-29T10:00',
        totalPrice: 360000,
        label: 'Andrés Felipe Restrepo - +57 315 222 3344',
      },
    ]
  }

  async getHuespedes(): Promise<HuespedInfo[]> {
    try {
      const response = await api.get<unknown>('/persons', {
        validateStatus: (s) => s >= 200 && s < 300,
      })

      const raw: RawPerson[] = Array.isArray(response.data)
        ? response.data
        : (response.data as { data?: RawPerson[] })?.data ?? []

      if (raw.length > 0) {
        return raw
          .filter((p) => Boolean(p.id))
          .map((p) => {
            const id = String(p.id)
            const name = p.name || `Huésped ${id.slice(0, 6)}`
            const doc = p.document_number ? ` · CC ${p.document_number}` : ''
            const tel = p.phone_number ? ` · ${p.phone_number}` : ''

            return {
              id,
              name,
              document_type: p.document_type,
              document_number: p.document_number,
              phone_number: p.phone_number,
              email: p.email,
              label: `${name}${doc}${tel}`,
            }
          })
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: 'pers-001',
        name: 'Carlos Mendoza',
        document_number: '1020456789',
        phone_number: '+57 310 456 7890',
        email: 'carlos.mendoza@correo.com',
        label: 'Carlos Mendoza · CC 1020456789 · +57 310 456 7890',
      },
      {
        id: 'pers-002',
        name: 'María Fernanda Gómez',
        document_number: '52890123',
        phone_number: '+57 300 987 6543',
        email: 'mf.gomez@empresa.com',
        label: 'María Fernanda Gómez · CC 52890123 · +57 300 987 6543',
      },
      {
        id: 'pers-003',
        name: 'Andrés Felipe Restrepo',
        document_number: '71345678',
        phone_number: '+57 315 222 3344',
        email: 'andres.restrepo@tech.co',
        label: 'Andrés Felipe Restrepo · CC 71345678 · +57 315 222 3344',
      },
    ]
  }

  async getPersonById(id: string): Promise<HuespedInfo | null> {
    if (!id) return null
    const cached = this.personCache.get(id)
    if (cached) return cached

    const fetchPromise = (async () => {
      try {
        const response = await api.get<unknown>(`/person/${id}`, {
          validateStatus: (s) => s === 200,
        })
        if (response.data && typeof response.data === 'object') {
          const p = response.data as RawPerson
          return {
            id,
            name: p.name || 'Huésped',
            document_type: p.document_type,
            document_number: p.document_number,
            phone_number: p.phone_number,
            email: p.email,
            label: `${p.name || 'Huésped'} - ${p.phone_number || ''}`,
          }
        }
      } catch {
        // Fallback a plural o lista
        try {
          const fb = await api.get<unknown>(`/persons/${id}`, {
            validateStatus: (s) => s === 200,
          })
          if (fb.data && typeof fb.data === 'object') {
            const p = fb.data as RawPerson
            return {
              id,
              name: p.name || 'Huésped',
              document_type: p.document_type,
              document_number: p.document_number,
              phone_number: p.phone_number,
              email: p.email,
              label: `${p.name || 'Huésped'} - ${p.phone_number || ''}`,
            }
          }
        } catch {
          // Ignorar
        }
      }

      const all = await this.getHuespedes()
      return all.find((h) => h.id === id) ?? null
    })()

    this.personCache.set(id, fetchPromise)
    return fetchPromise
  }

  // --- Mapeos y Enriquecimientos Privados ---

  private async enrichRawStays(rawList: RawStay[]): Promise<Recepcion[]> {
    const [sedes, edificios, habitaciones, camas, huespedes] = await Promise.all([
      this.getSedes(),
      this.getEdificios(),
      this.getHabitaciones(),
      this.getCamas(),
      this.getHuespedes(),
    ])

    const sedesMap = new Map(sedes.map((s) => [s.id, s]))
    const edificiosMap = new Map(edificios.map((e) => [e.id, e]))
    const habitacionesMap = new Map(habitaciones.map((h) => [h.id, h]))
    const huespedesMap = new Map(huespedes.map((g) => [g.id, g]))

    return rawList
      .filter((s) => Boolean(s.id))
      .map((stay) => {
        const id = String(stay.id)
        const roomId = String(stay.room_id || '')
        const guestId = String(stay.person_id || '')
        const reservaId = stay.reservation_id ? String(stay.reservation_id) : undefined

        const room = habitacionesMap.get(roomId)
        const building = room?.building_id ? edificiosMap.get(room.building_id) : undefined
        const sede = building?.headquarters_id ? sedesMap.get(building.headquarters_id) : undefined
        const bed = camas.find((c) => c.room_id === roomId)
        const guest = huespedesMap.get(guestId)

        const paymentMethod = stay.payment_method || 'efectivo'
        const paymentLabel = formatMetodoPago(paymentMethod)

        const status = (stay.status || 'progreso').toLowerCase()
        const estadoOpt = ESTADO_OPTIONS.find((e) => e.value === status)
        const estadoLabel = estadoOpt ? estadoOpt.label : status

        const inDate = stay.check_in_date || new Date().toISOString()
        const outDate =
          stay.check_out_date || new Date(Date.now() + 86400000 * 2).toISOString()

        return {
          id,
          roomId,
          roomLabel: room ? `${room.name} · Hab. ${room.number}` : `Habitación #${roomId.slice(0, 5)}`,
          reservaId,
          reservaLabel: reservaId ? `Reserva #${reservaId.slice(0, 6)}` : undefined,
          guestId,
          guestLabel: guest ? guest.label : `Huésped #${guestId.slice(0, 6)}`,
          checkIn: inDate,
          checkOut: outDate,
          metodoPago: paymentMethod,
          metodoPagoLabel: paymentLabel,
          depositoGarantia: Number(stay.security_deposit) || 0,
          estado: status,
          estadoLabel,
          observaciones: stay.remarks,
          createdBy: stay.created_by || 'recepcion@nexora.com',
          createdAt: stay.created_at || new Date().toISOString(),
          sede: sede ? { id: sede.id, name: sede.name, city: sede.city, address: sede.address, phone: sede.phone, status: sede.status } : undefined,
          edificio: building ? { id: building.id, name: building.name, floor: building.floor_number, status: building.status } : undefined,
          habitacion: room ? { id: room.id, number: room.number, name: room.name, floor: room.floor, capacity: room.capacity, price: room.price, status: room.status } : undefined,
          cama: bed ? { id: bed.id, etiquette: bed.etiquette, types_bed_id: bed.types_bed_id, status: bed.status } : undefined,
          huesped: guest ? { id: guest.id, name: guest.name, documentNumber: guest.document_number, phoneNumber: guest.phone_number, email: guest.email } : undefined,
          noches: calcularNoches(inDate, outDate),
        }
      })
  }

  private async buildEnrichedRecepcion(
    payload: RecepcionPayload,
    id: string,
  ): Promise<Recepcion> {
    const [habitacion, guest, beds, edificios, sedes] = await Promise.all([
      this.getHabitacionById(payload.room_id),
      this.getPersonById(payload.person_id),
      this.getCamas(payload.room_id),
      this.getEdificios(),
      this.getSedes(),
    ])

    const building = habitacion?.building_id
      ? edificios.find((e) => e.id === habitacion.building_id)
      : undefined
    const sede = building?.headquarters_id
      ? sedes.find((s) => s.id === building.headquarters_id)
      : undefined
    const bed = beds[0]

    const paymentLabel = formatMetodoPago(payload.payment_method)

    const estadoOpt = ESTADO_OPTIONS.find((e) => e.value === payload.status)
    const estadoLabel = estadoOpt ? estadoOpt.label : payload.status

    return {
      id,
      roomId: payload.room_id,
      roomLabel: habitacion ? `${habitacion.name} · Hab. ${habitacion.number}` : 'Habitación asignada',
      reservaId: payload.reservation_id || undefined,
      reservaLabel: payload.reservation_id ? `Reserva #${payload.reservation_id.slice(0, 6)}` : undefined,
      guestId: payload.person_id,
      guestLabel: guest ? guest.label : 'Huésped registrado',
      checkIn: payload.check_in_date,
      checkOut: payload.check_out_date,
      metodoPago: payload.payment_method,
      metodoPagoLabel: paymentLabel,
      depositoGarantia: payload.security_deposit,
      estado: payload.status,
      estadoLabel,
      observaciones: payload.remarks,
      createdBy: payload.created_by,
      createdAt: new Date().toISOString(),
      sede: sede ? { id: sede.id, name: sede.name, city: sede.city, address: sede.address, phone: sede.phone, status: sede.status } : undefined,
      edificio: building ? { id: building.id, name: building.name, floor: building.floor_number, status: building.status } : undefined,
      habitacion: habitacion ? { id: habitacion.id, number: habitacion.number, name: habitacion.name, floor: habitacion.floor, capacity: habitacion.capacity, price: habitacion.price, status: habitacion.status } : undefined,
      cama: bed ? { id: bed.id, etiquette: bed.etiquette, types_bed_id: bed.types_bed_id, status: bed.status } : undefined,
      huesped: guest ? { id: guest.id, name: guest.name, documentNumber: guest.document_number, phoneNumber: guest.phone_number, email: guest.email } : undefined,
      noches: calcularNoches(payload.check_in_date, payload.check_out_date),
    }
  }

  private syncLocalStorage(recepciones: Recepcion[]): void {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recepciones.slice(0, 50)))
    } catch {
      // Ignorar errores de quota en localStorage
    }
  }

  private saveLocally(nueva: Recepcion): void {
    try {
      const list = this.loadFromLocalStorage()
      list.unshift(nueva)
      this.syncLocalStorage(list)
    } catch {
      // Ignorar
    }
  }

  private loadFromLocalStorage(): Recepcion[] {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Recepcion[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // Ignorar
    }
    return []
  }

  private async getDemoRecepciones(): Promise<Recepcion[]> {
    const rawDemo: RawStay[] = [
      {
        id: 'stay-001',
        room_id: 'hab-101',
        reservation_id: 'res-101',
        person_id: 'pers-001',
        check_in_date: '2026-09-25T14:00:00Z',
        check_out_date: '2026-09-28T12:00:00Z',
        payment_method: 'tarjeta',
        security_deposit: 50000,
        remarks: 'Huésped VIP. Solicita almohadas hipoalergénicas.',
        status: 'progreso',
        created_by: 'recepcion@nexora.com',
      },
      {
        id: 'stay-002',
        room_id: 'hab-201',
        reservation_id: 'res-102',
        person_id: 'pers-002',
        check_in_date: '2026-09-25T15:30:00Z',
        check_out_date: '2026-09-30T11:00:00Z',
        payment_method: 'transferencia',
        security_deposit: 100000,
        remarks: 'Familia con dos niños pequeños. Cuna instalada.',
        status: 'progreso',
        created_by: 'recepcion@nexora.com',
      },
      {
        id: 'stay-003',
        room_id: 'hab-102',
        reservation_id: 'res-103',
        person_id: 'pers-003',
        check_in_date: '2026-09-26T10:00:00Z',
        check_out_date: '2026-09-29T10:00:00Z',
        payment_method: 'efectivo',
        security_deposit: 50000,
        remarks: 'Llegada temprana confirmada.',
        status: 'progreso',
        created_by: 'recepcion@nexora.com',
      },
      {
        id: 'stay-004',
        room_id: 'hab-204',
        person_id: 'pers-001',
        check_in_date: '2026-09-20T12:00:00Z',
        check_out_date: '2026-09-24T11:00:00Z',
        payment_method: 'tarjeta',
        security_deposit: 50000,
        remarks: 'Estadía anterior completada satisfactoriamente.',
        status: 'finalizada',
        created_by: 'recepcion@nexora.com',
      },
    ]

    return this.enrichRawStays(rawDemo)
  }
}
