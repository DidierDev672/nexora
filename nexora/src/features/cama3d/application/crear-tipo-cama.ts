import type { TipoCamaDraft } from '../domain/tipo-cama'
import type { TipoCamaRepository } from '../domain/tipo-cama-repository'

export function CrearTipoCama(repository: TipoCamaRepository) {
  return async function crearTipoCama(draft: TipoCamaDraft): Promise<void> {
    return repository.create(draft)
  }
}