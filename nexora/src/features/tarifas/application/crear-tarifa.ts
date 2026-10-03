import type { Tarifa, TarifaInput } from '../domain/tarifa'
import type { TarifaRepository } from '../domain/tarifa-repository'

export function CrearTarifa(repository: TarifaRepository) {
  return async (
    input: TarifaInput,
    meta?: { sedeNombre?: string; subSedeNombre?: string },
  ): Promise<Tarifa> => {
    return repository.guardar(input, meta)
  }
}
