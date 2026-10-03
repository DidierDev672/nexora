import { newSede, type Sede, type SedeInput } from '../domain/sede'
import type { SedeRepository } from '../domain/sede-repository'

export const CreateSede =
  (repository: SedeRepository): ((input: SedeInput) => Sede) =>
  (input: SedeInput): Sede => {
    const sede = newSede(input)
    repository.save(sede)
    return sede
  }