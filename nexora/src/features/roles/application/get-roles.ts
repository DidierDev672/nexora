import type { Role } from '../domain/role'
import type { RoleRepository } from '../domain/role-repository'

export const GetRoles =
  (repository: RoleRepository): (() => Role[]) =>
  () =>
    repository.list()