import { useCatalogRole } from '../../../shared/catalog'
import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { RoleCatalogItem } from '../../../shared/catalog'

export interface UsePersonaRoleResult {
  role: RoleCatalogItem | null
  /** Nombre del rol obtenido de la API (solo este campo se proyecta en la insignia) */
  name: string
  /** Descripción del rol obtenida de la API */
  description?: string
  loading: boolean
  validation: StatusCodeValidationResult | null
  reload: () => Promise<void>
}

/**
 * Hook de capa de aplicación para el módulo de personas:
 * Consume el endpoint GET /roles/{id} validando los códigos HTTP mediante status-code-validator.ts.
 *
 * Cuando el status code es 200, la API entrega:
 * {
 *   "id": "role-1",
 *   "name": "recepcion",
 *   "description": "Personal de recepción"
 * }
 * y provee el item `name` para la visualización en la tabla.
 */
export function usePersonaRole(roleId?: string | null): UsePersonaRoleResult {
  const { data, loading, validation, reload } = useCatalogRole(roleId)

  return {
    role: data,
    name: data?.name || '',
    description: data?.description,
    loading,
    validation,
    reload,
  }
}
