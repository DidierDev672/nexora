import { newRole, type Role, type RoleInput } from '../domain/role'
import type { RoleRepository } from '../domain/role-repository'

export const CreateRole =
  (repository: RoleRepository): ((input: RoleInput) => Role) =>
  (input: RoleInput): Role => {
    const role = newRole(input)
    repository.save(role)
    return role
  }