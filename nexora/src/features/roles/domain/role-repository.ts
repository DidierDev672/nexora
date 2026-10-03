import type { Role } from './role'

export interface RoleRepository {
  list(): Role[]
  save(role: Role): void
  remove(id: string): void
}