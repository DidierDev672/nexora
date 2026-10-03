import type { HabitacionDetalleInput } from '../domain/habitacion-detalle'
import type {
  HabitacionDetalleRepository,
  HabitacionRegistroResult,
} from '../domain/habitacion-detalle-repository'

export const RegistrarHabitacionDetalle =
  (repository: HabitacionDetalleRepository): ((input: HabitacionDetalleInput) => Promise<HabitacionRegistroResult>) =>
  async (input: HabitacionDetalleInput): Promise<HabitacionRegistroResult> => {
    return await repository.save(input)
  }