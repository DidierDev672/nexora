import { api } from '../../../lib/api'
import type { Sede, SedeEstado } from '../domain/sede'
import type { SedeRepository } from '../domain/sede-repository'

const STATUS_TO_ESTADO: Record<string, SedeEstado> = {
  active: 'activa',
  maintenance: 'mantenimiento',
  inactive: 'inactiva',
}

interface ApiSede {
  id: string
  name: string
  address: string
  city: string
  phone: string
  status: string
  created_by?: string
  created_at?: string
  updated_at?: string
}

function fromApiSede(item: ApiSede): Sede {
  return {
    id: item.id,
    name: item.name,
    address: item.address,
    city: item.city,
    phone: item.phone,
    estado: STATUS_TO_ESTADO[item.status] ?? 'inactiva',
  }
}

export class ApiSedeRepository implements SedeRepository {
  private cache: Sede[] = []

  async list(): Promise<Sede[]> {
    const response = await api.get<ApiSede[]>('/headquarters')
    if (response.status !== 200 || !Array.isArray(response.data)) {
      throw new Error('Lista de sedes no disponible')
    }
    this.cache = response.data.map(fromApiSede)
    return this.cache
  }

  save(sede: Sede): void {
    const index = this.cache.findIndex((item) => item.id === sede.id)
    if (index >= 0) {
      this.cache[index] = sede
    } else {
      this.cache.push(sede)
    }
  }

  remove(id: string): void {
    this.cache = this.cache.filter((sede) => sede.id !== id)
  }

  removeStatic(id: string): void {
    this.cache = this.cache.filter((sede) => sede.id !== id)
  }
}