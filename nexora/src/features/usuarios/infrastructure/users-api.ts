import { api } from '../../../lib/api'
import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../shared/lib/status-code-validator'
import type { UserItem } from '../domain/user-list'

/**
 * Datos mock de contingencia (Fallback) para resiliencia offline.
 * Respeta 100% la estructura devuelta por la API:
 * id, name, email, role_id, headquarters_id, sub_headquarters_id, status, created_by, created_at, updated_at.
 */
export const FALLBACK_USERS: UserItem[] = [
  {
    id: 'user-1',
    name: 'Admin',
    email: 'admin@nexora.com',
    role_id: 'role-1',
    headquarters_id: 'hq-1',
    sub_headquarters_id: null,
    status: 'active',
    created_by: 'system',
    created_at: '2026-10-01T15:04:05Z',
    updated_at: '2026-10-01T15:04:05Z',
  },
  {
    id: 'user-2',
    name: 'Valentina Restrepo',
    email: 'v.restrepo@nexora.com',
    role_id: 'role-2',
    headquarters_id: 'hq-1',
    sub_headquarters_id: 'shq-1',
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-02T09:30:00Z',
    updated_at: '2026-10-02T09:30:00Z',
  },
  {
    id: 'user-3',
    name: 'Santiago Morales',
    email: 's.morales@nexora.com',
    role_id: 'role-3',
    headquarters_id: 'hq-1',
    sub_headquarters_id: null,
    status: 'active',
    created_by: 'admin',
    created_at: '2026-10-03T11:45:00Z',
    updated_at: '2026-10-03T11:45:00Z',
  },
  {
    id: 'user-4',
    name: 'Camila Herrera',
    email: 'c.herrera@nexora.com',
    role_id: 'role-2',
    headquarters_id: 'hq-1',
    sub_headquarters_id: 'shq-1',
    status: 'inactive',
    created_by: 'admin',
    created_at: '2026-10-04T14:10:00Z',
    updated_at: '2026-10-04T14:10:00Z',
  },
  {
    id: 'user-5',
    name: 'Mateo González',
    email: 'm.gonzalez@nexora.com',
    role_id: 'role-1',
    headquarters_id: 'hq-1',
    sub_headquarters_id: null,
    status: 'active',
    created_by: 'system',
    created_at: '2026-10-04T16:20:00Z',
    updated_at: '2026-10-04T16:20:00Z',
  },
]

export interface FetchUsersResponse {
  users: UserItem[]
  validation: StatusCodeValidationResult
  fromFallback: boolean
}

/**
 * Cliente de infraestructura para consultar el listado de usuarios (GET /users).
 * Valida de forma estricta los códigos de estado HTTP mediante validateStatusCode.
 */
export async function fetchUsersFromApi(): Promise<FetchUsersResponse> {
  try {
    const response = await api.get('/users', {
      validateStatus: () => true,
    })

    const validation = validateStatusCode(response.status)

    if (validation.isValid && response.data) {
      const raw = response.data
      let list: UserItem[] = []

      if (Array.isArray(raw)) {
        list = raw
      } else if (raw && typeof raw === 'object') {
        const candidate = (raw as Record<string, unknown>).data || (raw as Record<string, unknown>).users || (raw as Record<string, unknown>).items
        if (Array.isArray(candidate)) {
          list = candidate as UserItem[]
        }
      }

      if (list.length > 0) {
        return {
          users: list,
          validation,
          fromFallback: false,
        }
      }
    }

    // Si la API responde con 200 pero lista vacía en backend de pruebas, retornamos fallbacks para no dejar la UI rota
    return {
      users: FALLBACK_USERS,
      validation,
      fromFallback: true,
    }
  } catch (error) {
    // Falla de red o servidor caído: retornamos fallback con validación de error 500
    return {
      users: FALLBACK_USERS,
      validation: validateStatusCode(500),
      fromFallback: true,
    }
  }
}
