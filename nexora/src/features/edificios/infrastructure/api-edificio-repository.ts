import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { readTokenEmail } from '../../../shared/auth-storage'
import type { EdificioInput } from '../domain/edificio'
import { EDIFICIO_ESTADO_STATUS } from '../domain/edificio'
import { EdificioApiError } from '../domain/edificio-error'
import type { EdificioRepository } from '../domain/edificio-repository'

function readNumPisos(value: string): number {
  return Math.trunc(Number(value.trim()))
}

export class ApiEdificioRepository implements EdificioRepository {
  async save(input: EdificioInput): Promise<void> {
    try {
      const response = await api.post('/building', {
        name: input.nombre.trim(),
        floor_number: readNumPisos(input.numPisos),
        headquarters_id: input.sedeId,
        sub_headquarters_id: input.subSedeId || null,
        status: EDIFICIO_ESTADO_STATUS[input.estado],
        created_by: readTokenEmail(),
      })

      if (response.status !== 201) {
        throw new EdificioApiError(response.status)
      }
    } catch (error) {
      if (error instanceof EdificioApiError) {
        throw error
      }
      if (isAxiosError(error)) {
        throw new EdificioApiError(error.response?.status ?? 0)
      }
      throw new EdificioApiError(0)
    }
  }
}