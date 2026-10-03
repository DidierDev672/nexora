import { isAxiosError } from 'axios'
import { api } from '../../../lib/api'
import { HabitacionApiError, type HabitacionInput } from '../domain/habitacion'
import type { HabitacionRepository } from '../domain/habitacion-repository'
import { readAuthUserEmail } from '../../../shared/auth-storage'

function readCapacity(value: string): number {
  return Math.trunc(Number(value.trim()))
}

function readBasePrice(value: string): number {
  return Number(value.trim().replace(',', '.'))
}

export class ApiHabitacionRepository implements HabitacionRepository {
  async save(input: HabitacionInput): Promise<void> {
    try {
      const response = await api.post('/room-types', {
        name: input.name.trim(),
        capacity: readCapacity(input.capacity),
        base_price: readBasePrice(input.basePrice),
        created_by: readAuthUserEmail(),
      })

      if (response.status !== 201) {
        throw new HabitacionApiError(response.status)
      }
    } catch (error) {
      if (error instanceof HabitacionApiError) {
        throw error
      }
      if (isAxiosError(error)) {
        throw new HabitacionApiError(error.response?.status ?? 0)
      }
      throw new HabitacionApiError(0)
    }
  }
}