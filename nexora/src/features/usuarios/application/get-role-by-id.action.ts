import {
  validateStatusCode,
  type StatusCodeValidationResult,
} from '../../../shared/lib/status-code-validator'
import {
  catalogApi,
  type RoleCatalogItem,
} from '../../../shared/catalog'

export interface GetRoleByIdActionResult {
  data: RoleCatalogItem | null
  validation: StatusCodeValidationResult
}

/**
 * Action de aplicación para consultar la información del rol del usuario (GET /roles/{id}).
 * 
 * Cumplimiento arquitectónico:
 * - Valida status codes mediante `validateStatusCode`.
 * - Regla de oro: No expone IDs técnicos en la interfaz de usuario.
 * - Consume el endpoint con resiliencia, deduplicación y caché compartida.
 */
export async function getRoleByIdAction(roleId: string): Promise<GetRoleByIdActionResult> {
  const cleanId = (roleId || '').trim()
  if (!cleanId) {
    return {
      data: null,
      validation: validateStatusCode(400),
    }
  }

  const result = await catalogApi.getRole(cleanId)

  return {
    data: result.data,
    validation: result.validation,
  }
}
