import type { Recepcion, RecepcionPayload } from '../domain/recepcion'
import type { RecepcionRepository } from '../domain/recepcion-repository'

export function RegistrarRecepcion(repository: RecepcionRepository) {
  return async (payload: RecepcionPayload): Promise<Recepcion> => {
    return repository.createRecepcion(payload)
  }
}
