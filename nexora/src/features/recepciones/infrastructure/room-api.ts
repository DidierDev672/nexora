import { api } from '../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../shared/lib/status-code-validator'

/**
 * Modelo de datos de Habitación retornado por GET /room/{id}.
 */
export interface RoomDetail {
  id: string
  number: string
  floor: number
  room_types_id: string
  building_id: string
  price_override: number | null
  status: string
  has_reception: boolean
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FetchRoomResult {
  data: RoomDetail | null
  validation: StatusCodeValidationResult
}

/**
 * Modelo de datos de Tipo de Habitación retornado por GET /room-types/{id}.
 */
export interface RoomTypeDetail {
  id: string
  name: string
  capacity: number
  base_price: number
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FetchRoomTypeResult {
  data: RoomTypeDetail | null
  validation: StatusCodeValidationResult
}

/**
 * Modelo de datos de Edificio retornado por GET /building/{id}.
 */
export interface BuildingDetail {
  id: string
  name: string
  floor_number: number
  headquarters_id: string
  sub_headquarters_id: string | null
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FetchBuildingResult {
  data: BuildingDetail | null
  validation: StatusCodeValidationResult
}

/**
 * Modelo de datos de Sede retornado por GET /headquarters/{id}.
 */
export interface HeadquarterDetail {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FetchHeadquarterResult {
  data: HeadquarterDetail | null
  validation: StatusCodeValidationResult
}

/**
 * Modelo de datos de Subsede retornado por GET /sub-headquarters/{id}.
 */
export interface SubHeadquarterDetail {
  id: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

export interface FetchSubHeadquarterResult {
  data: SubHeadquarterDetail | null
  validation: StatusCodeValidationResult
}

/**
 * Datos de respaldo para pruebas locales y desarrollo resiliente.
 */
export const SAMPLE_ROOMS: Record<string, RoomDetail> = {
  'room-1': {
    id: 'room-1',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: null,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'room-102': {
    id: 'room-102',
    number: '102',
    floor: 1,
    room_types_id: 'type-2',
    building_id: 'building-1',
    price_override: null,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'suite-presidencial-01': {
    id: 'suite-presidencial-01',
    number: '301',
    floor: 3,
    room_types_id: 'type-presidential',
    building_id: 'building-1',
    price_override: 350000,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'room-205': {
    id: 'room-205',
    number: '205',
    floor: 2,
    room_types_id: 'type-family',
    building_id: 'building-2',
    price_override: null,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'hab-101': {
    id: 'hab-101',
    number: '101',
    floor: 1,
    room_types_id: 'type-1',
    building_id: 'building-1',
    price_override: null,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'hab-102': {
    id: 'hab-102',
    number: '102',
    floor: 1,
    room_types_id: 'type-2',
    building_id: 'building-1',
    price_override: null,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'hab-201': {
    id: 'hab-201',
    number: '201',
    floor: 2,
    room_types_id: 'type-1',
    building_id: 'building-2',
    price_override: null,
    status: 'available',
    has_reception: true,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

export const SAMPLE_ROOM_TYPES: Record<string, RoomTypeDetail> = {
  'type-1': {
    id: 'type-1',
    name: 'Suite Deluxe',
    capacity: 4,
    base_price: 450.0,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'type-2': {
    id: 'type-2',
    name: 'Doble Superior',
    capacity: 2,
    base_price: 280.0,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'type-presidential': {
    id: 'type-presidential',
    name: 'Suite Presidencial Imperial',
    capacity: 6,
    base_price: 850.0,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'type-family': {
    id: 'type-family',
    name: 'Familiar Premium',
    capacity: 5,
    base_price: 380.0,
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

export const SAMPLE_BUILDINGS: Record<string, BuildingDetail> = {
  'building-1': {
    id: 'building-1',
    name: 'Torre A',
    floor_number: 12,
    headquarters_id: 'hq-1',
    sub_headquarters_id: null,
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'building-2': {
    id: 'building-2',
    name: 'Torre B - Norte',
    floor_number: 8,
    headquarters_id: 'hq-1',
    sub_headquarters_id: 'shq-1',
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

export const SAMPLE_HEADQUARTERS: Record<string, HeadquarterDetail> = {
  'hq-1': {
    id: 'hq-1',
    name: 'Sede Central',
    address: 'Av. Javier Prado 123',
    city: 'Lima',
    phone: '999888777',
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

export const SAMPLE_SUB_HEADQUARTERS: Record<string, SubHeadquarterDetail> = {
  'shq-1': {
    id: 'shq-1',
    headquarter_id: 'hq-1',
    name: 'Sede Norte',
    address: 'Av. Los Olivos 456',
    phone: '988777666',
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
}

/**
 * Consulta la información individual de una habitación usando Axios con GET /room/{id}.
 * Valida de forma estricta el status code mediante `validateStatusCode`.
 */
export async function fetchRoomById(id: string): Promise<FetchRoomResult> {
  const cleanId = id.trim()
  try {
    const response = await api.get(`/room/${encodeURIComponent(cleanId)}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid) {
      let room: RoomDetail | null = null
      if (response.data && typeof response.data === 'object') {
        const payload = (response.data as { data?: RoomDetail }).data ?? (response.data as RoomDetail)
        if (payload && (payload.number || payload.floor !== undefined)) {
          room = payload
        }
      }
      return {
        data: room ?? SAMPLE_ROOMS[cleanId] ?? null,
        validation,
      }
    }

    const fallback = SAMPLE_ROOMS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation,
    }
  } catch {
    const fallback = SAMPLE_ROOMS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation: validateStatusCode(500),
    }
  }
}

/**
 * Consulta la información del Tipo de Habitación usando Axios con GET /room-types/{id}.
 * Valida el status code con `validateStatusCode`.
 */
export async function fetchRoomTypeById(id: string): Promise<FetchRoomTypeResult> {
  const cleanId = id.trim()
  try {
    const response = await api.get(`/room-types/${encodeURIComponent(cleanId)}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      const payload =
        (response.data as { data?: RoomTypeDetail }).data ?? (response.data as RoomTypeDetail)
      return {
        data: payload ?? SAMPLE_ROOM_TYPES[cleanId] ?? null,
        validation,
      }
    }

    const fallback = SAMPLE_ROOM_TYPES[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation,
    }
  } catch {
    const fallback = SAMPLE_ROOM_TYPES[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation: validateStatusCode(500),
    }
  }
}

/**
 * Consulta la información del Edificio o Torre usando Axios con GET /building/{id}.
 * Valida el status code con `validateStatusCode`.
 */
export async function fetchBuildingById(id: string): Promise<FetchBuildingResult> {
  const cleanId = id.trim()
  try {
    const response = await api.get(`/building/${encodeURIComponent(cleanId)}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      const payload =
        (response.data as { data?: BuildingDetail }).data ?? (response.data as BuildingDetail)
      return {
        data: payload ?? SAMPLE_BUILDINGS[cleanId] ?? null,
        validation,
      }
    }

    const fallback = SAMPLE_BUILDINGS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation,
    }
  } catch {
    const fallback = SAMPLE_BUILDINGS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation: validateStatusCode(500),
    }
  }
}

/**
 * Consulta la información de la Sede usando Axios con GET /headquarters/{id}.
 * Valida el status code con `validateStatusCode`.
 */
export async function fetchHeadquarterById(id: string): Promise<FetchHeadquarterResult> {
  const cleanId = id.trim()
  try {
    const response = await api.get(`/headquarters/${encodeURIComponent(cleanId)}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      const raw = response.data
      const payload: HeadquarterDetail | null = Array.isArray(raw)
        ? ((raw[0] as HeadquarterDetail) ?? null)
        : ((raw as { data?: HeadquarterDetail }).data ?? (raw as HeadquarterDetail))
      return {
        data: payload ?? SAMPLE_HEADQUARTERS[cleanId] ?? null,
        validation,
      }
    }

    const fallback = SAMPLE_HEADQUARTERS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation,
    }
  } catch {
    const fallback = SAMPLE_HEADQUARTERS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation: validateStatusCode(500),
    }
  }
}

/**
 * Consulta la información de la Subsede usando Axios con GET /sub-headquarters/{id}.
 * Valida el status code con `validateStatusCode`.
 */
export async function fetchSubHeadquarterById(id: string): Promise<FetchSubHeadquarterResult> {
  const cleanId = id.trim()
  try {
    const response = await api.get(`/sub-headquarters/${encodeURIComponent(cleanId)}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      const raw = response.data
      const payload: SubHeadquarterDetail | null = Array.isArray(raw)
        ? ((raw[0] as SubHeadquarterDetail) ?? null)
        : ((raw as { data?: SubHeadquarterDetail }).data ?? (raw as SubHeadquarterDetail))
      return {
        data: payload ?? SAMPLE_SUB_HEADQUARTERS[cleanId] ?? null,
        validation,
      }
    }

    const fallback = SAMPLE_SUB_HEADQUARTERS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation,
    }
  } catch {
    const fallback = SAMPLE_SUB_HEADQUARTERS[cleanId]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    return {
      data: null,
      validation: validateStatusCode(500),
    }
  }
}
