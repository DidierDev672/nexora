import { updateRoleFields, type Role, type RoleInput } from '../domain/role'
import type { RoleRepository } from '../domain/role-repository'

export const UpdateRole =
  (repository: RoleRepository): ((id: string, input: RoleInput) => Role | null) =>
  (id: string, input: RoleInput): Role | null => {
    const current = repository.list().find((role) => role.id === id)
    if (!current) return null
    const updated = updateRoleFields(current, input)
    repository.save(updated)
    return updated
  }