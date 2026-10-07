import { api } from '../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../shared/lib/status-code-validator'
import type { PersonListItem, PersonaRepository } from '../domain/persona-list'

/**
 * Datos de demostración de respaldo (fallback) que cumplen exactamente con
 * el esquema de respuesta del endpoint GET /persons.
 */
export const MOCK_PERSONS_FALLBACK: PersonListItem[] = [
  {
    id: 'person-1',
    document_type: 'id_card',
    document_number: '12345678',
    name: 'Juan Pérez',
    phone_number: '999888777',
    email: 'juan@example.com',
    date_of_birth: '1990-05-15T00:00:00Z',
    gender: 'M',
    nationality: 'Peruana',
    roles: ['role-1', 'admin'],
    created_by: 'admin',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  {
    id: 'person-2',
    document_type: 'national_id',
    document_number: '87654321',
    name: 'Lucía Morales Gómez',
    phone_number: '987654321',
    email: 'lucia.morales@nexora.com',
    date_of_birth: '1994-08-15T00:00:00Z',
    gender: 'F',
    nationality: 'Colombiana',
    roles: ['admin', 'operaciones'],
    created_by: 'admin',
    created_at: '2026-10-02T11:20:00Z',
    updated_at: '2026-10-02T11:20:00Z',
  },
  {
    id: 'person-3',
    document_type: 'passport',
    document_number: 'P09823412',
    name: 'Carlos Mendoza Silva',
    phone_number: '912345678',
    email: 'carlos.mendoza@nexora.com',
    date_of_birth: '1987-11-23T00:00:00Z',
    gender: 'M',
    nationality: 'Chilena',
    roles: ['role-1'],
    created_by: 'admin',
    created_at: '2026-10-03T09:15:30Z',
    updated_at: '2026-10-03T09:15:30Z',
  },
  {
    id: 'person-4',
    document_type: 'foreign_id',
    document_number: 'E-55443322',
    name: 'Elena Rostova',
    phone_number: '933221100',
    email: 'elena.rostova@nexora.com',
    date_of_birth: '1996-03-30T00:00:00Z',
    gender: 'F',
    nationality: 'Española',
    roles: ['atencion_cliente', 'huesped'],
    created_by: 'admin',
    created_at: '2026-10-04T16:45:00Z',
    updated_at: '2026-10-04T16:45:00Z',
  },
  {
    id: 'person-5',
    document_type: 'national_id',
    document_number: '44556677',
    name: 'Mateo Restrepo Arango',
    phone_number: '955443322',
    email: 'mateo.restrepo@nexora.com',
    date_of_birth: '1992-07-08T00:00:00Z',
    gender: 'M',
    nationality: 'Colombiana',
    roles: ['mantenimiento'],
    created_by: 'admin',
    created_at: '2026-10-05T08:30:10Z',
    updated_at: '2026-10-05T08:30:10Z',
  },
  {
    id: 'person-6',
    document_type: 'id_card',
    document_number: '99887766',
    name: 'Valeria Quintana',
    phone_number: '977889900',
    email: 'valeria.quintana@nexora.com',
    date_of_birth: '1998-12-19T00:00:00Z',
    gender: 'F',
    nationality: 'Mexicana',
    roles: ['recepcion'],
    created_by: 'admin',
    created_at: '2026-10-05T14:10:00Z',
    updated_at: '2026-10-05T14:10:00Z',
  },
]

export class ApiPersonaRepository implements PersonaRepository {
  async getPersons(): Promise<{
    data: PersonListItem[]
    validation: StatusCodeValidationResult
    fromFallback: boolean
  }> {
    try {
      const response = await api.get<unknown>('/persons', {
        validateStatus: () => true, // Permite evaluar todos los códigos HTTP sin lanzar excepción
      })

      const status = response.status
      const validation = validateStatusCode(status)

      // Código HTTP 200: Éxito estricto (message es null)
      if (status === 200) {
        let items: PersonListItem[] = []

        if (Array.isArray(response.data)) {
          items = response.data as PersonListItem[]
        } else if (
          response.data &&
          typeof response.data === 'object' &&
          'persons' in response.data &&
          Array.isArray((response.data as { persons: unknown[] }).persons)
        ) {
          items = (response.data as { persons: PersonListItem[] }).persons
        } else if (
          response.data &&
          typeof response.data === 'object' &&
          'data' in response.data &&
          Array.isArray((response.data as { data: unknown[] }).data)
        ) {
          items = (response.data as { data: PersonListItem[] }).data
        }

        return {
          data: items.length > 0 ? items : MOCK_PERSONS_FALLBACK,
          validation,
          fromFallback: items.length === 0,
        }
      }

      // Códigos distintos a 200 (4xx, 5xx, etc.)
      return {
        data: MOCK_PERSONS_FALLBACK,
        validation,
        fromFallback: true,
      }
    } catch {
      // Error de red / sin conexión con el servidor
      const validation = validateStatusCode(500)
      return {
        data: MOCK_PERSONS_FALLBACK,
        validation,
        fromFallback: true,
      }
    }
  }
}
