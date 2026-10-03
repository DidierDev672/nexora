import type { HabitacionDetalleInput } from './habitacion-detalle'

export interface HabitacionRegistroResult {
  roomId?: string
  data?: unknown
}

export interface HabitacionDetalleRepository {
  save(input: HabitacionDetalleInput): Promise<HabitacionRegistroResult>
}