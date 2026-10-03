import type { TipoCama } from '../domain/tipo-cama'
import type { TipoCamaRepository } from '../domain/tipo-cama-repository'

export function ObtenerTiposCama(repository: TipoCamaRepository) {
  return async function obtenerTiposCama(): Promise<TipoCama[]> {
    return repository.list()
  }
}