import { newRole, type Role } from '../domain/role'
import type { RoleRepository } from '../domain/role-repository'

const STORAGE_KEY = 'nexora.roles.v1'

function initialRoles(): Role[] {
  return [
    newRole({
      name: 'Administrador',
      description:
        'Acceso total a la configuración, usuarios y a todos los módulos de la gestión.',
    }),
    newRole({
      name: 'Editor de contenido',
      description:
        'Crea y edita contenidos, pero no gestiona usuarios ni la configuración general.',
    }),
    newRole({
      name: 'Soporte',
      description: 'Consultas en modo lectura y resolución de incidencias básicas.',
    }),
  ]
}

export class LocalStorageRoleRepository implements RoleRepository {
  constructor() {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === null) {
        this.saveAll(initialRoles())
      }
    } catch {
      // almacenamiento no disponible: el repositorio se comporta como vacío
    }
  }

  list(): Role[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? (JSON.parse(raw) as Role[]) : []
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  save(role: Role): void {
    const roles = this.list()
    const index = roles.findIndex((item) => item.id === role.id)
    if (index >= 0) {
      roles[index] = role
    } else {
      roles.push(role)
    }
    this.saveAll(roles)
  }

  remove(id: string): void {
    this.saveAll(this.list().filter((role) => role.id !== id))
  }

  private saveAll(roles: Role[]): void {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roles))
    } catch {
      // almacenamiento no disponible
    }
  }
}