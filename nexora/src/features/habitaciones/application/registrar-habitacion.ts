import { newHabitacion, type Habitacion, type HabitacionInput } from '../domain/habitacion'
import type { HabitacionRepository } from '../domain/habitacion-repository'

export const RegistrarHabitacion =
  (repository: HabitacionRepository): ((input: HabitacionInput) => Promise<Habitacion>) =>
  async (input: HabitacionInput): Promise<Habitacion> => {
    const habitacion = newHabitacion(input)
    await repository.save(input)
    return habitacion
  }
