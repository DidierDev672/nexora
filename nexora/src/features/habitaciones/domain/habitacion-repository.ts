import type { HabitacionInput } from './habitacion'

export interface HabitacionRepository {
  save(input: HabitacionInput): Promise<void>
}
