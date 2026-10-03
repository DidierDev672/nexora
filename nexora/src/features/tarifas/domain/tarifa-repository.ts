import type { Tarifa, TarifaInput } from './tarifa'

export interface TarifaRepository {
  guardar(input: TarifaInput, meta?: { sedeNombre?: string; subSedeNombre?: string }): Promise<Tarifa>
  listar(): Promise<Tarifa[]>
}
