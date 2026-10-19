import type {
  HabitacionDetalleRepository,
  NextRoomNumberResult,
} from '../domain/habitacion-detalle-repository'

export const ObtenerSiguienteNumeroHabitacion =
  (repository: HabitacionDetalleRepository): (() => Promise<NextRoomNumberResult>) =>
  async (): Promise<NextRoomNumberResult> => {
    return await repository.getNextNumber()
  }
