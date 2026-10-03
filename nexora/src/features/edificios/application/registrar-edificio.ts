import type { EdificioInput } from '../domain/edificio'
import type { EdificioRepository } from '../domain/edificio-repository'

export const RegistrarEdificio =
  (repository: EdificioRepository): ((input: EdificioInput) => Promise<void>) =>
  async (input: EdificioInput): Promise<void> => {
    await repository.save(input)
  }