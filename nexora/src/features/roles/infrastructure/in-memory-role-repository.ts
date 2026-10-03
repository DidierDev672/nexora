import type { Role } from '../domain/role'
import type { RoleRepository } from '../domain/role-repository'

export class InMemoryRoleRepository implements RoleRepository {
  private readonly store = new Map<string, Role>()

  constructor(initial: Role[] = []) {
    for (const role of initial) {
      this.store.set(role.id, role)
    }
  }

  list(): Role[] {
    return [...this.store.values()]
  }

  save(role: Role): void {
    this.store.set(role.id, role)
  }

  remove(id: string): void {
    this.store.delete(id)
  }
}