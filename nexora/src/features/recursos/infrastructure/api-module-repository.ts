import { api } from '../../../lib/api'

export interface ModuleRouteType {
  type_path: string
  type_component: string
}

export interface ApiUser {
  id: string
  name: string
  email: string
  role_id: string
  headquarters_id: string | null
  sub_headquarters_id: string | null
  status: 'active' | 'inactive'
  created_by: string
  created_at: string
  updated_at: string
}

export interface ApiHeadquarter {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: 'active' | 'inactive'
  created_by: string
  created_at: string
  updated_at: string
}

export interface ApiSubHeadquarter {
  id: string
  headquarter_id: string
  name: string
  address: string
  phone: string
  status: 'active' | 'inactive'
  created_by: string
  created_at: string
  updated_at: string
}

export interface ApiPermissionAssignment {
  id_user: string
  id_headquarters: string
  id_sub_headquarters: string | null
  id_resource: string | null
  id_permission_resource: string | null
}

export interface ApiResource {
  id: string
  component: string
  name: string
  module_id: number
}

export interface ApiPermissionResource {
  id: number
  resource_id: number
  permission: boolean
}

export interface PermissionAssignmentPayload {
  id_user: string
  id_headquarters: string
  id_sub_headquarters: string | null
  id_resource: string
  id_permission_resource: string
}

type ApiCollection<T> = T | T[]

function toArray<T>(data: ApiCollection<T>): T[] {
  return Array.isArray(data) ? data : [data]
}

export class ApiModuleRepository {
  async listRouteTypes(): Promise<ModuleRouteType[]> {
    const response = await api.get<ApiCollection<ModuleRouteType>>('/module')
    if (response.status !== 200) {
      throw new Error('Tipos de ruta no disponibles')
    }
    return toArray(response.data)
  }

  async listUsers(): Promise<ApiUser[]> {
    const response = await api.get<ApiCollection<ApiUser>>('/users')
    if (response.status !== 200) {
      throw new Error('Usuarios no disponibles')
    }
    return toArray(response.data)
  }

  async listHeadquarters(): Promise<ApiHeadquarter[]> {
    const response = await api.get<ApiCollection<ApiHeadquarter>>('/headquarters')
    if (response.status !== 200) {
      throw new Error('Sedes no disponibles')
    }
    return toArray(response.data)
  }

  async listSubHeadquarters(headquarterId: string): Promise<ApiSubHeadquarter[]> {
    const response = await api.get<ApiCollection<ApiSubHeadquarter>>(
      `/sub-headquarters/by-headquarter/${headquarterId}`,
    )
    if (response.status !== 200) {
      throw new Error('Sub sedes no disponibles')
    }
    return toArray(response.data)
  }

  async listPermissionAssignments(): Promise<ApiPermissionAssignment[]> {
    const response = await api.get<ApiCollection<ApiPermissionAssignment>>(
      '/permission-assignment',
    )
    if (response.status !== 200) {
      throw new Error('Permisos no disponibles')
    }
    return toArray(response.data)
  }

  async listResources(): Promise<ApiResource[]> {
    const response = await api.get<ApiCollection<ApiResource>>('/resource')
    if (response.status !== 200) {
      throw new Error('Recursos no disponibles')
    }
    return toArray(response.data)
  }

  async listPermissionResources(): Promise<ApiPermissionResource[]> {
    const response = await api.get<ApiCollection<ApiPermissionResource>>('/permission-resource')
    if (response.status !== 200) {
      throw new Error('Permisos de recursos no disponibles')
    }
    return toArray(response.data)
  }

  async createPermissionAssignment(payload: PermissionAssignmentPayload): Promise<number> {
    const response = await api.post('/permission-assignment', payload)
    return response.status
  }
}