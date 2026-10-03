import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { readTokenEmail } from '../../../shared/auth-storage'
import type { TipoCama, TipoCamaDraft } from '../domain/tipo-cama'
import { TipoCamaApiError } from '../domain/tipo-cama-error'
import type { TipoCamaRepository } from '../domain/tipo-cama-repository'

function readCapacidad(value: string): number {
  return Math.trunc(Number(value.trim()))
}

export class ApiTipoCamaRepository implements TipoCamaRepository {
  async list(): Promise<TipoCama[]> {
    try {
      const response = await api.get<unknown>('/types-bed')
      if (response.status !== 200) {
        throw new TipoCamaApiError(response.status)
      }
      return mapTiposCama(response.data)
    } catch (error) {
      if (error instanceof TipoCamaApiError) {
        throw error
      }
      if (isAxiosError(error)) {
        throw new TipoCamaApiError(error.response?.status ?? 0)
      }
      throw new TipoCamaApiError(0)
    }
  }

  async create(draft: TipoCamaDraft): Promise<void> {
    try {
      const response = await api.post('/types-bed', {
        name: draft.nombre.trim(),
        capacity_people: readCapacidad(draft.capacidad),
        description: draft.descripcion.trim(),
        created_by: readTokenEmail(),
      })

      if (response.status !== 201) {
        throw new TipoCamaApiError(response.status)
      }
    } catch (error) {
      if (error instanceof TipoCamaApiError) {
        throw error
      }
      if (isAxiosError(error)) {
        throw new TipoCamaApiError(error.response?.status ?? 0)
      }
      throw new TipoCamaApiError(0)
    }
  }
}

function mapTiposCama(data: unknown): TipoCama[] {
  if (!Array.isArray(data)) {
    throw new TipoCamaApiError(500)
  }
  return data
    .map((raw) => raw as Partial<TipoCama>)
    .filter(
      (item): item is TipoCama =>
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.capacity_people === 'number' &&
        typeof item.description === 'string' &&
        typeof item.created_by === 'string',
    )
}