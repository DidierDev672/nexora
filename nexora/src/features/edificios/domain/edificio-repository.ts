import type { EdificioInput } from './edificio'

export interface EdificioRepository {
  save(input: EdificioInput): Promise<void>
}