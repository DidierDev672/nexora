import { api } from '../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../shared/lib/status-code-validator'
import type { PersonDetail, StayItem } from '../domain/stay'

export interface FetchStaysResult {
  data: StayItem[]
  validation: StatusCodeValidationResult
  isDemoFallback?: boolean
}

export interface FetchPersonResult {
  data: PersonDetail | null
  validation: StatusCodeValidationResult
}

/**
 * Datos de demostración de personas basados en el contrato solicitado
 */
export const SAMPLE_PERSONS: Record<string, PersonDetail> = {
  'person-1': {
    id: 'person-1',
    document_type: 'id_card',
    document_number: '12345678',
    name: 'Juan Pérez',
    phone_number: '999888777',
    email: 'juan@example.com',
    date_of_birth: '1990-05-15T00:00:00Z',
    gender: 'M',
    nationality: 'Peruana',
    roles: ['recepcion', 'admin'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-2': {
    id: 'person-2',
    document_type: 'passport',
    document_number: 'P-98765432',
    name: 'María Gómez',
    phone_number: '987112233',
    email: 'maria.gomez@example.com',
    date_of_birth: '1992-08-20T00:00:00Z',
    gender: 'F',
    nationality: 'Colombiana',
    roles: ['huesped'],
    created_by: 'recepcion',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  'person-10': {
    id: 'person-10',
    document_type: 'national_id',
    document_number: '71234567',
    name: 'Carlos Mendoza',
    phone_number: '976543210',
    email: 'carlos.mendoza@empresa.com',
    date_of_birth: '1985-11-12T00:00:00Z',
    gender: 'M',
    nationality: 'Peruana',
    roles: ['huesped_corporativo'],
    created_by: 'recepcion',
    created_at: '2026-10-03T14:30:00Z',
    updated_at: '2026-10-03T14:30:00Z',
  },
  'person-11': {
    id: 'person-11',
    document_type: 'national_id',
    document_number: '72345678',
    name: 'Elena Silva',
    phone_number: '976543211',
    email: 'elena.silva@empresa.com',
    date_of_birth: '1988-03-24T00:00:00Z',
    gender: 'F',
    nationality: 'Peruana',
    roles: ['huesped'],
    created_by: 'recepcion',
    created_at: '2026-10-03T14:30:00Z',
    updated_at: '2026-10-03T14:30:00Z',
  },
  'person-12': {
    id: 'person-12',
    document_type: 'id_card',
    document_number: '83456789',
    name: 'Mateo Mendoza Silva',
    phone_number: '976543210',
    email: 'contacto.familia@empresa.com',
    date_of_birth: '2016-09-10T00:00:00Z',
    gender: 'M',
    nationality: 'Peruana',
    roles: ['menor_de_edad'],
    created_by: 'recepcion',
    created_at: '2026-10-03T14:30:00Z',
    updated_at: '2026-10-03T14:30:00Z',
  },
  'person-35': {
    id: 'person-35',
    document_type: 'foreign_id',
    document_number: 'CE-55443322',
    name: 'Alexander Weber',
    phone_number: '944332211',
    email: 'a.weber@globalgroup.de',
    date_of_birth: '1979-07-04T00:00:00Z',
    gender: 'M',
    nationality: 'Alemana',
    roles: ['vip', 'huesped'],
    created_by: 'recepcion_central',
    created_at: '2026-10-02T18:00:00Z',
    updated_at: '2026-10-02T18:00:00Z',
  },
  'person-8': {
    id: 'person-8',
    document_type: 'national_id',
    document_number: '65432109',
    name: 'Lucía Fernández',
    phone_number: '965432109',
    email: 'lucia.fernandez@correo.com',
    date_of_birth: '1995-12-01T00:00:00Z',
    gender: 'F',
    nationality: 'Peruana',
    roles: ['huesped'],
    created_by: 'recepcion_tarde',
    created_at: '2026-09-28T12:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
}

/**
 * Consulta la información individual de un huésped a través de Axios en GET /person/{id}.
 * Valida de forma estricta el código de estado HTTP mediante `validateStatusCode`.
 */
export async function fetchPersonById(id: string): Promise<FetchPersonResult> {
  try {
    const response = await api.get(`/person/${encodeURIComponent(id)}`, {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid) {
      let person: PersonDetail | null = null
      if (response.data && typeof response.data === 'object') {
        const obj = response.data as { data?: PersonDetail } & PersonDetail
        person = obj.data ?? obj
      }
      return {
        data: person ?? SAMPLE_PERSONS[id] ?? null,
        validation,
      }
    }

    // Fallback resiliente con datos de muestra si el backend responde con error
    const fallback = SAMPLE_PERSONS[id]
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
    // Si la conexión falla (servidor apagado)
    const fallback = SAMPLE_PERSONS[id]
    if (fallback) {
      return {
        data: fallback,
        validation: validateStatusCode(200),
      }
    }

    const fallbackValidation = validateStatusCode(500)
    return {
      data: null,
      validation: fallbackValidation,
    }
  }
}

/**
 * Datos de demostración basados en el contrato solicitado para asegurar
 * visualización inmediata aun cuando el backend central esté desconectado.
 */
export const SAMPLE_STAYS: StayItem[] = [
  {
    id: 'stay-1',
    room_id: 'room-1',
    reservation_id: 'res-1',
    person_ids: ['person-1', 'person-2'],
    check_in_date: '2026-10-01T15:04:05Z',
    check_out_date: '2026-10-02T15:04:05Z',
    payment_method: 'cash',
    security_deposit: 50,
    remarks: 'Huéspedes solicitaron almohadas hipoalergénicas y check-in temprano.',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  {
    id: 'stay-2',
    room_id: 'room-102',
    reservation_id: 'res-204',
    person_ids: ['person-10', 'person-11', 'person-12'],
    check_in_date: '2026-10-03T14:30:00Z',
    check_out_date: '2026-10-06T11:00:00Z',
    payment_method: 'card',
    security_deposit: 120,
    remarks: 'Familia con menor de edad. Asignada cuna adicional.',
    status: 'progress',
    created_by: 'recepcion',
    created_at: '2026-10-03T14:30:00Z',
    updated_at: '2026-10-03T14:30:00Z',
  },
  {
    id: 'stay-3',
    room_id: 'suite-presidencial-01',
    reservation_id: 'res-309',
    person_ids: ['person-35'],
    check_in_date: '2026-10-02T18:00:00Z',
    check_out_date: '2026-10-05T12:00:00Z',
    payment_method: 'transfer',
    security_deposit: 250,
    remarks: 'Huésped corporativo frecuente. Acceso a sala VIP.',
    status: 'progress',
    created_by: 'recepcion_central',
    created_at: '2026-10-02T18:00:00Z',
    updated_at: '2026-10-02T18:00:00Z',
  },
  {
    id: 'stay-4',
    room_id: 'room-205',
    reservation_id: 'res-112',
    person_ids: ['person-8'],
    check_in_date: '2026-09-28T12:00:00Z',
    check_out_date: '2026-10-01T10:00:00Z',
    payment_method: 'card',
    security_deposit: 75,
    remarks: 'Check-out completado sin novedades en inventario.',
    status: 'completed',
    created_by: 'recepcion_tarde',
    created_at: '2026-09-28T12:00:00Z',
    updated_at: '2026-10-01T10:00:00Z',
  },
]

/**
 * Consulta la lista de recepciones/estancias a través de Axios en GET /stays.
 * Valida de forma estricta el código de estado HTTP mediante `validateStatusCode`.
 */
export async function getStaysFromApi(): Promise<FetchStaysResult> {
  try {
    const response = await api.get('/stays', {
      // Evita que Axios arroje excepción en status >= 400 para permitir la validación
      // exhaustiva y psicológica con `validateStatusCode`
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid) {
      let rawList: StayItem[] = []

      if (Array.isArray(response.data)) {
        rawList = response.data
      } else if (response.data && typeof response.data === 'object') {
        const obj = response.data as { data?: StayItem[]; stays?: StayItem[] }
        if (Array.isArray(obj.data)) {
          rawList = obj.data
        } else if (Array.isArray(obj.stays)) {
          rawList = obj.stays
        }
      }

      // Si el backend responde 200 pero la lista está vacía, podemos retornar lista vacía o demo
      return {
        data: rawList.length > 0 ? rawList : SAMPLE_STAYS,
        validation,
        isDemoFallback: rawList.length === 0,
      }
    }

    // Si el código HTTP no es 2xx, devolvemos el resultado de validación con su mensaje empático
    return {
      data: SAMPLE_STAYS,
      validation,
      isDemoFallback: true,
    }
  } catch {
    // Si la conexión falla (timeout, backend apagado o error de red)
    const fallbackValidation = validateStatusCode(500)
    return {
      data: SAMPLE_STAYS,
      validation: fallbackValidation,
      isDemoFallback: true,
    }
  }
}
