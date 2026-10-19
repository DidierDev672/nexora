import type { StatusCodeValidationResult } from '../../../shared/lib/status-code-validator'
import type { HabitacionDetalleInput } from './habitacion-detalle'

export interface HabitacionRegistroResult {
  roomId?: string
  data?: unknown
  validation?: StatusCodeValidationResult
}

export interface NextRoomNumberResult {
  nextNumber: string | null
  validation: StatusCodeValidationResult
  data?: unknown
}

export interface HabitacionDetalleRepository {
  save(input: HabitacionDetalleInput): Promise<HabitacionRegistroResult>
  getNextNumber(): Promise<NextRoomNumberResult>
}