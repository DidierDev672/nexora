import type { RoleRepository } from '../domain/role-repository'

export const DeleteRole =
  (repository: RoleRepository): ((id: string) => void) =>
  (id: string) => {
    repository.remove(id)
  }